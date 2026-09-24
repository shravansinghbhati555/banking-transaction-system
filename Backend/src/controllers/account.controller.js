const accountModel = require("../models/account.model");


// CREATE ACCOUNT
async function createAccountController(req, res) {

    try {

        const user = req.user;

        // Check account already exists
        const existingAccount = await accountModel.findOne({
            user: user._id
        });

        if (existingAccount) {
            return res.status(400).json({
                message: "Account already exists",
                account: existingAccount
            });
        }


        // Create new account
        const account = await accountModel.create({
            user: user._id
        });


        res.status(201).json({
            message: "Account created successfully",
            account
        });

    } catch (error) {

        console.log("CREATE ACCOUNT ERROR:", error);

        res.status(500).json({
            message: "Account creation failed"
        });
    }
}


// GET USER ACCOUNTS
async function getUserAccountsController(req, res) {

    try {

        const accounts = await accountModel.find({
            user: req.user._id
        });


        res.status(200).json({
            accounts
        });

    } catch (error) {

        console.log("GET ACCOUNTS ERROR:", error);

        res.status(500).json({
            message: "Failed to get accounts"
        });
    }
}


// GET ACCOUNT BALANCE
async function getAccountBalanceController(req, res) {

    try {

        const { accountId } = req.params;


        const account = await accountModel.findOne({
            _id: accountId,
            user: req.user._id
        });


        if (!account) {

            return res.status(404).json({
                message: "Account not found"
            });
        }


        const balance = await account.getBalance();


        res.status(200).json({
            accountId: account._id,
            accountNumber: account.accountNumber,
            balance
        });

    } catch (error) {

        console.log("BALANCE ERROR:", error);

        res.status(500).json({
            message: "Failed to get account balance"
        });
    }
}


// GET ACCOUNT BY ACCOUNT NUMBER
async function getAccountByNumberController(req, res) {

    try {

        const { accountNumber } = req.params;

        const account = await accountModel.findOne({
            accountNumber: accountNumber,
            status: "ACTIVE"
        }).select("_id accountNumber status");


        if (!account) {

            return res.status(404).json({
                message: "Account not found"
            });

        }


        res.status(200).json({
            account
        });


    } catch (error) {

        console.log(
            "GET ACCOUNT BY NUMBER ERROR:",
            error
        );

        res.status(500).json({
            message: "Failed to find account"
        });

    }

}


module.exports = {
    createAccountController,
    getUserAccountsController,
    getAccountBalanceController,
    getAccountByNumberController
};