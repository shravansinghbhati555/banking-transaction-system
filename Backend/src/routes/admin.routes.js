const express = require("express");

const authMiddleware = require("../middleware/auth.middleware");
const adminController = require("../controllers/admin.controller");

const router = express.Router();


// All users
router.get(
    "/users",
    authMiddleware.authSystemUserMiddleware,
    adminController.getAllUsers
);


// All accounts
router.get(
    "/accounts",
    authMiddleware.authSystemUserMiddleware,
    adminController.getAllAccounts
);


// All transactions
router.get(
    "/transactions",
    authMiddleware.authSystemUserMiddleware,
    adminController.getAllTransactions
);


// Dashboard statistics
router.get(
    "/stats",
    authMiddleware.authSystemUserMiddleware,
    adminController.getAdminStats
);


module.exports = router;