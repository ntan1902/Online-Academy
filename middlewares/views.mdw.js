const exphbs = require('express-handlebars');

module.exports = function (app) {

    app.engine('hbs', exphbs({
        defaultLayout: "main.hbs",
        helpers: {
            format_money(val) {
                return `${val} đ`;
            },
        }
    }));
    app.set('view engine', 'hbs');

}