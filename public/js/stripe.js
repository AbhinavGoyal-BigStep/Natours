import axios from "axios";
import { showAlert } from "./alerts";
const stripe = Stripe(
  "pk_test_51KjMEUSDK18ZN4o4bKSDbAEraFq3SR5TfGNWpNXMEvfLLUoFGknmRGtuNzyJ5qTAc5zy8aaR1hpBIbO9aCro154r0006ylb0sL"
);

export const bookTour = async (tourId) => {
  try {
    // 1) Get checkout session from API
    const session = await axios(
      `http://127.0.0.1:3000/api/v1/bookings/checkout-session/${tourId}`
    );
    console.log(session);

    // 2) Create checkout form + chanre credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    console.log(err);
    showAlert("error", err);
  }
};
