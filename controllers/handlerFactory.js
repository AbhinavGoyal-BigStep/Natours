const APIFeatures = require("../utils/apiFeatures");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findOneAndDelete(req.params.id);

    if (!doc) {
      return next(new AppError(`No ${Model} found with this id`, 404));
    }

    res.status(200).json({
      status: "success",
      data: doc,
    });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc) {
      return next(new AppError(`No ${Model} found with this id`, 404));
    }

    res.status(200).json({
      status: "success",
      data: doc,
    });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const data = req.body;
    const doc = await Model.create(data);
    if (!doc) {
      return next(new AppError(`No ${Model} With this Id....`, 404));
    }
    res.status(200).json({
      status: "success",
      data: doc,
    });
  });

exports.getOne = (Model, populate) =>
  catchAsync(async (req, res, next) => {
    let doc = Model.findById(req.params.id);

    if (populate) {
      doc = doc.populate(populate);
    }

    doc = await doc;

    if (!doc) {
      return next(new AppError(`No ${Model} With this Id....`, 404));
    }

    res.status(200).json({
      status: "success",
      data: doc,
    });
  });

exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    //to allor nested get reviews on tour
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };
    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const doc = await features.query;

    res.status(200).json({
      length: doc.length,
      status: "success",
      data: doc,
    });
  });
