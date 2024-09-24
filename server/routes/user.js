const express = require("express");
const {
  profile,
  register,
  login,
  test,
  getMessage,
  people,
  logout,
} = require("../controllers/User");
const router = express.Router();
router.route("/profile").get(profile);
router.route("/register").post(register);
router.route("/login").post(login);
router.route("/test").get(test);
router.route("/messages/:userID").get(getMessage);
router.route("/people").get(people);
router.route("/logout").post(logout);

module.exports = router;
