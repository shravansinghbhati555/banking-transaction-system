const { Router } = require("express");
const authMiddleware = require("../middleware/auth.middleware");
const transactionController = require("../controllers/transaction.controller");

const transactionRoutes = Router();
 



   // POST /api/transactions
  // Create a new transaction
 
transactionRoutes.post(
    "/",
    authMiddleware.authMiddleware,
    transactionController.createTransaction
);


/**
 * POST /api/transactions/system/initial-funds
 * Create initial funds transaction
 */
transactionRoutes.post(
    "/system/initial-funds",
    authMiddleware.authSystemUserMiddleware,
    transactionController.createInitialFundsTransaction
);


//trasaction id search

transactionRoutes.get("/", authMiddleware.authMiddleware, transactionController.getUserTransactions
)

transactionRoutes.get("/:transactionId", transactionController.getTransactionById)

module.exports = transactionRoutes;