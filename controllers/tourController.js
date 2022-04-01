const mongoose = require("mongoose");
const Tour = require("../models/tourModule");
const APIFeatures = require("../utils/apiFeatures");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const factoryFunction = require("./handlerFactory");
const multer = require("multer");
const sharp = require("sharp");

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

const uploadTourImages = upload.fields([
  { name: "imageCover", maxCount: 1 },
  { name: "images", maxCount: 3 },
]);

const resizeTourImages = catchAsync(async (req, res, next) => {
  // console.log(req.files);

  if (!req.files.imageCover && !req.files.images) return next();

  req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;

  // 1 Cover Images
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`public/img//tours/${req.body.imageCover}`);

  // 2 Images
  req.body.images = [];

  await Promise.all(
    req.files.images.map(async (file, i) => {
      const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;
      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat("jpeg")
        .jpeg({ quality: 90 })
        .toFile(`public/img//tours/${filename}`);

      req.body.images.push(filename);
    })
  );

  next();
});

const getTopCheap = (req, res, next) => {
  req.query.sort = "price";
  req.query.limit = "5";
  req.query.fields = "name";
  next();
};
const getAllTour = factoryFunction.getAll(Tour);
const getTourById = factoryFunction.getOne(Tour, { path: "reviews" });
const createTour = factoryFunction.createOne(Tour);
const deleteTour = factoryFunction.deleteOne(Tour);
const updateTour = factoryFunction.updateOne(Tour);
const getTourWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(",");
  const radious = unit === "mi" ? distance / 3963.2 : distance / 6378.1;
  if (!lat || !lng) {
    next(new AppError("provide latitude and longitude in the url", 400));
  }
  const query = {
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radious] } },
  };
  const tour = await Tour.find(query);
  res.status(200).json({ status: "success", results: tour.length, data: tour });
});
const getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(",");

  // const radious = unit === "mi" ? distance / 3963.2 : distance / 6378.1;
  if (!lat || !lng) {
    next(new AppError("provide latitude and longitude in the url", 400));
  }

  const multiplier = unit === "mi" ? 0.000621317 : 0.001;
  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: "point",
          coordinates: [lng * 1, lat * 1],
        },
        distanceField: "distance",
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);

  res.status(200).json({ status: "success", data: distances });
});

module.exports = {
  getAllTour,
  createTour,
  getTourById,
  getTopCheap,
  deleteTour,
  getTourWithin,
  getDistances,
  updateTour,
  uploadTourImages,
  resizeTourImages,
};
