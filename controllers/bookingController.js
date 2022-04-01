const Stripe = require("stripe");
const stripe = Stripe(
  "sk_test_51KjMEUSDK18ZN4o4qeSsw9Zuym8A61WNqIHlETLKCqP2FMC8epdANL4otmbuf8nREVxp5e5KOAf2FH9zir6IDmre00XER3DjWG"
);
const catchAsync = require("../utils/catchAsync");
const Tour = require("../models/tourModule");

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.tourId);

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    success_url: `${req.protocol}://${req.get("host")}/`,
    cancel_url: `${req.protocol}://${req.get("host")}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    line_items: [
      {
        name: `${tour.name} Tour`,
        description: tour.summary,
        // images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
        amount: tour.price * 100,
        currency: "usd",
        quantity: 1,
      },
    ],
  });

  // 3) Create session as response
  res.status(200).json({
    status: "success",
    session,
  });
});
