const express = require('express');
const categoryModel = require('../models/category.model');

const router = express.Router();

router.get('/', async function (req, res) {
  res.render("vwCategories/index", {
    layout: "admin.hbs",
    manageUsers: false,
    manageCourses: false,
    manageCategories: true,
    manageFeedbacks: false,
  });
})

router.get('/edit/:id', async function (req, res) {
  const id = req.params.id;
  const category = await categoryModel.single(id);

  if (category === null) {
    return res.redirect('/admin/categories');
  }
  let isEmpty = await categoryModel.isEmptyCat(id);

  res.render('vwCategories/edit', {
    layout: "admin.hbs",
    category,
    isEmpty,
  });
})

router.get('/add', function (req, res) {
  res.render('vwCategories/add', {
    layout: "admin.hbs"
  });
})

router.post('/add', async function (req, res) {
  await categoryModel.add(req.body);
  res.redirect('/admin/categories')
})

router.post('/del', async function (req, res) {
  await categoryModel.del(req.body.idCategory);
  res.redirect('/admin/categories');
})

router.post('/patch', async function (req, res) {
  await categoryModel.patch(req.body);
  res.redirect('/admin/categories');
})

module.exports = router;