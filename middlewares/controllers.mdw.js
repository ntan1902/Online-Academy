const auth = require("./auth.mdw").auth;
const authAdmin = require("./auth.mdw").authAdmin;
const courseModel = require("../models/course.model");
const feedbackModel = require("../models/feedback.model");
const registerModel = require("../models/register.model");
const favoriteCoursesModel = require("../models/favoriteCourses.model");

module.exports = function (app) {
  app.get("/", async function (req, res) {
    console.log("Controllers print locals.auth: " + res.locals.auth);
    let newCourses = await courseModel.newCourses();
    newCourses = await feedbackModel.getRatingPoints(newCourses);

    let topView = await courseModel.topViewCourses();
    topView = await feedbackModel.getRatingPoints(topView);

    let topRegister = await courseModel.topRegistedCourses();
    topRegister = await feedbackModel.getRatingPoints(topRegister);

    let topCourses = await courseModel.topCourses();
    // topCourses = await feedbackModel.getRatingPoints(topCourses);

    if (req.session.auth) {
      //newCourses
      for (let i = 0; i < newCourses.length; i++) {
        newCourses[i].isRegister = await registerModel.isRegister(
          req.session.authUser.idUser,
          newCourses[i].idCourse
        );
        newCourses[i].isFavorite = await favoriteCoursesModel.isFavoriteCourse(
          req.session.authUser.idUser,
          newCourses[i].idCourse
        );
        newCourses[i].notReview = newCourses[i].totalPoint === 0;
      }
      //topView
      for (let i = 0; i < topView.length; i++) {
        topView[i].isRegister = await registerModel.isRegister(
          req.session.authUser.idUser,
          topView[i].idCourse
        );
        topView[i].isFavorite = await favoriteCoursesModel.isFavoriteCourse(
          req.session.authUser.idUser,
          topView[i].idCourse
        );
        topView[i].notReview = topView[i].totalPoint === 0;
      }
      //topRegister
      for (let i = 0; i < topRegister.length; i++) {
        topRegister[i].isRegister = await registerModel.isRegister(
          req.session.authUser.idUser,
          topRegister[i].idCourse
        );
        topRegister[i].isFavorite = await favoriteCoursesModel.isFavoriteCourse(
          req.session.authUser.idUser,
          topRegister[i].idCourse
        );
        topRegister[i].notReview = topRegister[i].totalPoint === 0;
      }
      //topCourses
      // for (let i = 0; i < topCourses.length; i++) {
      //   topCourses[i].isRegister = await registerModel.isRegister(
      //     req.session.authUser.idUser,
      //     topCourses[i].idCourse
      //   );
      //   topCourses[i].isFavorite = await favoriteCoursesModel.isFavoriteCourse(
      //     req.session.authUser.idUser,
      //     topCourses[i].idCourse
      //   );
      //   topCourses[i].notReview = topCourses[i].totalPoint === 0;
      // }
    } else {
      //newCourses
      for (let i = 0; i < newCourses.length; i++) {
        newCourses[i].notReview = newCourses[i].totalPoint === 0;
      }
      //topView
      for (let i = 0; i < topView.length; i++) {
        topView[i].notReview = topView[i].totalPoint === 0;
      }
      //topRegister
      for (let i = 0; i < topRegister.length; i++) {
        topRegister[i].notReview = topRegister[i].totalPoint === 0;
      }
      //topCourses
      // for (let i = 0; i < topCourses.length; i++) {
      //   topCourses[i].notReview = topCourses[i].totalPoint === 0;
      // }
    }

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
