module.exports = function (app) {
    app.get('/', (req, res) => {
        res.render('home', {layout: 'main.hbs'})
    })

    app.use('/admin/students/', require('../controllers/student.controller'));

    app.get('/err', function (req, res) {
        throw new Error('Error!');
    })

    app.use(function (req, res) {
        res.render('404', {
            layout: false
        });
    });

}