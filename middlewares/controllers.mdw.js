module.exports = function (app) {
  app.get("/", function (req, res) {
    res.render("home", { layout: "main.hbs" });
  });

  app.use("/account/", require("../controllers/account.controller"));
  app.use("/admin/users/", require("../controllers/user.controller"));
  app.use("/admin/courses/", require("../controllers/course.controller"));

  app.get("/err", function (req, res) {
    throw new Error("Error!");
  });

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
