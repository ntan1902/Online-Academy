const express = require('express');
const studentModel = require('../models/student.model');

const router = express.Router();

router.get('/', async function (req, res) {
    const list = await studentModel.all();
    res.render("vwStudents/index", {
        list: list,
        empty: list.length === 0
    })
})

router.get('/add', async function(req, res){
    res.render("vwStudents/add")
})

router.post('/add', async function(req, res){
    await studentModel.add(req.body);
    res.render("vwStudents/add")
})

router.get('/edit/:id', async function(req, res) {
    const id = req.params.id;
    const student = await studentModel.single(id);
    if (student === null) {
        return res.redirect('/admin/students');
    }
    console.log(student)
    res.render('vwStudents/edit', {
        student
    });
})


router.post('/delete/', async  function(req, res) {
    await studentModel.del(req.body.id);
    res.redirect('/admin/students');
})

router.post('/patch/', async function(req, res) {
    //TODO
    console.log(req.body)
    // await studentModel.patch(req.body);
    // res.redirect('/admin/students');
})

module.exports = router;