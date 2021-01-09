const auth = require("./auth.mdw").auth;
const authAdmin = require("./auth.mdw").authAdmin;
const courseModel = require("../models/course.model");
const feedbackModel = require("../models/feedback.model");

module.exports = function (app) {
  app.get("/", async function (req, res) {
    let newCourses = await courseModel.newCourses();
    newCourses = await feedbackModel.getRatingPoints(newCourses);

    let topView = await courseModel.topViewCourses();
    topView = await feedbackModel.getRatingPoints(topView);

    let topRegister = await courseModel.topRegistedCourses();
    topRegister = await feedbackModel.getRatingPoints(topRegister);

    let topCourses = await courseModel.topCourses();
    topCourses = await feedbackModel.getRatingPoints(topCourses);
    res.render("home", {
      layout: "main.hbs",
      newCourses,
      topView,
      topRegister,
      topCourses,
    });
  });

  app.use(
    "/admin/feedbacks/",
    authAdmin,
    require("../controllers/feedback.controller")
  );
  app.use(
    "/admin/categories/",
    authAdmin,
    require("../controllers/category.controller")
  );
  app.use("/account/", require("../controllers/account.controller"));
  app.use("/admin/", authAdmin, require("../controllers/admin.controller"));
  app.use(
    "/admin/users/",
    authAdmin,
    require("../controllers/user.controller")
  );
  app.use(
    "/admin/courses/",
    authAdmin,
    require("../controllers/course.controller")
  );
  app.use("/courses", require("../controllers/fe_course.controler"));
  app.use("/cart", auth, require("../controllers/cart.controller"));
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
