const express = require("express");
const userModel = require("../models/user.model");
const moment = require("moment");
const router = express.Router();
const bcrypt = require("bcryptjs");
const multer = require("multer");
const path = require("path");

//Set Storage Engine
const storage = multer.diskStorage({
  destination: "./public/images/users",
  filename: function (req, file, callback) {
    callback(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 1000000 },
});

router.get("/", async function (req, res) {
  const list = await userModel.all();
  list.forEach((element) => {
    element.dob = moment(element.dob, "YYYY-MM-DD").format("DD/MM/YYYY");
  });
  res.render("vwUsers/index", {
    layout: "admin.hbs",
    manageUsers: true,
    manageCourses: false,
    manageCategories: false,
    manageFeedbacks: false,
    list: list,
    empty: list.length === 0,
  });
});

router.get("/add", async function (req, res) {
  res.render("vwUsers/add", {
    layout: "admin.hbs",
    manageUsers: true,
    manageCourses: false,
  });
});

router.post("/add", upload.single("avatar"), async function (req, res) {
  const hash = bcrypt.hashSync(req.body.password, 10);
  const dob = moment(req.body.dob, "DD/MM/YYYY").format("YYYY-MM-DD");
  let imgPath;
  if (req.file === undefined) {
    imgPath = "";
  } else {
    imgPath = "/public/images/users/" + req.file.filename;
  }
  const user = {
    username: req.body.username,
    password: hash,
    fullname: req.body.fullname,
    email: req.body.email,
    dob: dob,
    role: req.body.role,
    userDescription: req.body.userDescription,
    avatar: imgPath,
  };
  await userModel.add(user);
  res.render("vwUsers/add", {
    layout: "admin.hbs",
    manageUsers: true,
    manageCourses: false,
  });
});

router.get("/edit/:id", async function (req, res) {
  const id = req.params.id;
  const user = await userModel.single(id);

  if (user === null) {
    return res.redirect("/admin/users");
  }
  user.dob = moment(user.dob, "YYYY-MM-DD").format("DD/MM/YYYY");
  res.render("vwUsers/edit", {
    layout: "admin.hbs",
    manageUsers: true,
    manageCourses: false,
    user,
  });
});

router.get("/:role", async function (req, res) {
  const users = await userModel.allByRole(req.params.role);
  res.render("vwUsers/index", {
    layout: "admin.hbs",
    manageUsers: true,
    manageCourses: false,
    manageCategories: false,
    manageFeedbacks: false,
    list: users,
    empty: users.length === 0,
  });
});

router.post("/delete/", async function (req, res) {
  await userModel.delete(req.body.id);
  res.redirect("/admin/users");
});

router.post("/patch/", upload.single("avatar"), async function (req, res) {
  const dob = moment(req.body.dob, "DD/MM/YYYY").format("YYYY-MM-DD");
  let imgPath;
  if (req.file === undefined) {
    imgPath = req.body.previewAvatar;
  } else {
    imgPath = "/public/images/users/" + req.file.filename;
  }
  const new_user = {
    idUser: req.body.idUser,
    username: req.body.username,
    fullname: req.body.fullname,
    email: req.body.email,
    dob: dob,
    role: req.body.role,
    userDescription: req.body.userDescription,
    avatar: imgPath,
  };
  await userModel.patch(new_user);
  res.redirect("/admin/users");
});

module.exports = router;
