const express = require("express");
const courseModel = require("../models/course.model");
const { paginate } = require("../config/default.json");
const moment = require("moment");
const multer = require("multer");
const prettyMilliseconds = require("pretty-ms");
const videoUrlLink = require("../public/video-url-link");
const router = express.Router();

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
        if (nPages === 1) {
          disableNext = true;
        }
      } else if (i === nPages) {
        disableNext = true;
        if (nPages === 1) {
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

  let pagination = paginating(nPages, page);

  const offset = (page - 1) * paginate.limit;
  const list_courses = await courseModel.pageCourse(offset);

  res.render("vwCourses/fe_index", {
    courses: list_courses,
    page_numbers: pagination.page_numbers,
    empty: list_courses.length === 0,
    prevPage: pagination.prevPage,
    nextPage: pagination.nextPage,
    disablePrev: pagination.disablePrev,
    disableNext: pagination.disableNext,
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

  let pagination = paginating(nPages, page);

  const offset = (page - 1) * paginate.limit;
  const list_courses = await courseModel.pageCourseByField(offset, field);

  res.render("vwCourses/fe_index", {
    courses: list_courses,
    page_numbers: pagination.page_numbers,
    empty: list_courses.length === 0,
    prevPage: pagination.prevPage,
    nextPage: pagination.nextPage,
    disablePrev: pagination.disablePrev,
    disableNext: pagination.disableNext,
  });
});

router.post("/search/:keyword/:sort", async function (req, res) {
  var keyword = req.params.keyword;
  var sort = req.params.sort;

  var page = req.query.page || 1;

  var funcKeyword = keyword.replace(/\s+/g, ",");

  const total = await courseModel.countCourseByKeyword(funcKeyword);

  var showKeyword = funcKeyword.split(",").join(" ");

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
  const list_courses = await courseModel.pageCourseByKeyword(
    offset,
    funcKeyword,
    sort
  );
  res.render("vwCourses/search", {
    sort,
    showKeyword,
    total,
    courses: list_courses,
    page_numbers,
    empty: list_courses.length === 0,
    have: list_courses.length > 0,
    prevPage,
    nextPage,
    disablePrev,
    disableNext,
  });
});

router.get("/search/:keyword/:sort", async function (req, res) {
  var keyword = req.params.keyword;
  var sort = req.params.sort;

  var page = req.query.page || 1;

  var funcKeyword = keyword.replace(/\s+/g, ",");

  const total = await courseModel.countCourseByKeyword(funcKeyword);

  var showKeyword = funcKeyword.split(",").join(" ");

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
  const list_courses = await courseModel.pageCourseByKeyword(
    offset,
    funcKeyword,
    sort
  );
  res.render("vwCourses/search", {
    sort,
    showKeyword,
    total,
    courses: list_courses,
    page_numbers,
    empty: list_courses.length === 0,
    have: list_courses.length > 0,
    prevPage,
    nextPage,
    disablePrev,
    disableNext,
  });
});

function getDuration(url) {
  return new Promise((resolve, reject) => {
    videoUrlLink.youtube.getInfo(url, { hl: "en" }, (error, info) => {
      if (error) {
        //   console.error(error);
        return reject("ERROR : " + err);
      } else {
        const t = info.details;
        const duration = prettyMilliseconds(Number(t.lengthSeconds * 1000), {
          colonNotation: true,
        });

        return resolve(duration);
      }
    });
  });
}

router.get("/detail/:id", async function (req, res) {
  const id = req.params.id;

  // Tui truy vấn lấy lên course với previews chung 1 hàm á ông, ông tách hàm ra đi
  const course = await courseModel.single(id);
  const previews = await courseModel.singlePreviews(id);

  // Invalid date
  const lastModified = moment(course.lastModified, "YYYY-MM-DD").format(
    "DD/MM/YYYY"
  );
  course.lastModified = lastModified;
  if (course === null) {
    return res.redirect("/admin/courses");
  }

  let firstPreview = null;
  if (previews !== null) {
    for (let index = 0; index < previews.length; index++) {
      const dur = await getDuration(previews[index].videoPath);
      previews[index].duration = dur;
      previews[index].isActive = false;
    }
    previews[0].isActive = true;
    firstPreview = previews[0];
  }
  // res.json({ course, previews });

  res.render("vwCourses/detail", {
    course,
    previews,
    firstPreview,
  });
});

module.exports = router;
