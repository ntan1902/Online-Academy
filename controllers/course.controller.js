const express = require('express');
const courseModel = require('../models/course.model');
const { paginate } = require('../config/default.json');
const moment = require("moment");

const router = express.Router();

router.get('/', async function(req, res, next) {

    const page = req.query.page || 1;
    if(page < 1) page = 1;

    const total = await courseModel.countCourse();
    let nPages = Math.floor(total / paginate.limit);
    if(total % paginate.limit > 0) nPages++; //for the remaining courses
    console.log(nPages);
    const page_numbers = [];
    for(i=1; i <= nPages; i++) {
        page_numbers.push({
            value: i,
            isCurrentPage: i === +page
        });
    }
  
    const offset = (page - 1) * paginate.limit;
    const list_courses = await courseModel.pageCourse(offset);

    res.render('vwCourses/index', { 
        courses: list_courses,
        page_numbers,
        empty: list_courses.length === 0
    });
});

router.get('/byField/:field', async function (req, res) {
    const field = req.params.field;
    console.log(field);

    const page = req.query.page || 1;
    if(page < 1) page = 1;

    const total = await courseModel.countCourseByField(field);
    let nPages = Math.floor(total / paginate.limit);
    if(total % paginate.limit > 0) nPages++; //for the remaining courses
    console.log(nPages);
    const page_numbers = [];
    for(i=1; i <= nPages; i++) {
        page_numbers.push({
            value: i,
            isCurrentPage: i === +page
        });
    }
  
    const offset = (page - 1) * paginate.limit;
    const list_courses = await courseModel.pageCourseByField(offset, field);

    res.render('vwCourses/index', { 
        courses: list_courses,
        page_numbers,
        empty: list_courses.length === 0
    });
});
// `id` int NOT NULL AUTO_INCREMENT,
//   `imagePath` varchar(1000) DEFAULT NULL,
//   `videoPath` varchar(1000) DEFAULT NULL,
//   `price` int NOT NULL,
//   `field` varchar(10) NOT NULL,
//   `title` varchar(100) NOT NULL,
//   `description` varchar(1000) DEFAULT NULL,
//   `detail` varchar(10000) DEFAULT NULL,
//   `lastModified` datetime DEFAULT NULL,
//   `idTeacher` int NOT NULL,
//   `previewDocument` varchar(1000) DEFAULT NULL,
//   `status` varchar(15) NOT NULL,
router.get('/add', async function (req, res) {
    res.render('vwCourses/add');
});

router.post('/add', async function (req, res) {
    const lastModified = moment(req.body.lastModified, "DD/MM/YYYY").format("YYYY-MM-DD");
    const new_course = {
        imagePath: req.body.imagePath,
        videoPath: req.body.videoPath,
        price: req.body.price,
        field: req.body.field,
        title: req.body.title,
        description: req.body.description,
        detail: req.body.detail,
        lastModified: lastModified,
        idTeacher: req.body.idTeacher,
        previewDocument: req.body.previewDocument,
        status: req.body.status
    };

    await courseModel.add(new_course);
    res.render('vwCourses/add');
});

router.get('/edit/:id', async function (req, res) {
    const id = req.params.id;
    const course = await courseModel.single(id);
    if (course === null) {
        return res.redirect('/admin/courses');
    }
    course.lastModified = moment(course.lastModified, "YYYY-MM-DD").format("DD/MM/YYYY");

    res.render('vwCourses/edit', {
        course
    })
});

router.post('/delete/', async function (req, res) {
    await courseModel.delete(+req.body.id);
    res.redirect('/admin/courses');
});

router.post('/patch/', async function (req, res) {
    await courseModel.patch(req.body);
    res.redirect('/admin/courses');
});

//link /admin/courses/isAvailable?idTeacher={{idTeacher}}
router.get("/isAvailable", async function(req, res) {
    const idTeacher = req.query.teacher;
    const teacher = await courseModel.singleByIdTeacher(idTeacher);
    console.log(teacher);
    if(teacher === null) {
        return res.json(false);

    } else {
        return res.json(true);
    }
});


module.exports = router;