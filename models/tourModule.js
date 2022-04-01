const mongoose = require("mongoose");
const slugify = require("slugify");

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Tour name is must"],
      trim: true,
      unique: true,
    },
    duration: {
      type: Number,
      required: [true, "Duration is must"],
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      set: (val) => Math.round(val * 10) / 10,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      requires: [true, "Price is required"],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          return this.price > val;
        },
        message: "Discount Should be less than price",
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, "summary required"],
    },
    description: {
      type: String,
      trim: true,
    },
    maxGroupSize: {
      type: Number,
      required: [true, "group size should e mentioned"],
    },
    difficulty: {
      type: String,
      required: [true, "Should have a difficulty"],
    },
    imageCover: {
      type: String,
      required: [true, "Tour should have a cover image"],
    },
    images: [String],
    createrdAt: {
      type: Date,
      default: Date.now(),
      // select: false,
    },
    startDates: [Date],
    startLocation: {
      // geoJSON object
      type: {
        type: String,
        default: "Point",
        enum: ["Point"],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: "Point",
          enum: ["Point"],
        },
        coordinates: [Number],
        address: String,
        description: String,
      },
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "User",
      },
    ],
    secretTour: {
      type: Boolean,
    },
    slug: String,
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// tourSchema.index({ price: 1 });
tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ startLocation: "2dsphere" });

tourSchema.virtual("durationInWeeks").get(function () {
  return this.duration / 7;
});

//virual populate
tourSchema.virtual("reviews", {
  ref: "Review",
  foreignField: "tour",
  localField: "_id",
});

tourSchema.pre("save", function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

tourSchema.pre(/^find/, function (next) {
  this.populate("guides");
  next();
});

// tourSchema.pre("save", async function (next) {
//   this.guides = this.guides.map((id) => User.findById({ _id: id }));

//   this.guides = await Promise.all(this.guides);

//   next();
// });

// tourSchema.pre(/^find/, function (next) {
//   this.find({ secretTour: { $eq: true } });
//   this.start = Date.now();
//   next();
// });

// tourSchema.post(/^find/, function (doc, next) {
//   console.log(doc);
//   console.log(`Query Took ${Date.now() - this.start} ms`);
//   next();
// });
const Tour = mongoose.model("Tour", tourSchema);

module.exports = Tour;
