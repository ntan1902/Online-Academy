const auth = require("./auth.mdw").auth;
const authAdmin = require("./auth.mdw").authAdmin;
const courseModel = require("../models/course.model");
const feedbackModel = require("../models/feedback.model");

function getRatingPoints(courses) {
  return new Promise(async (resolve, reject) => {
    for (let i = 0; i < courses.length; i++) {
      const feedbacks = await feedbackModel.allWithIdCourse(
        courses[i].idCourse
      );

      courses[i].total_point = 0;
      for (let j = 0; j < feedbacks.length; j++) {
        courses[i].total_point += feedbacks[j].ratingPoint;
      }
      if (feedbacks.length !== 0)
        courses[i].total_point = Math.round(
          courses[i].total_point / feedbacks.length
        );
    }
    return resolve(courses);
  });
}

module.exports = function (app) {
  app.get("/", async function (req, res) {
    let newCourses = await courseModel.newCourses();
    newCourses = await getRatingPoints(newCourses);

    let topView = await courseModel.topViewCourses();
    topView = await getRatingPoints(topView);

    let topRegister = await courseModel.topRegistedCourses();
    topRegister = await getRatingPoints(topRegister);

    let topCourses = await courseModel.topCourses();
    topCourses = await getRatingPoints(topCourses);
    res.render("home", {
      layout: "main.hbs",
      newCourses,
      topView,
      topRegister,
      topCourses,
    });
  });

  app.use("/admin/feedbacks/", require("../controllers/feedback.controller"));
  app.use("/admin/categories/", require("../controllers/category.controller"));
  app.use("/account/", require("../controllers/account.controller"));
  app.use("/admin/", /*authAdmin,*/ require("../controllers/admin.controller"));
  app.use(
    "/admin/users/",
    /*authAdmin,*/ require("../controllers/user.controller")
  );
  app.use(
    "/admin/courses/",
    /*authAdmin,*/ require("../controllers/course.controller")
  );
  app.use("/courses", require("../controllers/fe_course.controler"));

  // Handle not found error
  app.use(function (req, res) {
    res.render("error/404", {
      layout: false,
    });
  });

  // Handle database error
  app.use(function (err, req, res) {
    console.error(err.stack);
    res.render("error/500", {
      layout: false,
    });
  });
};
