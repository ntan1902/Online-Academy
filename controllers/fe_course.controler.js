const express = require("express");
const courseModel = require("../models/course.model");
const { paginate } = require("../config/default.json");
const moment = require("moment");
const multer = require("multer");
const parseMilliseconds = require("parse-ms");
const videoUrlLink = require("../public/video-url-link");
const router = express.Router();
const feedbackModel = require("../models/feedback.model");

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

router.get("/search", async function (req, res) {
  var keyword = req.query.search;
  var sort = req.query.sort;

  var page = req.query.page || 1;

  var funcKeyword = keyword.replace(/\s+/g, ",");

  const total = await courseModel.countCourseByKeyword(funcKeyword);

  var showKeyword = funcKeyword.split(",").join(" ");

  let nPages = Math.floor(total / paginate.limit);
  if (total % paginate.limit > 0) nPages++; //for the remaining courses

  let pagination = paginating(nPages, page);

  const offset = (page - 1) * paginate.limit;
  const list_courses = await courseModel.pageCourseByKeyword(
    offset,
    funcKeyword,
    sort
  );

  res.render("vwCourses/search", {
    total,
    showKeyword,
    sort,
    courses: list_courses,
    page_numbers: pagination.page_numbers,
    empty: list_courses.length === 0,
    have: list_courses.length > 0,
    prevPage: pagination.prevPage,
    nextPage: pagination.nextPage,
    disablePrev: pagination.disablePrev,
    disableNext: pagination.disableNext,
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
        // const duration = prettyMilliseconds(Number(t.lengthSeconds * 1000), {
        //   colonNotation: true,
        // });

        let duration = "";
        const time = parseMilliseconds(t.lengthSeconds * 1000);
        time.hours = (time.hours < 10 ? "0" : "") + time.hours;
        time.minutes = (time.minutes < 10 ? "0" : "") + time.minutes;
        time.seconds = (time.seconds < 10 ? "0" : "") + time.seconds;
        duration = time.minutes + ":" + time.seconds;
        return resolve(duration);
      }
    });
  });
}

router.get("/detail/:id", async function (req, res) {
  const id = req.params.id;

  // Tui truy vấn lấy lên course với lessons chung 1 hàm á ông, ông tách hàm ra đi
  const course = await courseModel.single(id);
  const lessons = await courseModel.getLessons(id);

  // Invalid date
  const lastModified = moment(course.lastModified, "YYYY-MM-DD").format(
    "DD/MM/YYYY"
  );
  course.lastModified = lastModified;
  if (course === null) {
    return res.redirect("/admin/courses");
  }

  let firstLesson = null;
  if (lessons !== null) {
    for (let index = 0; index < lessons.length; index++) {
      const dur = await getDuration(lessons[index].videoPath);
      lessons[index].duration = dur;
    }
    firstLesson = lessons[0];
  }
  // res.json({ course, previews });

  //Feedback's part
  let count_feedbacks_star = [
    { star: "1", count: 0 },
    { star: "2", count: 0 },
    { star: "3", count: 0 },
    { star: "4", count: 0 },
    { star: "5", count: 0 },
  ];

  const feedbacks = await feedbackModel.allWithIdCourse(id);
  let total_feedback_point = 0;

  feedbacks.forEach((element) => {
    element.dateRating = moment(element.dateRating, "YYYY-MM-DD").format(
      "MMMM Do YYYY"
    );

    count_feedbacks_star[element.ratingPoint - 1].count++;
    total_feedback_point += element.ratingPoint;
  });

  if (feedbacks.length !== 0)
    total_feedback_point = Math.round(total_feedback_point / feedbacks.length);
  count_feedbacks_star.reverse();

  res.render("vwCourses/detail", {
    course,
    lessons,
    firstLesson,
    feedbacks,
    count_feedback: feedbacks.length,
    total_feedback_point,
    count_feedbacks_star,
  });
});

router.post("/detail/:id", async function (req, res) {
  const idUser = req.body.idUser;
  const idCourse = req.params.id;
  const today = new Date();
  const dateRating = moment(today, "DD/MM/YYYY").format("YYYY-MM-DD");
  const ratingPoint = req.body.ratingPoint;
  const ratingComment = req.body.ratingComment;

  const new_feedback = {
    idStudent: idUser,
    idCourse,
    ratingPoint,
    ratingComment,
    dateRating,
  };
  console.log(new_feedback);
  feedbackModel.add(new_feedback);
  res.redirect(req.get("referer"));
});

module.exports = router;
