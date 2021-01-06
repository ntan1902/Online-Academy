const express = require("express");
const courseModel = require("../models/course.model");
const { paginate } = require("../config/default.json");
const moment = require("moment");
const multer = require("multer");
const prettyMilliseconds = require("pretty-ms");
const videoUrlLink = require("../public/video-url-link");
const router = express.Router();
const feedbackModel = require("../models/feedback.model")

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
  const list_courses = await courseModel.pageCourseByKeyword(offset,funcKeyword,sort);

  res.render("vwCourses/search", {
    total,
    showKeyword,
    sort,
    courses: list_courses,
    page_numbers: pagination.page_numbers,
    empty: list_courses.length === 0,
    have: list_courses.length >0,
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

  //Feedback's part
  var count_feedbacks_star = {
    star1: 0, star2:0, star3: 0, star4: 0, star5: 0
  };

  var count_feedback=0, total_feedback_point=0;
  const feedbacks = await feedbackModel.allwithIdCourse(id);

  feedbacks.forEach((element) => {
    element.dateRating = moment(element.dateRating, "YYYY-MM-DD").format('MMMM Do YYYY')
    count_feedback++;
    total_feedback_point += +element.ratingPoint;
    if(element.ratingPoint === 1) {
      count_feedbacks_star.star1++;
    } else if(element.ratingPoint === 2) {
      count_feedbacks_star.star2++;
    } else if(element.ratingPoint === 3) {
      count_feedbacks_star.star3++;
    } else if(element.ratingPoint === 4) {
      count_feedbacks_star.star4++;
    } else if(element.ratingPoint === 5) {
      count_feedbacks_star.star5++;
    }
  });

  total_feedback_point = Math.round(total_feedback_point / count_feedback);
  
  console.log(count_feedback);
  console.log(total_feedback_point);
  res.render("vwCourses/detail", {
    course,
    previews,
    firstPreview,
    feedbacks,
    count_feedback,
    total_feedback_point,
    count_feedbacks_star,
  });
});

router.post("/detail/:id", async function(req, res) {
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
  }
  console.log(new_feedback);
  feedbackModel.add(new_feedback);
  res.redirect(req.get('referer'));
})

module.exports = router;
