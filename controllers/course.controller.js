const express = require("express");
const courseModel = require("../models/course.model");
const { paginate } = require("../config/default.json");
const moment = require("moment");
const multer = require('multer');
const path = require('path');

const router = express.Router();

//Set Storage Engine
const storage = multer.diskStorage ({
  destination: "./public/images/", 
  filename: function(req, file, callback){
    callback(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer ({
  storage: storage,
  limits: {fileSize: 1000000}
});

router.get("/", async function (req, res, next) {
  var page = req.query.page || 1;
  if (page < 1) page = 1;

  const total = await courseModel.countCourse();
  let nPages = Math.floor(total / paginate.limit);
  if (total % paginate.limit > 0) nPages++; //for the remaining courses
  console.log(nPages);
  const page_numbers = [];

  let disablePrev = false;
  let disableNext = false;
  let prevPage, nextPage;
  for (i = 1; i <= nPages; i++) {
    let currentPage = (i === +page);
    if (currentPage) {
      if (i === 1) {
        disablePrev = true;  
      } else if (i === nPages) {
        disableNext = true; 
      }
      prevPage = i - 1;
      nextPage = i + 1;
    }
    page_numbers.push({
      value: i,
      isCurrentPage: currentPage,
    });
  }

  const offset = (page - 1) * paginate.limit;
  const list_courses = await courseModel.pageCourse(offset);

  res.render("vwCourses/index", {
    courses: list_courses,
    page_numbers,
    empty: list_courses.length === 0,
    prevPage,
    nextPage,
    disablePrev,
    disableNext
  });
});

router.get("/byField/:field", async function (req, res) {
  const field = req.params.field;
  console.log(field);

  var page = req.query.page || 1;
  if (page < 1) page = 1;

  const total = await courseModel.countCourseByField(field);
  let nPages = Math.floor(total / paginate.limit);
  if (total % paginate.limit > 0) nPages++; //for the remaining courses
  console.log(nPages);
  const page_numbers = [];

  let disablePrev = false;
  let disableNext = false;
  let prevPage, nextPage;
  for (i = 1; i <= nPages; i++) {
    let currentPage = (i === +page);
    if(currentPage) {
      if(i === 1) {
        disablePrev = true;
      }
      else if(i === nPages) {
        disableNext = true;
      }
      prevPage = i - 1;
      nextPage = i + 1;
    }
    page_numbers.push({
      value: i,
      isCurrentPage: currentPage
    });
  }

  const offset = (page - 1) * paginate.limit;
  const list_courses = await courseModel.pageCourseByField(offset, field);

  res.render("vwCourses/index", {
    courses: list_courses,
    page_numbers,
    empty: list_courses.length === 0,
    prevPage,
    nextPage,
    disablePrev,
    disableNext
  });
});
// `id` int NOT NULL AUTO_INCREMENT,
//   `imagePath` varchar(1000) DEFAULT NULL,
//   `videoPath` varchar(1000) DEFAULT NULL,
//   `price` int NOT NULL,
//   `field` varchar(10) NOT NULL,
//   `title` varchar(100) NOT NULL,
//   `description` varchar(1000) DEFAULT NULL,
//   `detail` varchar(10000) DEFAULT NULL,
//   `lastModified` datetime DEFAULT NULL,
//   `idTeacher` int NOT NULL,
//   `previewDocument` varchar(1000) DEFAULT NULL,
//   `status` varchar(15) NOT NULL,
router.get("/add", async function (req, res) {
  res.render("vwCourses/add");
});
 
router.post("/add", upload.array('images', 2), async function (req, res) {
  const today = new Date();
  const lastModified = moment(today, "DD/MM/YYYY").format(
    "YYYY-MM-DD"
  );

  console.log(req.files[0]);
  console.log(req.files[1]);

  const new_course = {
    imagePath: req.body.imagePath,
    videoPath: req.body.videoPath,
    price: req.body.price,
    field: req.body.field,
    title: req.body.title,
    description: req.body.description,
    detail: req.body.detail,
    lastModified: lastModified,
    idTeacher: req.body.idTeacher,
    previewDocument: req.body.previewDocument,
    status: req.body.status,
  };

  await courseModel.add(new_course);
  res.render("vwCourses/add");
});

router.get("/edit/:id", async function (req, res) {
  const id = req.params.id;
  const course = await courseModel.single(id);
  if (course === null) {
    return res.redirect("/admin/courses");
  }
  const today = new Date();
  course.lastModified = moment(today, "YYYY-MM-DD").format(
    "DD/MM/YYYY"
  );

  res.render("vwCourses/edit", {
    course,
  });
});

router.post("/delete/", async function (req, res) {
  await courseModel.delete(+req.body.id);
  res.redirect("/admin/courses");
});

router.post("/patch/", async function (req, res) {
  await courseModel.patch(req.body);
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
