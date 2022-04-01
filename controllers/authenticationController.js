const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const sendEmail = require("../email");
const User = require("../models/userModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

const signToken = (object) => {
  return (token = jwt.sign(object, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  }));
};

const createToken = (user, statusCode, res) => {
  const token = signToken({ id: user._id });

  res.cookie("jwt", token, {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  });

  res.status(statusCode).json({
    status: "success",
    token,
  });
};

const filterObject = (filterObject, ...allowedFields) => {
  const obj = {};

  Object.keys(filterObject).forEach((el) => {
    if (allowedFields.includes(el)) {
      obj[el] = filterObject[el];
    }
  });

  return obj;
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConform: req.body.passwordConform,
    passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role,
  });

  createToken(newUser, 200, res);
  // const token = signToken({ id: newUser._id });

  // res.status(201).json({
  //   status: "Success",
  //   token,
  //   data: newUser,
  // });
});

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new AppError("Please provide email and password"), 400);
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.correctPassword(password, user.password))) {
      return next(new AppError("Invalid User", 404));
    }

    token = signToken({ id: user._id });

    res.status(200).json({
      status: "Success",
      token: token,
    });
  } catch (error) {
    console.log(error);
    res.send("server error");
  }
};

exports.protect = catchAsync(async (req, res, next) => {
  //get token and check if it exists
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new AppError("user is not logegd in, login to get access", 401)
    );
  }
  //validate the token
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  //check if the user exists
  const user = await User.findOne({ _id: decoded.id });

  if (!user) {
    return next(
      new AppError("the user belong to this token is no longr exists", 401)
    );
  }

  //Check if user changed password after the token issued..
  if (user.changePasswordAfter(decoded.iat)) {
    next(new AppError("user changed password. please Login again..!!", 401));
  }

  //Grant excess to protected route
  req.user = user;
  next();
});

exports.restrictTo = (...roles) => {
  return async (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError("you are not permited to this route", 401));
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  if (!email) {
    return next(new AppError("email is required", 404));
  }

  //find user with the given email..

  const user = await User.findOne({ email });
  if (!user) {
    return next(new AppError("user not found", 404));
  }

  //generate a randm reset token..
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false }); //as we updated the fields of this user, we need to save the changes..

  //send resetToken through Email..
  const resetUrl = `${req.protocal}://${req.get(
    "host"
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit your new password and conform password on the url ${resetUrl}.\nIf this is not you thank Please ignore this email..!!`;

  try {
    await sendEmail({
      email: user.email,
      subject: "your reset token, valid for 10 mins",
      message,
    });

    res.status(200).json({
      status: "success",
      message: "token send on the email",
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new AppError("error sending the email", 500));
  }
});
exports.resetPassword = catchAsync(async (req, res, next) => {
  // get User based on token
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  //if token is not expired , and user is there , set the new password
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gte: Date.now() },
  });

  if (!user) {
    return next(new AppError("Token is invalid Or has expired", 400));
  }

  //update change password at property
  user.password = req.body.password;
  user.passwordConform = req.body.passwordConform;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();

  //log the user in, sent JWT

  const token = signToken({ id: user._id });

  res.status(200).json({
    status: "Success",
    token: token,
  });
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  let { currentPassword, newPassword, conformPassword } = req.body;
  //getUser from the collection
  const id = req.user.id;
  const user = await User.findOne({ _id: id }).select("+password");

  //check the old password..
  //check if the posted password is correct...
  if (!user.correctPassword(currentPassword, user.password)) {
    return next(new AppError("Incorrect Password..!", 404));
  }

  //updatee new password
  user.password = newPassword;
  user.passwordConform = conformPassword;
  await user.save();

  const token = signToken({ id: user._id });

  res.status(200).json({
    status: "Success",
    token: token,
  });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  // console.log(req.file);
  // console.log(req.body);
  if (req.body.password || req.body.passwordConform) {
    return next(new AppError("password can not be updated", 400));
  }

  const filterdObject = filterObject(req.body, "name", "email");
  if (req.file) filterdObject.photo = req.file.filename;

  const updatedUser = await User.findByIdAndUpdate(req.user.id, filterdObject, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: "Success",
    user: updatedUser,
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { isActive: false });

  res.status(200).json({
    status: "Success",
    data: null,
  });
});

exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      // 1) verify token
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );

      // 2) Check if user still exists
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next();
      }

      // 3) Check if user changed password after the token was issued
      if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }

      // THERE IS A LOGGED IN USER
      res.locals.user = currentUser;
      return next();
    } catch (err) {
      return next();
    }
  }
  next();
};
