const User = require("../models/userModel");
const APIFields = require("../utils/apiFeatures");
const factoryFunction = require("./handlerFactory");
const multer = require("multer");
const sharp = require("sharp");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "public/img/users");
//   },
//   filename: (req, file, cb) => {
//     const ext = file.mimetype.split("/")[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   },
// });
const multerStorage = multer.memoryStorage();
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("not a photo! upload only Photo!!", 400), false);
  }
};
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

const uploadUserPhoto = upload.single("photo");
const resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
});

const getStatics = async (req, res) => {
  try {
    const user = await User.aggregate([
      {
        $group: {
          _id: "$age",
          count: { $sum: 1 },
          names: { $push: "$name" },
        },
      },
      {
        $sort: { _id: -1 },
      },
    ]);
    res.status(200).json({
      status: "success",
      data: user,
    });
  } catch (error) {
    // console.log(error);
    res.status(404).json({
      ststus: "fail",
      error,
    });
  }
};

const getAllUsers = factoryFunction.getAll(User);
const getUser = factoryFunction.getOne(User);
const createUser = factoryFunction.createOne(User);
const updateUser = factoryFunction.updateOne(User);
const deleteUser = factoryFunction.deleteOne(User);

module.exports = {
  getAllUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  getStatics,
  uploadUserPhoto,
  resizeUserPhoto,
};
