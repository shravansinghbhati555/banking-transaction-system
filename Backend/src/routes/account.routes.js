const express = require("express");

const authMiddleware = require("../middleware/auth.middleware");

const accountController = require("../controllers/account.controller");


const router = express.Router();


// CREATE ACCOUNT
router.post(
    "/",
    authMiddleware.authMiddleware,
    accountController.createAccountController
);


// GET USER ACCOUNTS
router.get(
    "/",
    authMiddleware.authMiddleware,
    accountController.getUserAccountsController
);


// GET BALANCE
router.get(
    "/balance/:accountId",
    authMiddleware.authMiddleware,
    accountController.getAccountBalanceController
);

router.get(
    "/number/:accountNumber",
    authMiddleware.authMiddleware,
    accountController.getAccountByNumberController
);



module.exports = router;