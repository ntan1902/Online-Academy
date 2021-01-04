const exphbs = require("express-handlebars");
const hbs_sections = require("express-handlebars-sections");
module.exports = function (app) {
  app.engine(
    "hbs",
    exphbs({
      extname: 'hbs',
      defaultLayout: "main.hbs",
      helpers: {
        section: hbs_sections(),
        format_money(val) {
          return `${val} đ`;
        },
      },
    })
  );
  app.set("view engine", "hbs");
};

