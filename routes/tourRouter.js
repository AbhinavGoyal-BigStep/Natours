const express = require("express");
const router = express.Router();

const {
  protect,
  restrictTo,
} = require("../controllers/authenticationController");

const reviewRouter = require("./reviewRouter");

const {
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
} = require("../controllers/tourController");

// app/v1/tours/:tourId/reviews
router.use("/:tourId/reviews", reviewRouter);

router.route("/top-5-cheap").get(getTopCheap, getAllTour);

router.route("/").get(protect, getAllTour).post(createTour);

router
  .route("/:id")
  .get(getTourById)
  .delete(protect, restrictTo("admin"), deleteTour)
  .patch(uploadTourImages, resizeTourImages, updateTour);

router
  .route("/tours-within/:distance/center/:latlng/unit/:unit")
  .get(getTourWithin);

router.route("/distances/:latlng/unit/:unit").get(getDistances);
module.exports = router;
