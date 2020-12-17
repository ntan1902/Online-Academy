const express = require("express");
const bcrypt = require("bcryptjs");
const moment = require("moment");
const userModel = require("../models/user.model");
const router = express.Router();

router.get("/signin", function (req, res) {
  res.render("vwAccount/signin", { layout: "main.hbs" });
});

router.get("/signup", function (req, res) {
  res.render("vwAccount/signup", { layout: "main.hbs" });
});

router.post("/signup", async function (req, res) {
  const hash = bcrypt.hashSync(req.body.password, 10);
  const dob = moment(req.body.dob, "DD/MM/YYYY").format("YYYY-MM-DD");
  const user = {
    username: req.body.username,
    password: hash,
    fullname: req.body.fullname,
    email: req.body.email,
    dob: dob,
    role: req.body.role,
  };

  await userModel.add(user);
  res.render("vwAccount/signup");
});

router.get("/isAvailable", async function (req, res) {
  const username = req.query.user;
  const user = await userModel.singleByUserName(username);
  if (user === null) {
    return res.json(true);
  }

  res.json(false);
});

module.exports = router;
