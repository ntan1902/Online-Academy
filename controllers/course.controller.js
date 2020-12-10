const express = require('express');
const courseModel = require('../models/course.model');

const router = express.Router();

router.get('/', async function(req, res) {
    const list_courses = await courseModel.all();
    res.render('vwCourses/index', {
        categories: list_courses,
        empty: list_courses.length === 0
    });
})

router.get('/add', async function(req, res) {
    res.render('vwCourses/add');
})

router.post('/add', async function(req, res) {
    await courseModel.add(req.body);
    console.log(req.body);
    res.render('vwCourses/add');
})

module.exports = router;