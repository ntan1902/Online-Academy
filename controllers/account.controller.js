const express = require("express");
const bcrypt = require("bcryptjs");
const moment = require("moment");
const userModel = require("../models/user.model");
const auth = require("../middlewares/auth.mdw");
const router = express.Router();

router.get("/signin", function (req, res) {
  res.render("vwAccount/signin", { layout: "main.hbs" });
});

router.post('/signin', async function (req, res) {
  const user = await userModel.singleByUserName(req.body.username);
  if (user === null) {
    return res.render('vwAccount/signin', {
      layout: "main.hbs",
      err_message: 'Invalid username.'
    });
  }

  const ret = bcrypt.compareSync(req.body.password, user.password);
  if (ret === false) {
    return res.render('vwAccount/signin', {
      layout: "main.hbs",
      err_message: 'Invalid password.'
    });
  }

  req.session.auth = true;
  req.session.authUser = user;
  const url = req.session.retUrl || '/';
  res.redirect(url);
})
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

router.get("/isAvailable", auth, async function (req, res) {
  const username = req.query.user;
  const user = await userModel.singleByUserName(username);
  if (user === null) {
    return res.json(true);
  }

  res.json(false);
});

router.get("/profile", auth, async function (req, res) {
  const user = await userModel.single(req.session.authUser.id);
  user.dob = moment(user.dob, "YYYY-MM-DD").format("DD/MM/YYYY");
  res.render("vwAccount/edit", {
    user
  });
});


router.post("/patch", auth, async function (req, res) {
  req.body.dob = moment(req.body.dob, "DD/MM/YYYY").format("YYYY-MM-DD");
  await userModel.patch(req.body);
  req.session.authUser = await userModel.singleByUserName(req.body.username);
  res.redirect("/account/profile");
});

router.get("/changePassword", auth, async function (req, res) {
  const user = await userModel.single(req.session.authUser.id);
  res.render("vwAccount/changePassword", {
    user
  });
});

router.get("/isValidPassword", auth, async function (req, res) {
  const password = req.query.password;
  const ret = bcrypt.compareSync(password, req.session.authUser.password);
  if (ret === false) {
    return res.json(false);
  }
  return res.json(true);
});

router.post("/changePassword", auth, async function (req, res) {
  const hash = bcrypt.hashSync(req.body.newPassword, 10);
  await userModel.patch({
    id: req.session.authUser.id,
    password: hash
  });

  req.session.authUser = await userModel.single(req.session.authUser.id);
  res.redirect("/account/changePassword");
});



router.post("/signout", auth, async function (req, res) {
  req.session.auth = false;
  req.session.authUser = null;
  req.session.retUrl = null;

  const url = req.headers.referer || '/';
  res.redirect(url);
})
module.exports = router;
