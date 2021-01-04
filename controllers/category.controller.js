const express = require('express');
const categoryModel = require('../models/category.model');

const router = express.Router();

router.get('/', async function (req, res) {
  const list = await categoryModel.all();
  res.render('vwCategories/index', {
    categories: list,
    empty: list.length === 0
  });
})

router.get('/edit', async function (req, res) {
  const id = req.query.id;
  const category = await categoryModel.single(id);
  if (category === null) {
    return res.redirect('/admin/categories');
  }

  res.render('vwCategories/edit', {
    category
  });
})

router.get('/add', function (req, res) {
  res.render('vwCategories/add');
})

router.post('/add', async function (req, res) {
  await categoryModel.add(req.body);
  res.render('vwCategories/add');
})

router.post('/del', async function (req, res) {
  await categoryModel.del(req.body.CatID);
  res.redirect('/admin/categories');
})

router.post('/patch', async function (req, res) {
  await categoryModel.patch(req.body);
  res.redirect('/admin/categories');
})

module.exports = router;