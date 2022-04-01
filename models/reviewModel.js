const mongoose = require("mongoose");
const Tour = require("./tourModule");

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, " reviw is required"],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: [true, "ratings required"],
    },
    createdAt: {
      type: Date,
      Default: Date.now(),
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "user Id is required"],
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: "Tour",
      required: [true, "tour Id is required"],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

reviewSchema.index(
  { user: 1, tour: 1 },
  {
    unique: true,
  }
);
reviewSchema.statics.calcAverageRatings = async function (tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: "$tour",
        nRatings: { $sum: 1 },
        avgRating: { $avg: "$rating" },
      },
    },
  ]);
  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsAverage: stats[0].avgRating,
      ratingsQuantity: stats[0].nRatings,
    });
  }
};

reviewSchema.post("save", function () {
  this.constructor.calcAverageRatings(this.tour);
});

// reviewSchema.pre(/^findOneAnd/, async function (next) {
//   this.r = await this.findOne();
//   next();
// });

// this is to update the average ratings and number of ratings through (findOneAndUpdate and findOneAndDelete)
reviewSchema.post(/^findOneAnd/, async function (doc, next) {
  // i want the document instance here.....doc.constructor can also return return us the Review Model
  await doc.constructor.calcAverageRatings(doc.tour);
  next();
});

reviewSchema.pre(/^find/, function (next) {
  this.populate("user");
  next();
});
const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;
