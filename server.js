const mongoose = require("mongoose");
const dotenv = require("dotenv");
process.on("unhandledRejection", (err) => {
  console.log(err.name, err.message);
});

process.on("uncaughtException", (err) => {
  console.log(err.name, err.message);
});

const app = require("./app");

dotenv.config({ path: "./config.env" });

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
  .then(() => console.log("Database connection successful.."));

const port = 8080;

app.listen(port, () => {
  console.log("listening from the port " + port);
});
