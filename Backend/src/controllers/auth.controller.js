const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");
const emailService = require("../services/email.service");
const tokenBlackListModel = require("../models/blackList.model");
const bcrypt = require("bcrypt")

/**
 * - user register controller
 * - POST /api/auth/register
 */
async function userRegisterController(req, res) {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({
        message: "Name, email and password are required",
        status: "failed",
      });
    }

    const isExists = await userModel.findOne({ email });

    if (isExists) {
      return res.status(422).json({
        message: "User already exists with email.",
        status: "failed",
      });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // OTP valid for 5 minutes
    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // Create user
    const user = await userModel.create({
      email,
      password,
      name,
      otp,
      otpExpiresAt,
      isVerified: false,
    });

    // Send OTP email
    await emailService.sendOTPEmail(user.email, user.name, otp);

    return res.status(201).json({
      message: "Registration successful. OTP sent to your email.",
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.log("REGISTER ERROR:", error);

    return res.status(500).json({
      message: "Registration failed",
    });
  }
}

/**
 * - User Login Controller
 * - POST /api/auth/login
 */

async function userLoginController(req, res) {
  const { email, password } = req.body;

  const user = await userModel.findOne({ email }).select("+password");

  if (!user) {
    return res.status(401).json({
      message: "Email or password is INVALID",
    });
  }

  const isValidPassword = await user.comparePassword(password);

  if (!isValidPassword) {
    return res.status(401).json({
      message: "Email or password is INVALID",
    });
  }

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: "3d",
  });

  res.cookie("token", token);

  res.status(200).json({
    user: {
      _id: user._id,
      email: user.email,
      name: user.name,
    },
    token,
  });
}

/**
 * - User Logout Controller
 * - POST /api/auth/logout
 */
async function userLogoutController(req, res) {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(200).json({
      message: "User logged out successfully",
    });
  }

  await tokenBlackListModel.create({
    token: token,
  });

  res.clearCookie("token");

  res.status(200).json({
    message: "User logged out successfully",
  });
}

//adminlogincontroller

async function adminLoginController(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const user = await userModel
      .findOne({ email })
      .select("+password +systemUser");

    if (!user) {
      return res.status(401).json({
        message: "Invalid admin credentials",
      });
    }

    if (user.systemUser !== true) {
      return res.status(403).json({
        message: "You are not authorized as admin",
      });
    }

    const isValidPassword = await user.comparePassword(password);

    if (!isValidPassword) {
      return res.status(401).json({
        message: "Invalid admin credentials",
      });
    }

    const token = jwt.sign(
      {
        userId: user._id,
        systemUser: true,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "3d",
      },
    );

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
    });

    return res.status(200).json({
      message: "Admin login successful",

      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        systemUser: user.systemUser,
      },

      token,
    });
  } catch (error) {
    console.log("ADMIN LOGIN ERROR:", error);

    return res.status(500).json({
      message: "Admin login failed",
    });
  }
}

//otp controller 
async function verifyOTPController(req,res){
    try {
        const {email, otp} = req.body;

        if(!email || !otp){
            return res.status(400).json({
                message: "Email and otp are required"
            })
        }
        const user = await userModel.findOne({ email}).select("+otp +otpExpiresAt")

        if(!user){
            return res.status(400).json({
                message: "Account already verified"
            })
        }

        //otp expired
        if(!user.otpExpiresAt || user.otpExpiresAt < new Date()){
            return res.status(400).json({
                message: "OTP hes expired"
            })
        }

        //wrong otp
        if(user.otp !==otp){
            return res.status(400).json({
                message: "Invalid OTP"
            })
        }

        //verify user
        user.isVerified = true
        user.otp = undefined
        user.otpExpiresAt = undefined

        await user.save();

        return res.status(200).json({
            message: "Email verified successfully"
        })

    } catch (error) {
        return res.status(500).json({
            message: "OTP verification failed"
        })
    }
}

//profile controller 
async function getProfile (req, res){
  try {
    const user = await userModel.findById(req.user.id).select("-password -transactionPin")

    if(!user){
      return res.status(404).json({
        message: "User not found"
      });
    }

    res.status(200).json({
      success: true,
      user
    })
  } catch (error) {
    console.log("profile error:", error);

    res.status(500).json({
      success: false,
      message: "Server error"
    })
  }
}

//pin set controller 
async function setTransactionPin(req, res){
  try {
    const { pin, confirmPin } = req.body;

    if(!pin || !confirmPin){
      return res.status(400).json({
        success: false,
        message: "PIN and confirm PIN are required"
      })
    }

    if(!/^\d{4}$/.test(pin)){
      return res.status(400).json({
        success: false,
        message: "PIN must be exactly 4 digits"
      })
    }

    if(pin !== confirmPin){
      return res.status(400).json({
        success: false,
        message: "PINs do not match"
      })
    }

  const user = await userModel.findById(req.user.id)

  if(!user){
    return res.status(400).json({
        success: false,
        message: "User not found"
      })
  }

  if(user.transactionPin){
    return res.status(400).json({
        success: false,
        message: "Transaction PIN already exists"
      })
  }

  const heshedPin = await bcrypt.hash(pin, 10)
  user.transactionPin = heshedPin
  await user.save()

  return res.status(200).json({
        success: true,
        message: "Transaction PIN set successfully"
      })
  } catch (error) {
    console.log("SET PIN ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to set transaction PIN",
    });

  }
}

//profile me update 

async function updateProfile(req, res) {
  try {
    const { email, mobile, address } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await userModel.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if email is already used by another user
    const existingUser = await userModel.findOne({
      email,
      _id: { $ne: user._id },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already exists",
      });
    }

    user.email = email;
    user.mobile = mobile || "";
    user.address = address || "";

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        address: user.address,
      },
    });
  } catch (error) {
    console.log("UPDATE PROFILE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update profile",
    });
  }
}

// upload photo

async function uploadphoto(req, res){
  try {
    if(!req.file){
      return res.status(400).json({
        success: false,
        message: "Please select an image"
      })
    }

    const userId = req.user._id || req.user.id;
    const user = await userModel.findById(userId);

    if(!user){
      return res.status(404).json({
        success: false,
        message: "User not found"
      })
    }

    user.profilePhoto = {
      data: req.file.buffer,
      contentType: req.file.mimetype
    }

    await user.save()

    res.status(200).json({
      success: true,
      message: "Profile photo uploaded successfully",
    })
  } catch (error) {
    console.error("upload profile photo error:", error)

    res.status(500).json({
      success: false,
      message: "Failed to upload profile photo",
      error: error.message
    })
  }
}

//profile photo get api

async function getProfilePhoto(req, res){
   try {
    const userId = req.user._id || req.user.id;
    const user = await userModel.findById(userId).select("profilePhoto")

    if(!user){
      return res.status(404).json({
        message: "User not found"
      })
    }

    if(!user.profilePhoto || !user.profilePhoto.data){
      return res.status(404).json({
        message: "Profile photo not found"
      })
    }

    res.set("Content-Type", user.profilePhoto.contentType)
    res.send(user.profilePhoto.data);
   } catch (error) {
      console.error("Get profile photo error:", error)

      res.status(500).json({
        message: "Failed to get profile photo"
      })
   }
}

module.exports = {
  userRegisterController,
  userLoginController,
  userLogoutController,
  adminLoginController,
  verifyOTPController,
  getProfile,
  setTransactionPin,
  updateProfile,
  uploadphoto,
  getProfilePhoto
};
