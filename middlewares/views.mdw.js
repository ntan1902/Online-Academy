const exphbs = require("express-handlebars");
const hbs_sections = require("express-handlebars-sections");
module.exports = function (app) {
  app.engine(
    "hbs",
    exphbs({
      extname: "hbs",
      defaultLayout: "main.hbs",
      helpers: {
        section: hbs_sections(),
        calcStars(star) {
          let res = "";
          for (let i = 0; i < 5; i++) {
            if (i < star) {
              res += '<i class="fa fa-star"></i>';
            } else {
              res += '<i class="fa fa-star-o"></i>';
            }
          }
          return res;
        },
      },
    })
  );
  app.set("view engine", "hbs");
};
