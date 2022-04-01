const express = require("express");
const app = express();
const tourRouter = require("./routes/tourRouter");
const userRouter = require("./routes/userRouter");
const reviewRouter = require("./routes/reviewRouter");
const viewRouter = require("./routes/viewRouter");
const bookingRouter = require("./routes/bookingRouter");
const AppError = require("./utils/appError");
const globalErrorHandler = require("./errorController");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const path = require("path");
const cookieParser = require("cookie-parser");

//Server side rendering using pug....
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

app.use(helmet());
app.use(express.json());
app.use(mongoSanitize());
app.use(xss());
app.use(
  hpp({
    whitelist: ["duration"],
  })
);

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "too many requests from your side",
});
app.use(cookieParser());

app.use("/api", limiter);

app.use("/", viewRouter);
const baseURL = "/api/v1";
app.use(`${baseURL}/tours`, tourRouter);
app.use(`${baseURL}/users`, userRouter);
app.use(`${baseURL}/reviews`, reviewRouter);
app.use(`${baseURL}/bookings`, bookingRouter);

app.all("*", (req, res, next) => {
  next(new AppError(`can not find ${req.originalUrl} url on this server`, 404));
});

app.use(globalErrorHandler);
module.exports = app;
