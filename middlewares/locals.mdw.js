const categoryModel = require('../models/category.model');

module.exports = function (app) {
    app.use(async function (req, res, next) {
        res.locals.lcCategories = await categoryModel.allWithDetails();
        next();
    });
}