const express = require("express")
const authController = require("../controllers/auth.controller")
const { authMiddleware } = require("../middleware/auth.middleware")
const upload = require("../middleware/upload.middleware")
 

const router = express.Router()


/* POST /api/auth/register */
router.post("/register", authController.userRegisterController)

// post api/register/otp-verify
router.post("/verify-otp", authController.verifyOTPController)


/* POST /api/auth/login */
router.post("/login",authController.userLoginController)

/**
 * - POST /api/auth/logout
 */
router.post("/logout", authController.userLogoutController)


router.post(
    "/adminlogin",
    authController.adminLoginController
);

router.get("/profile", authMiddleware, authController.getProfile);
router.put("/profile", authMiddleware, authController.updateProfile);
 
router.post("/set-pin",authMiddleware, authController.setTransactionPin)

//upload profile photo
router.post("/profile/photo", authMiddleware,upload.single("profilePhoto"),
authController.uploadphoto
)

//get profile photo
router.get("/profile/photo",authMiddleware,authController.getProfilePhoto)

module.exports = router