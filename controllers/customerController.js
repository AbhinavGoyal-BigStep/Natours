const catchAsync = require("../utils/catchAsync");
const Review = require("../models/reviewModel");
const APIFeatures = require("../utils/apiFeatures");
const factoryFunction = require("./handlerFactory");

exports.getCustomer = factoryFunction.getAll(Review);
exports.getCustomers = factoryFunction.getOne(Review);

