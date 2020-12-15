module.exports = function (app) {
    app.get('/', (req, res) => {
        res.render('home', {layout: 'main.hbs'})
    })

    app.get('/login', function(req, res) {
        res.render('vwLogin/login', {layout: 'main.hbs'})
    } )

    app.use('/admin/students/', require('../controllers/student.controller'));
    app.use('/admin/courses/', require('../controllers/course.controller'));
    app.use('/admin/teachers/', require('../controllers/teacher.controller'));


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
        res.render('error/500', {
            layout: false
        })
    })

}