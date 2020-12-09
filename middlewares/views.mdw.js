const exphbs = require('express-handlebars');

module.exports = function (app) {

    app.engine('hbs', exphbs({
        defaultLayout: "main.hbs"
    }))
    app.set('view engine', 'hbs')

}