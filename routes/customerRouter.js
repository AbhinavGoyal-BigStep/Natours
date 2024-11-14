const express = require("express");
const { protect } = require("../controllers/authenticationController");
const { getCustomers, getCustomer } = require("../controllers/");

const router = express.Router();

router.get("/:customer_ID", protect, getCustomer);
router.get("/", protect, getCustomers);

module.exports = router;
