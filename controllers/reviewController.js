const catchAsync = require("../utils/catchAsync");
const Review = require("../models/reviewModel");
const APIFeatures = require("../utils/apiFeatures");
const factoryFunction = require("./handlerFactory");

exports.setReview = catchAsync(async (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
});

exports.getAllreviews = factoryFunction.getAll(Review);
exports.updateReview = factoryFunction.updateOne(Review);
exports.createReview = factoryFunction.createOne(Review);
exports.deleteReview = factoryFunction.deleteOne(Review);
