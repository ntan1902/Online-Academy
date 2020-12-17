const express = require('express');
const courseModel = require('../models/course.model');

const router = express.Router();

router.get('/', async function (req, res) {
    const list_courses = await courseModel.all();
    res.render('vwCourses/index', {
        courses: list_courses,
        empty: list_courses.length === 0
    });
})

router.get('/byField/:field', async function (req, res) {
    const field = req.params.field;
    console.log(field);
    const list_courses = await courseModel.allByField(field);
    res.render('vwCourses/index', {
        courses: list_courses,
        empty: list_courses.length === 0
    });
})

router.get('/add', async function (req, res) {
    res.render('vwCourses/add');
})

router.post('/add', async function (req, res) {
    await courseModel.add(req.body);
    console.log(req.body);
    res.render('vwCourses/add');
})

router.get('/edit/:id', async function (req, res) {
    const id = req.params.id;
    const course = await courseModel.single(id);
    if (course === null) {
        return res.redirect('/admin/courses');
    }
    console.log(course);

    res.render('vwCourses/edit', {
        course
    })
})

router.post('/delete/', async function (req, res) {
    await courseModel.delete(req.body.idCourse);
    res.redirect('/admin/courses');
})

router.post('/patch/', async function (req, res) {
    await courseModel.patch(req.body);
    res.redirect('/admin/courses');
})


module.exports = router;