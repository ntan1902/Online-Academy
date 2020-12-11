const express = require('express');
const teacherModel = require('../models/teacher.model');

const router = express.Router();

router.get('/', async function (req, res) {
    const list = await teacherModel.all();
    res.render("vwTeachers/index", {
        list: list,
        empty: list.length === 0
    })
})

router.get('/add', async function(req, res){
    res.render("vwTeachers/add")
})

router.post('/add', async function(req, res){
    console.log(req.body)
    if(req.body.dob.length === 0)
        req.body.dob = null

    if(req.body.email.length === 0)
        req.body.email = null
    await teacherModel.add(req.body);
    res.render("vwTeachers/add")
})

router.get('/edit/:id', async function(req, res) {
    const id = req.params.id;
    const teacher = await teacherModel.single(id);
    if (teacher === null) {
        return res.redirect('/admin/teachers');
    }
    console.log(teacher)
    
    res.render('vwTeachers/edit', {
        teacher
    });
})


router.post('/delete/', async  function(req, res) {
    await teacherModel.delete(req.body.id);
    res.redirect('/admin/teachers');
})

router.post('/patch/', async function(req, res) {
    //TODO
    console.log(req.body)
    
    if(req.body.dob.length === 0)
        req.body.dob = null
    if(req.body.email.length === 0)
        req.body.email = null

    await teacherModel.patch(req.body);
    res.redirect('/admin/teachers');
})

module.exports = router;