const express = require("express");
const router = express.Router();
const cartModel = require("../models/cart.model");
const courseModel = require("../models/course.model");
const moment = require("moment");


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
 
 router.get("/checkout", async function (req, res) {
 
  const registers = [];


  for(const ci of req.session.cart){
    const course = await courseModel.single(ci.id);
    registers.push({
      idCourse: course.idCourse,
      idStudent: req.session.authUser.idUser,
      date: moment().format('YYYY-MM-DD')
    })
  }

  for(const register of registers){
    await cartModel.addRegister(register);
  }
  
  
  req.session.cart=[];
  res.redirect(req.headers.referer);
 });


module.exports = router;

