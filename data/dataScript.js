const mongoose = require("mongoose");
const dotenv = require("dotenv");
const fs = require("fs");
const Tour = require("../models/tourModule");
const Review = require("../models/reviewModel");
const User = require("../models/userModel");

dotenv.config({ path: "../config.env" });

const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Database connetion Successfull"))
  .catch(() => console.log("Some error accur in database connection"));

const data = JSON.parse(fs.readFileSync("tours.json", "utf-8"));
const reviews = JSON.parse(fs.readFileSync("reviews.json", "utf-8"));
const users = JSON.parse(fs.readFileSync("users.json", "utf-8"));

const insertData = async () => {
  try {
    await Tour.create(data);
    console.log("Successfully inserted data in the database");
  } catch (error) {
    console.log(error);
    console.log("Some eror accured");
  }
};

const deleteData = async () => {
  try {
    await Tour.deleteMany();
    console.log("Successfully deleted data from the database");
  } catch (error) {
    console.log(error);
    console.log("Some eror accured");
  }
};

const insertReviews = async () => {
  try {
    await Review.create(reviews);
    console.log("Successfully inserted Reviews in the database");
  } catch (error) {
    console.log(error);
    console.log("Some eror accured");
  }
};

const insertUsers = async () => {
  try {
    await User.create(users, { validateBeforeSave: false });
    console.log("Successfully inserted users in the database");
  } catch (error) {
    console.log(error);
    console.log("Some eror accured");
  }
};

const deleteReviews = async () => {
  try {
    await Review.deleteMany();
    console.log("Successfully deleted reviews from the database");
  } catch (error) {
    console.log(error);
    console.log("Some eror accured");
  }
};

const deleteUsers = async () => {
  try {
    await User.deleteMany();
    console.log("Successfully deleted user from the database");
  } catch (error) {
    console.log(error);
    console.log("Some eror accured");
  }
};

if (process.argv[2] == "--import") {
  insertData();
} else if (process.argv[2] == "--delete") {
  deleteData();
} else if (process.argv[2] == "--importReviews") {
  insertReviews();
} else if (process.argv[2] == "--deleteReviews") {
  deleteReviews();
} else if (process.argv[2] == "--importUsers") {
  insertUsers();
} else if (process.argv[2] == "--deleteUsers") {
  deleteUsers();
}
console.log(process.argv);
