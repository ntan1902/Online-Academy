const express = require("express");
const courseModel = require("../models/course.model");
const { paginate } = require("../config/default.json");
const moment = require("moment");
const multer = require("multer");
const path = require("path");

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

module.exports = router;