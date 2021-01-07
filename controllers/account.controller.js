const express = require("express");
const bcrypt = require("bcryptjs");
const moment = require("moment");
const userModel = require("../models/user.model");
const auth = require("../middlewares/auth.mdw").auth;
const mail = require("../controllers/mail.controller");
const multer = require("multer");
const path = require("path");
const favoriteCourses = require("../models/favoriteCourses.model");
const router = express.Router();

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

router.get("/signin", function (req, res) {
  res.render("vwAccount/signin", { layout: "main.hbs" });
});

router.post("/signin", async function (req, res) {
  const user = await userModel.singleByUserName(req.body.username);
  if (user === null) {
    return res.render("vwAccount/signin", {
      layout: "main.hbs",
      err_message: "Invalid username.",
    });
  }

  const ret = bcrypt.compareSync(req.body.password, user.password);
  if (ret === false) {
    return res.render("vwAccount/signin", {
      layout: "main.hbs",
      err_message: "Invalid password.",
    });
  }

  req.session.auth = true;
  req.session.authUser = user; //initial authen session for user
  req.session.isAdmin = user.role === "admin";
  if (req.session.isAdmin) {
    res.redirect("/admin");
  } else {
    const url = req.session.retUrl || "/";
    res.redirect(url);
  }
});
router.get("/signup", function (req, res) {
  res.render("vwAccount/signup", {
    layout: "main.hbs",
  });
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

  req.session.hash = hash;
  req.session.host = req.get("host");
  req.session.authUser = user;
  link = req.protocol + "://" + req.get("host") + "/account/verify?id=" + hash;

  mail
    .send(req.body.email, link)
    .then((response) => {
      console.log("Message sent: " + response.message);
      res.render("vwAccount/signup", {
        message: `Email is sent at ${req.body.email}. Please check your mail to verify the account`,
        type: "warning",
      });
    })
    .catch((err) => {
      console.log(error);
      res.end("Error");
    });
});

router.get("/verify", async function (req, res) {
  if (req.protocol + "://" + req.get("host") === "http://" + req.session.host) {
    console.log("Domain is matched. Information is from Authentic email");

    if (req.query.id == req.session.hash) {
      await userModel.add(req.session.authUser);

      res.render("vwAccount/signup", {
        message: `Email ${req.session.authUser.email} is been successfully verified`,
        type: "success",
      });
    } else {
      res.render("vwAccount/signup", {
        message: `Email ${req.session.authUser.email} is not verified`,
        type: "danger",
      });
    }
  } else {
    res.end("<h1>Request is from unknown source</h1>");
  }
});

router.get("/isAvailable", async function (req, res) {
  const username = req.query.user;
  const user = await userModel.singleByUserName(username);
  if (user === null) {
    return res.json(true);
  }
  res.json(false);
});

router.get("/profile", auth, async function (req, res) {
  const user = await userModel.single(req.session.authUser.idUser);
  user.dob = moment(user.dob, "YYYY-MM-DD").format("DD/MM/YYYY");
  res.render("vwAccount/edit", {
    layout: "userProfile.hbs",
    user,
    change: false,
    edit: true,
  });
});

router.post("/patch", upload.single("avatar"), auth, async function (req, res) {
  const dob = moment(req.body.dob, "DD/MM/YYYY").format("YYYY-MM-DD");
  let imgPath;
  if(req.file === undefined) {
    imgPath = req.body.previewAvatar;
  } else {
    imgPath = "/public/images/users/" + req.file.filename;
  }
  let userDescript;
  if(req.body.userDescription === "") {
    userDescript = req.body.tempUserDescription;
  } else {
    userDescript = req.body.userDescription;
  }
  const new_user = {
    idUser: req.body.idUser,
    username: req.body.username,
    fullname: req.body.fullname,
    email: req.body.email,
    dob: dob,
    role: req.body.role,
    userDescription: userDescript,
    avatar: imgPath,
  }
  console.log(new_user);
  await userModel.patch(new_user);
  req.session.authUser = await userModel.singleByUserName(req.body.username);
  res.redirect("/account/profile");
});

router.get("/changePassword", auth, async function (req, res) {
  const user = await userModel.single(req.session.authUser.idUser);
  res.render("vwAccount/changePassword", {
    layout: "userProfile.hbs",
    user,
    change: true,
    edit: false,
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
    password: hash,
  });

  req.session.authUser = await userModel.single(req.session.authUser.idUser);
  res.redirect("/account/changePassword");
});

router.post("/signout", auth, async function (req, res) {
  req.session.auth = false;
  req.session.authUser = null;
  req.session.retUrl = null;
  req.session.cart =[];
  const url = req.headers.referer || "/";
  res.redirect(url);
});

router.get("/favoriteCourses", auth, async function (req, res) {
  const list_favorites = await favoriteCourses.allByUser(req.session.authUser.idUser);
  res.render("vwAccount/favoriteCourses", {
    favorite: true,
    edit: false,
    change: false,
    layout: "userProfile.hbs",
    list_favorites,
  });
});

router.get("/favoriteCourses/add/:idCourse", async function (req, res) {
  const idStudent = req.session.authUser.idUser;
  const idCourse = req.params.idCourse;
  const new_favorite = {
    idCourse,
    idStudent,
  }
  console.log(new_favorite);
  await favoriteCourses.add(new_favorite);
  res.redirect(req.get("referer"));
});

router.get("/favoriteCourses/delete/:idCourse", async function (req, res) {
  const idStudent = req.session.authUser.idUser;
  const idCourse = req.params.idCourse;
  console.log("hi");
  await favoriteCourses.delete(idCourse, idStudent);
  res.redirect("/account/favoriteCourses");
});

module.exports = router;
