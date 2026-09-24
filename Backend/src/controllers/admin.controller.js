const userModel = require("../models/user.model");
const accountModel = require("../models/account.model");
const transactionModel = require("../models/transaction.model");


// ===============================
// GET ALL USERS
// ===============================

async function getAllUsers(req, res) {

    try {

        const users = await userModel
            .find()
            .select("_id name email systemUser createdAt");

        res.status(200).json({
            users
        });

    } catch (error) {

        console.log("GET ALL USERS ERROR:", error);

        res.status(500).json({
            message: "Failed to get users"
        });
    }
}


// ===============================
// GET ALL ACCOUNTS
// ===============================

async function getAllAccounts(req, res) {

    try {

        const accounts = await accountModel
            .find()
            .populate("user", "name email")
            .sort({ createdAt: -1 });

        res.status(200).json({
            accounts
        });

    } catch (error) {

        console.log("GET ALL ACCOUNTS ERROR:", error);

        res.status(500).json({
            message: "Failed to get accounts"
        });
    }
}


// ===============================
// GET ALL TRANSACTIONS
// ===============================

async function getAllTransactions(req, res) {

    try {

        const transactions = await transactionModel
            .find()
            .populate("fromAccount", "accountNumber")
            .populate("toAccount", "accountNumber")
            .sort({ createdAt: -1 });

        res.status(200).json({
            transactions
        });

    } catch (error) {

        console.log("GET ALL TRANSACTIONS ERROR:", error);

        res.status(500).json({
            message: "Failed to get transactions"
        });
    }
}


// ===============================
// ADMIN STATS
// ===============================

async function getAdminStats(req, res) {

    try {

        const totalUsers = await userModel.countDocuments({
            systemUser: false
        });

        const totalAccounts = await accountModel.countDocuments();

        const totalTransactions =
            await transactionModel.countDocuments();

        const completedTransactions =
            await transactionModel.countDocuments({
                status: "COMPLETED"
            });

        const pendingTransactions =
            await transactionModel.countDocuments({
                status: "PENDING"
            });

        const failedTransactions =
            await transactionModel.countDocuments({
                status: "FAILED"
            });


        res.status(200).json({

            stats: {
                totalUsers,
                totalAccounts,
                totalTransactions,
                completedTransactions,
                pendingTransactions,
                failedTransactions
            }

        });

    } catch (error) {

        console.log("GET ADMIN STATS ERROR:", error);

        res.status(500).json({
            message: "Failed to get admin stats"
        });
    }
}


module.exports = {
    getAllUsers,
    getAllAccounts,
    getAllTransactions,
    getAdminStats
};