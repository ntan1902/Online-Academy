const express = require("express");
const userModel = require("../models/user.model");
const moment = require("moment");
const router = express.Router();

router.get("/", function (req, res) {
  res.render("vwAdmin/index");
});

module.exports = router;
