const express = require("express");
const {
  signup,
  login,
  forgotPassword,
  resetPassword,
  updatePassword,
  protect,
  updateMe,
  deleteMe,
  restrictTo,
} = require("../controllers/authenticationController");

const {
  createUser,
  updateUser,
  deleteUser,
  getAllUsers,
  getUser,
  getStatics,
  uploadUserPhoto,
  resizeUserPhoto,
} = require("../controllers/userController");

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.delete("/deleteUser", protect, deleteMe);
router.post("/forgotPassword", forgotPassword);
router.patch("/resetPassword/:token", resetPassword);
router.patch("/updatePassword", protect, updatePassword);
router.patch("/updateMe", protect, uploadUserPhoto, resizeUserPhoto, updateMe);

router.route("/statistics").get(getStatics);
router.route("/").get(getAllUsers);
router.route("/:id").get(getUser).put(updateUser).delete(deleteUser);

module.exports = router;
