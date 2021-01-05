const express = require("express");
const feedbackModel = require("../models/feedback.model");
const moment = require("moment");

const router = express.Router();

router.get("/", async function (req, res) {
    const listFeedbacks  = await feedbackModel.all();
    listFeedbacks.forEach((element) => {
        element.dateRating = moment(element.dateRating, "YYYY-MM-DD").format("DD/MM/YYYY");
    });
    res.render("vwFeedbacks/index", {
        layout: "admin.hbs",
        listFeedbacks,
        empty: listFeedbacks.length === 0,
    });
});

router.get("/edit/:id", async function (req, res) {
  const id = req.params.id;
  const feedback = await feedbackModel.single(id);
  feedback.dateRating = moment(feedback.dateRating, "YYYY-MM-DD").format("DD/MM/YYYY");
  if (feedback === null) {
    return res.redirect("/admin/feedbacks");
  }

  res.render("vwFeedbacks/edit", {
    feedback,
    layout: "admin.hbs"
  });
});

router.get("/add", function (req, res) {
  res.render("vwFeedbacks/add", {
    layout: "admin.hbs"
  });
});

router.post("/add", async function (req, res) {
  const today = new Date();
  const ratingDate = moment(today, "DD/MM/YYYY").format("YYYY-MM-DD");
  const new_feedback = {
    idStudent: req.body.idStudent,
    idCourse: req.body.idCourse,
    ratingPoint: req.body.ratingPoint,
    ratingComment: req.body.ratingComment,
    dateRating: ratingDate,
  }
  console.log(new_feedback);
  await feedbackModel.add(new_feedback);
  res.redirect("/admin/feedbacks");
});

router.post("/delete", async function (req, res) {
  await feedbackModel.del(req.body.idFeedback);
  res.redirect("/admin/feedbacks");
});

router.post("/patch", async function (req, res) {
  console.log(req.body.dateRating);
  const dateRating = moment(req.body.dateRating, "DD/MM/YYYY").format("YYYY-MM-DD");
  const new_feedback = {
    idFeedback: req.body.idFeedback,
    idStudent: req.body.idStudent,
    idCourse: req.body.idCourse,
    ratingPoint: req.body.ratingPoint,
    ratingComment: req.body.ratingComment,
    dateRating: dateRating
  }
  console.log(new_feedback);
  await feedbackModel.patch(new_feedback);
  res.redirect("/admin/feedbacks");
});

module.exports = router;
