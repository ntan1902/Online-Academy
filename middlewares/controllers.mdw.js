const auth = require("./auth.mdw").auth;
const authAdmin = require("./auth.mdw").authAdmin;

module.exports = function (app) {
  app.get("/", function (req, res) {
    res.render("home", { layout: "main.hbs" });
  });

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
