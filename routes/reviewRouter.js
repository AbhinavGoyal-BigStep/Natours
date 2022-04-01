const express = require("express");

const {
  restrictTo,
  protect,
} = require("../controllers/authenticationController");

const {
  getAllreviews,
  createReview,
  deleteReview,
  setReview,
  updateReview,
} = require("../controllers/reviewController");

const router = express.Router({ mergeParams: true });

router
  .route("/")
  .get(getAllreviews)
  .post(protect, restrictTo("user"), setReview, createReview);

router.route("/:id").delete(deleteReview).patch(updateReview);

module.exports = router;
