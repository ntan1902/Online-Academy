const express = require("express");
const courseModel = require("../models/course.model");
const { paginate } = require("../config/default.json");
const moment = require("moment");
const multer = require("multer");
const path = require("path");

const router = express.Router();

//Set Storage Engine
const storage = multer.diskStorage({
  destination: "./public/images/courses/",
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

router.get("/", async function (req, res, next) {
  const list_courses = await courseModel.all();

  res.render("vwCourses/index", {
    layout: "admin.hbs",
    manageUsers: false,
    manageCourses: true,
    manageCategories: false,
    manageFeedbacks: false,
    courses: list_courses,
    empty: list_courses.length === 0,
  });
});

router.get("/byField/:field", async function (req, res) {
  const field = req.params.field;
  console.log(field);
  const list_courses = await courseModel.allByCat(field);

  res.render("vwCourses/index", {
    layout: "admin.hbs",
    manageUsers: false,
    manageCourses: true,

    courses: list_courses,
    empty: list_courses.length === 0,
  });
});

router.get("/add", async function (req, res) {
  res.render("vwCourses/add", {
    layout: "admin.hbs",
    manageUsers: false,
    manageCourses: true,
  });
});

router.post("/add", upload.single("image"), async function (req, res) {
  const today = new Date();
  const lastModified = moment(today, "DD/MM/YYYY").format("YYYY-MM-DD");
  let imgPath;
  if (req.file === undefined) {
    imgPath = "";
  } else {
    imgPath = "/public/images/courses/" + req.file.filename;
  }
  console.log(req.body.field);
  const new_course = {
    imagePath: imgPath,
    price: req.body.price,
    idCat: req.body.field,
    title: req.body.title,
    description: req.body.description,
    detail: req.body.detail,
    lastModified: lastModified,
    idTeacher: req.body.idTeacher,
    status: req.body.status,
  };
  console.log(new_course);
  await courseModel.add(new_course);
  res.render("vwCourses/add", {
    layout: "admin.hbs",
    manageUsers: false,
    manageCourses: true,
  });
});

router.get("/edit/:id", async function (req, res) {
  const id = req.params.id;
  const course = await courseModel.single(id);
  if (course === null) {
    return res.redirect("/admin/courses");
  }
  console.log(course);
  const today = new Date();
  course.lastModified = moment(today, "YYYY-MM-DD").format("DD/MM/YYYY");

  res.render("vwCourses/edit", {
    layout: "admin.hbs",
    manageUsers: false,
    manageCourses: true,

    course,
  });
});

router.post("/delete/", async function (req, res) {
  await courseModel.delete(+req.body.id);
  res.redirect("/admin/courses");
});

router.post("/patch/", upload.single("image"), async function (req, res) {
  let imgPath;
  console.log(req.body.previewImage);
  if (req.file === undefined) {
    imgPath = req.body.previewImage;
  } else {
    imgPath = "/public/images/courses/" + req.file.filename;
  }

  const today = new Date();
  let lastModified = moment(today, "DD/MM/YYYY").format("YYYY-MM-DD");
  const new_course = {
    id: req.body.id,
    imagePath: imgPath,
    price: req.body.price,
    idCat: req.body.field,
    title: req.body.title,
    description: req.body.description,
    detail: req.body.detail,
    lastModified: lastModified,
    idTeacher: req.body.idTeacher,
    status: req.body.status,
  };

  console.log(new_course);
  await courseModel.patch(new_course);
  res.redirect("/admin/courses");
});




//link /admin/courses/isAvailable?idTeacher={{idTeacher}}
router.get("/isAvailable", async function (req, res) {
  const idTeacher = req.query.teacher;
  const teacher = await courseModel.singleByIdTeacher(idTeacher);
  console.log(teacher);
  if (teacher === null) {
    return res.json(false);
  } else {
    return res.json(true);
  }
});

module.exports = router;
