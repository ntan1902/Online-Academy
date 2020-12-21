const express = require("express");
const userModel = require("../models/user.model");
const moment = require("moment");
const router = express.Router();

router.get("/", async function (req, res) {
  const list = await userModel.all();
  list.forEach((element) => {
    element.dob = moment(element.dob, "YYYY-MM-DD").format("DD/MM/YYYY");
  });
  res.render("vwUsers/index", {
    list: list,
    empty: list.length === 0,
  });
});

router.get("/add", async function (req, res) {
  res.render("vwUsers/add");
});

router.post("/add", async function (req, res) {
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
  res.render("vwUsers/add");
});

router.get("/edit/:id", async function (req, res) {
  const id = req.params.id;
  const user = await userModel.single(id);

  if (user === null) {
    return res.redirect("/admin/users");
  }
  user.dob = moment(user.dob, "YYYY-MM-DD").format("DD/MM/YYYY");
  res.render("vwUsers/edit", {
    user,
  });
});

router.post("/delete/", async function (req, res) {
  await userModel.delete(req.body.id);
  res.redirect("/admin/users");
});

router.post("/patch/", async function (req, res) {
  req.body.dob = moment(req.body.dob, "DD/MM/YYYY").format("YYYY-MM-DD");
  await userModel.patch(req.body);
  res.redirect("/admin/users");
});

module.exports = router;
