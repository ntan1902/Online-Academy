// const categoryModel = require('../models/category.model');

module.exports = function (app) {
    app.use(function (req, res, next) {
        if (typeof (req.session.auth) === 'undefined') {
            req.session.auth = false;
        }

        res.locals.auth = req.session.auth;
        res.locals.authUser = req.session.authUser;
        next();
    });

    //   app.use(async function (req, res, next) {
    //     res.locals.lcCategories = await categoryModel.allWithDetails();
    //     next();
    //   });
}