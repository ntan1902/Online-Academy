const express = require("express");
const courseModel = require("../models/course.model");
const { paginate } = require("../config/default.json");
const moment = require("moment");
const multer = require('multer');
const path = require('path');

const router = express.Router();

//Set Storage Engine
const storage = multer.diskStorage({
  destination: "./public/images/",
  filename: function (req, file, callback) {
    callback(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 1000000 }
});

function paginating(nPages, page) {
  var page_numbers = [];
  var disablePrev = false;
  var disableNext = false;
  var prevPage, nextPage;

  for (i = 1; i <= nPages; i++) {
    let currentPage = i === +page;
    if (currentPage) {
      if (i === 1) {
        disablePrev = true;
        if(nPages === 1) {
          disableNext = true;
        }
      } else if (i === nPages) {
        disableNext = true;
        if(nPages === 1) {
          disablePrev = true;
        }
      }
      prevPage = i - 1;
      nextPage = i + 1;
    }
    page_numbers.push({
      value: i,
      isCurrentPage: currentPage,
    });
  }

  return { disablePrev, disableNext, prevPage, nextPage, page_numbers };
}

router.get("/", async function (req, res, next) {
  var page = req.query.page || 1;
  if (page < 1) page = 1;

  const total = await courseModel.countCourse();
  let nPages = Math.floor(total / paginate.limit);
  if (total % paginate.limit > 0) nPages++; //for the remaining courses

  let {
    disablePrev,
    disableNext,
    prevPage,
    nextPage,
    page_numbers,
  } = paginating(nPages, page);

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

  let {
    disablePrev,
    disableNext,
    prevPage,
    nextPage,
    page_numbers,
  } = paginating(nPages, page);

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

router.get("/add", async function (req, res) {
  res.render("vwCourses/add");
});

router.post("/add", upload.single('image'), async function (req, res) {
  const today = new Date();
  const lastModified = moment(today, "DD/MM/YYYY").format(
    "YYYY-MM-DD"
  );

  // console.log(req.files[0]);
  // console.log(req.files[1]);
  let imgPath = "/public/images/" + req.file.filename;
  //let imgPath2 = "/public/images/" + req.files[1].filename;

  const new_course = {
    imagePath: imgPath,
    //imagePath2: imgPath2,
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
  console.log(new_course);
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

  console.log(course);
  res.render("vwCourses/edit", {
    course,
  });
});

router.post("/delete/", async function (req, res) {
  await courseModel.delete(+req.body.id);
  res.redirect("/admin/courses");
});

router.post("/patch/", async function (req, res) {
  const new_course = req.body;
  const today = new Date();
  new_course.lastModified = moment(today, "DD/MM/YYYY").format("YYYY-MM-DD"); 
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

router.post("/search", async function (req, res, next) {
  var keyword=req.body.search;
 

  var page = req.query.page || 1;
  if (page < 1) page = 1;
  
  var funcKeyword = keyword.replace(/\s+/g, ",");
  console.log(funcKeyword);

  const total = await courseModel.countCourseByKeyword(funcKeyword);

  var showKeyword = funcKeyword.split(',').join(" ");
  console.log(total);
  let nPages = Math.floor(total / paginate.limit);
  if (total % paginate.limit > 0) nPages++; //for the remaining courses
  console.log(nPages);
  
  let {
    disablePrev,
    disableNext,
    prevPage,
    nextPage,
    page_numbers,
  } = paginating(nPages, page);

  const offset = (page - 1) * paginate.limit;
  const list_courses = await courseModel.pageCourseByKeyword(offset, funcKeyword);

  res.render("vwCourses/search", {
    showKeyword,
    total,
    courses: list_courses,
    page_numbers,
    empty: list_courses.length === 0,
    prevPage,
    nextPage,
    disablePrev,
    disableNext
  });
});

router.get('/detail/:id', async function(req, res) {
  const id = req.params.id;
  const course = await courseModel.single(id);
  const lastModified = moment(course.lastModified, "DD/MM/YYYY").format(
    "DD/MM/YYYY"
  );
  course.lastModified = lastModified;
  if (course === null) {
    return res.redirect("/admin/courses");
  }

  console.log(course);
  res.render("vwCourses/detail", {
    course
  });
})

module.exports = router;
