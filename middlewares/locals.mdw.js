const categoryModel = require("../models/category.model");
const courseModel = require("../models/course.model");
const cartModel = require("../models/cart.model");

module.exports = function (app) {
  app.use(function (req, res, next) {
    if (typeof req.session.auth === "undefined") {
      req.session.auth = false;
    }
    if (req.session.auth === false) {
      req.session.cart = [];
    }

    res.locals.auth = req.session.auth;
    res.locals.authUser = req.session.authUser;
    res.locals.isAdmin = false;
    if (req.session.authUser) {
      res.locals.isAdmin = req.session.authUser.role === "admin";
      res.locals.isTeacher = req.session.authUser.role === "teacher";
    }
    res.locals.cartSummary = cartModel.getNumberOfItems(req.session.cart);
    next();
  });

  app.use(async function (req, res, next) {
    // res.locals.newCourses = await courseModel.newCourses();
    // res.locals.topView = await courseModel.topViewCourses();
    // res.locals.topRegister = await courseModel.topRegistedCourses();
    // res.locals.topCourses = await courseModel.topCourses();
    res.locals.listCategories = await categoryModel.allWithDetails();

    next();
  });
};
