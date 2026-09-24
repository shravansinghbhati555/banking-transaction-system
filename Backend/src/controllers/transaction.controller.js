const transactionModel = require("../models/transaction.model")
const ledgerModel = require("../models/ledger.model")
const accountModel = require("../models/account.model")
const emailService = require("../services/email.service")
const mongoose = require("mongoose")
const bcrypt = require("bcryptjs");
const userModel = require("../models/user.model");

/**
 * - Create a new transaction
 * THE 10-STEP TRANSFER FLOW:
     * 1. Validate request
     * 2. Validate idempotency key
     * 3. Check account status
     * 4. Derive sender balance from ledger
     * 5. Create transaction (PENDING)
     * 6. Create DEBIT ledger entry
     * 7. Create CREDIT ledger entry
     * 8. Mark transaction COMPLETED
     * 9. Commit MongoDB session
     * 10. Send email notification
 */

function generateTransactionId(){
    return `TXN-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
}

async function createTransaction(req, res) {
    console.log("TRANSACTION BODY:", req.body);
    console.log("LOGGED USER:", req.user);

    /**
     * 1. Validate request
     */
    const {
        fromAccount,
        toAccount,
        amount,
        idempotencyKey,
        pin
    } = req.body;

    if (!fromAccount || !toAccount || !amount || !idempotencyKey || !pin) {
        return res.status(400).json({
            message: "FromAccount, toAccount, amount, idempotencyKey and pin are required"
        });
    }

    const fromUserAccount = await accountModel.findOne({
        _id: fromAccount,
        user: req.user._id
    });

    const toUserAccount = await accountModel.findOne({
        _id: toAccount,
    });

    if (!fromUserAccount || !toUserAccount) {
        return res.status(400).json({
            message: "Invalid fromAccount or toAccount"
        });
    }

    // Transaction PIN verification

    const user = await userModel.findById(req.user._id);

    if (!user) {
        return res.status(404).json({
            message: "User not found"
        });
    }

    if (!user.transactionPin) {
        return res.status(400).json({
            message: "Please set your transaction PIN first"
        });
    }

    const isPinValid = await bcrypt.compare(
        pin,
        user.transactionPin
    );

    if (!isPinValid) {
        return res.status(401).json({
            message: "Invalid transaction PIN"
        });
    }

     

    /**
     * 2. Validate idempotency key
     */

    const isTransactionAlreadyExists = await transactionModel.findOne({
        idempotencyKey: idempotencyKey
    })

    if (isTransactionAlreadyExists) {
        if (isTransactionAlreadyExists.status === "COMPLETED") {
            return res.status(200).json({
                message: "Transaction already processed",
                transaction: isTransactionAlreadyExists
            })

        }

        if (isTransactionAlreadyExists.status === "PENDING") {
            return res.status(200).json({
                message: "Transaction is still processing",
            })
        }

        if (isTransactionAlreadyExists.status === "FAILED") {
            return res.status(500).json({
                message: "Transaction processing failed, please retry"
            })
        }

        if (isTransactionAlreadyExists.status === "REVERSED") {
            return res.status(500).json({
                message: "Transaction was reversed, please retry"
            })
        }
    }

    /**
     * 3. Check account status
     */

    if (fromUserAccount.status !== "ACTIVE" || toUserAccount.status !== "ACTIVE") {
        return res.status(400).json({
            message: "Both fromAccount and toAccount must be ACTIVE to process transaction"
        })
    }

    /**
     * 4. Derive sender balance from ledger
     */
    const balance = await fromUserAccount.getBalance()

    if (balance < amount) {
        return res.status(400).json({
            message: `Insufficient balance. Current balance is ${balance}. Requested amount is ${amount}`
        })
    }

    let transaction;
    try {


        /**
         * 5. Create transaction (PENDING)
         */
        const session = await mongoose.startSession()
        session.startTransaction()

        const transactionId = generateTransactionId();

        transaction = (await transactionModel.create([ {
            transactionId,
            fromAccount,
            toAccount,
            amount,
            idempotencyKey,
            status: "PENDING"
        } ], { session }))[ 0 ]

        const debitLedgerEntry = await ledgerModel.create([ {
            account: fromAccount,
            amount: amount,
            transaction: transaction._id,
            type: "DEBIT"
        } ], { session })

        await (() => {
            return new Promise((resolve) => setTimeout(resolve, 15 * 1000));
        })()

        const creditLedgerEntry = await ledgerModel.create([ {
            account: toAccount,
            amount: amount,
            transaction: transaction._id,
            type: "CREDIT"
        } ], { session })

        await transactionModel.findOneAndUpdate(
            { _id: transaction._id },
            { status: "COMPLETED" },
            { session }
        )


        await session.commitTransaction()
        session.endSession()
    } catch (error) {
        
        console.log("CREATE TRANSACTION ERROR:", error);

        return res.status(400).json({
            message: "Transaction is Pending due to some issue, please retry after sometime",
        })

    }
    /**
     * 10. Send email notification
     */
    await emailService.sendTransactionEmail(req.user.email, req.user.name, amount, toAccount)

    return res.status(201).json({
        message: "Transaction completed successfully",
        transaction: transaction
    })

}

async function createInitialFundsTransaction(req, res) {
    const { toAccount, amount, idempotencyKey } = req.body

    if (!toAccount || !amount || !idempotencyKey) {
        return res.status(400).json({
            message: "toAccount, amount and idempotencyKey are required"
        })
    }

    const toUserAccount = await accountModel.findOne({
        _id: toAccount,
    })

    if (!toUserAccount) {
        return res.status(400).json({
            message: "Invalid toAccount"
        })
    }

    const fromUserAccount = await accountModel.findOne({
        user: req.user._id
    })

    if (!fromUserAccount) {
        return res.status(400).json({
            message: "System user account not found"
        })
    }


    const session = await mongoose.startSession()
    session.startTransaction()

    const transaction = new transactionModel({
        transactionId: generateTransactionId(),
        fromAccount: fromUserAccount._id,
        toAccount,
        amount,
        idempotencyKey,
        status: "PENDING"
    })

    const debitLedgerEntry = await ledgerModel.create([ {
        account: fromUserAccount._id,
        amount: amount,
        transaction: transaction._id,
        type: "DEBIT"
    } ], { session })

    const creditLedgerEntry = await ledgerModel.create([ {
        account: toAccount,
        amount: amount,
        transaction: transaction._id,
        type: "CREDIT"
    } ], { session })

    transaction.status = "COMPLETED"
    await transaction.save({ session })

    await session.commitTransaction()
    session.endSession()

    return res.status(201).json({
        message: "Initial funds transaction completed successfully",
        transaction: transaction
    })


}

async function getUserTransactions(req, res) {

    try {

        // Logged-in user ke accounts
        const accounts = await accountModel.find({
            user: req.user._id
        }).select("_id");

        const accountIds = accounts.map(account => account._id);

        // User ke accounts se related transactions
        const transactions = await transactionModel
            .find({
                $or: [
                    { fromAccount: { $in: accountIds } },
                    { toAccount: { $in: accountIds } }
                ]
            })
            .populate("fromAccount", "_id")
            .populate("toAccount", "_id")
            .sort({ createdAt: -1 });

        res.status(200).json({
            transactions
        });

    } catch (error) {

        console.log("GET TRANSACTIONS ERROR:", error);

        res.status(500).json({
            message: "Failed to get transactions"
        });
    }
}


async function getTransactionById(req, res) {
    try {
        const { transactionId } = req.params;

        if (!transactionId) {
            return res.status(400).json({
                message: "Transaction ID is required"
            });
        }

        const transaction = await transactionModel
            .findOne({
                transactionId: transactionId.trim()
            })
            .populate("fromAccount", "_id")
            .populate("toAccount", "_id");

        if (!transaction) {
            return res.status(404).json({
                message: "Transaction not found"
            });
        }

        return res.status(200).json({
            message: "Transaction found",
            transaction
        });

    } catch (error) {
        console.log("GET TRANSACTION BY ID ERROR:", error);

        return res.status(500).json({
            message: "Failed to search transaction"
        });
    }
}

module.exports = {
    createTransaction,
    createInitialFundsTransaction,
    getUserTransactions,
    getTransactionById
}
