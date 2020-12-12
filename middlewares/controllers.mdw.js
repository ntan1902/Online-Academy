module.exports = function (app) {
    app.get('/', (req, res) => {
        res.render('home', {layout: 'main.hbs'})
    })

    app.use('/admin/students/', require('../controllers/student.controller'));
    app.use('/admin/courses/', require('../controllers/course.controller'));

    app.get('/err', function (req, res) {
        throw new Error('Error!');
    })

    app.use(function (req, res) {
        res.render('error/404', {
            layout: false
        });
    });


    app.use(function (err, req, res) {
        console.error(err.stack);
        res.render('500', {
            layout: false
        })
    })

}