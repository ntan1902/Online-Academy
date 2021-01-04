const courseModel = require("../models/course.model");

module.exports = function (app) {
  app.use(function (req, res, next) {
    if (typeof req.session.auth === "undefined") {
      req.session.auth = false;
    }

    res.locals.auth = req.session.auth;
    res.locals.authUser = req.session.authUser;
    if (req.session.authUser)
      res.locals.isAdmin = req.session.authUser.role === "admin";
    next();
  });

  app.use(async function (req, res, next) {
    res.locals.courses = await courseModel.allWithTeacher();
    res.locals.topView = await courseModel.topViewCourses();
    res.locals.topRegister = await courseModel.topRegistedCourses();

    // res.locals.subCourses = res.locals.courses.splice(0, 5);
    next();
  });
};
