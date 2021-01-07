const express = require("express");
const router = express.Router();
const cartModel = require("../models/cart.model");
const courseModel = require("../models/course.model");


router.get("/", async function (req, res, next) {
  const items = [];


  for(const ci of req.session.cart){
    const course = await courseModel.single(ci.id);
    items.push({
      course,
      price: course.price
    })
  }

  const total  = await cartModel.getTotal(items);

  res.render('vwCart/index',{
    items,
    emtpy: items.length === 0,
    total
  });
});

router.post("/add", async function (req, res) {
 const item={
     id: +req.body.id
 }
 

 cartModel.add(req.session.cart,item);
 res.redirect(req.headers.referer);
});

router.post("/remove", async function (req, res) {
  cartModel.remove(req.session.cart,+req.body.id);
  res.redirect(req.headers.referer);
 });
 



module.exports = router;
