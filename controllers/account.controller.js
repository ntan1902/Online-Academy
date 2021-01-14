const express = require("express");
const bcrypt = require("bcryptjs");
const moment = require("moment");
const userModel = require("../models/user.model");
const auth = require("../middlewares/auth.mdw").auth;
const authTeacher = require("../middlewares/auth.mdw").authTeacher;
const mail = require("../controllers/mail.controller");
const multer = require("multer");
const path = require("path");
const favoriteCourses = require("../models/favoriteCourses.model");
const feedbackModel = require("../models/feedback.model");
const registerModel = require("../models/register.model");
const courseModel = require("../models/course.model");
const router = express.Router();
const videoUrlLink = require("../public/video-url-link");
const parseMilliseconds = require("parse-ms");

//Set Storage Engine for User
const storageUser = multer.diskStorage({
  destination: "./public/images/users",
  filename: function (req, file, callback) {
    callback(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

//Set Storage Engine for Course
const storageCourse = multer.diskStorage({
  destination: "./public/images/courses",
  filename: function (req, file, callback) {
    callback(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

//Set Storage Engine for Lesson
const storageLesson = multer.diskStorage({
  destination: "./public/images/lessons",
  filename: function (req, file, callback) {
    callback(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});
const uploadUser = multer({
  storage: storageUser,
  limits: { fileSize: 1000000 },
});

const uploadCourse = multer({
  storage: storageCourse,
  limits: { fileSize: 1000000 },
});

const uploadLesson = multer({
  storage: storageLesson,
  limits: { fileSize: 1000000 },
});

router.get("/signin", function (req, res) {
  res.render("vwAccount/signin", { layout: "main.hbs" });
});

router.post("/signin", async function (req, res) {
  const user = await userModel.singleByUserName(req.body.username);
  if (user === null) {
    return res.render("vwAccount/signin", {
      layout: "main.hbs",
      err_message: "Invalid username.",
    });
  }

  const ret = bcrypt.compareSync(req.body.password, user.password);
  if (ret === false) {
    return res.render("vwAccount/signin", {
      layout: "main.hbs",
      err_message: "Invalid password.",
    });
  }

  req.session.auth = true;
  req.session.authUser = user; //initial authen session for user
  req.session.isAdmin = user.role === "admin";
  if (req.session.isAdmin) {
    res.redirect("/admin");
  } else {
    const url = req.session.retUrl || "/";
    res.redirect(url);
  }
});
router.get("/signup/:role", function (req, res) {
  res.render("vwAccount/signup", {
    layout: "main.hbs",
    role: req.params.role,
  });
});

router.post("/signup/", async function (req, res) {
  const hash = bcrypt.hashSync(req.body.password, 10);

  const dob = moment(req.body.dob, "DD/MM/YYYY").format("YYYY-MM-DD");
  const user = {
    username: req.body.username,
    password: hash,
    fullname: req.body.fullname,
    email: req.body.email,
    dob: dob,
    role: req.body.role,
  };

  req.session.hash = hash;
  req.session.host = req.get("host");
  req.session.authUser = user;

  // //TEST start
  // await userModel.add(user);
  // res.render("vwAccount/signup", {
  //   message: `Email ${req.session.authUser.email} is been successfully verified`,
  //   type: "success",
  // });
  // //TEST end

  link = req.protocol + "://" + req.get("host") + "/account/verify?id=" + hash;

  mail
    .send(req.body.email, link)
    .then((response) => {
      console.log("Message sent: " + response.message);
      res.render("vwAccount/signup", {
        message: `Email is sent at ${req.body.email}. Please check your mail to verify the account`,
        type: "warning",
      });
    })
    .catch((error) => {
      console.log(error);
      res.end("Error");
    });
});

router.get("/verify", async function (req, res) {
  if (req.protocol + "://" + req.get("host") === "http://" + req.session.host) {
    console.log("Domain is matched. Information is from Authentic email");

    if (req.query.id == req.session.hash) {
      await userModel.add(req.session.authUser);

      res.render("vwAccount/signup", {
        message: `Email ${req.session.authUser.email} is been successfully verified`,
        type: "success",
      });
    } else {
      res.render("vwAccount/signup", {
        message: `Email ${req.session.authUser.email} is not verified`,
        type: "danger",
      });
    }
  } else {
    res.end("<h1>Request is from unknown source</h1>");
  }
});

router.get("/isAvailable", async function (req, res) {
  const username = req.query.user;
  const user = await userModel.singleByUserName(username);
  if (user === null) {
    return res.json(true);
  }
  res.json(false);
});

router.get("/isUniqueEmail", async function (req, res) {
  const email = req.query.email;
  const user = await userModel.singleByEmail(email);
  if (user === null) {
    return res.json(true);
  }
  res.json(false);
});

router.get("/profile", auth, async function (req, res) {
  const user = await userModel.single(req.session.authUser.idUser);

  user.dob = moment(user.dob, "YYYY-MM-DD").format("DD/MM/YYYY");
  res.render("vwAccount/edit", {
    layout: "userProfile.hbs",
    user,
    change: false,
    edit: true,
  });
});

router.post(
  "/patch",
  auth,
  uploadUser.single("avatar"),
  async function (req, res) {
    const dob = moment(req.body.dob, "DD/MM/YYYY").format("YYYY-MM-DD");
    let imgPath;
    if (req.file === undefined) {
      imgPath = req.body.previewAvatar;
    } else {
      imgPath = "/public/images/users/" + req.file.filename;
    }
    let userDescript;
    if (req.body.userDescription === "") {
      userDescript = req.body.tempUserDescription;
    } else {
      userDescript = req.body.userDescription;
    }
    const new_user = {
      idUser: req.body.idUser,
      username: req.body.username,
      fullname: req.body.fullname,
      email: req.body.email,
      dob: dob,
      role: req.body.role,
      userDescription: userDescript,
      avatar: imgPath,
    };
    console.log(new_user);
    await userModel.patch(new_user);
    req.session.authUser = await userModel.singleByUserName(req.body.username);
    res.redirect("/account/profile");
  }
);

router.get("/changePassword", auth, async function (req, res) {
  const user = await userModel.single(req.session.authUser.idUser);
  res.render("vwAccount/changePassword", {
    layout: "userProfile.hbs",
    user,
    change: true,
    edit: false,
  });
});

router.get("/isValidPassword", async function (req, res) {
  const password = req.query.password;
  const ret = bcrypt.compareSync(password, req.session.authUser.password);
  if (ret === false) {
    return res.json(false);
  }
  return res.json(true);
});

router.post("/changePassword", auth, async function (req, res) {
  const hash = bcrypt.hashSync(req.body.newPassword, 10);
  await userModel.patch({
    idUser: req.session.authUser.idUser,
    password: hash,
  });

  req.session.authUser = await userModel.single(req.session.authUser.idUser);
  res.redirect("/account/changePassword");
});

router.post("/signout", function (req, res) {
  req.session.auth = false;
  req.session.authUser = null;
  req.session.retUrl = null;
  req.session.cart = [];
  const url = req.headers.referer || "/";
  res.redirect(url);
});

router.get("/favoriteCourses", auth, async function (req, res) {
  const list_favorites = await favoriteCourses.allByUser(
    req.session.authUser.idUser
  );
  res.render("vwAccount/favoriteCourses", {
    favorite: true,
    edit: false,
    mycourses: false,
    change: false,
    layout: "userProfile.hbs",
    empty: list_favorites.length === 0,
    list_favorites,
  });
});

router.get("/myCourses", auth, async function (req, res) {
  const list_my_courses = await registerModel.allByUser(
    req.session.authUser.idUser
  );
  res.render("vwAccount/myRegisteredCourses", {
    favorite: false,
    edit: false,
    change: false,
    owncourses: true,
    layout: "userProfile.hbs",
    empty: list_my_courses.length === 0,
    list_my_courses,
  });
});

router.get("/favoriteCourses/add/:idCourse", auth, async function (req, res) {
  const idStudent = req.session.authUser.idUser;
  const idCourse = req.params.idCourse;
  const new_favorite = {
    idCourse,
    idStudent,
  };
  console.log(new_favorite);
  await favoriteCourses.add(new_favorite);
  res.redirect(req.get("referer"));
});

router.get(
  "/favoriteCourses/delete/:idCourse",
  auth,
  async function (req, res) {
    const idStudent = req.session.authUser.idUser;
    const idCourse = req.params.idCourse;
    await favoriteCourses.delete(idCourse, idStudent);
    res.redirect("/account/favoriteCourses");
  }
);

//Teacher's Part
router.get("/teacher/myCourses", authTeacher, async function (req, res) {
  const idTeacher = req.session.authUser.idUser;
  list_my_courses = await courseModel.allByIdTeacher(idTeacher);

  console.log(list_my_courses);
  for (let i = 0; i < list_my_courses.length; i++) {
    list_my_courses[i].countLessons = await courseModel.countLessons(
      list_my_courses[i].idCourse
    );
    console.log(list_my_courses[i].countLessons);
  }
  res.render("vwAccount/myCourses", {
    layout: "userProfile",
    list_my_courses,
    mycourses: true,
  });
});

router.get("/teacher/myCourses/add", authTeacher, async function (req, res) {
  const idTeacher = req.session.authUser.idUser;
  res.render("vwCourses/add", {
    layout: "userProfile",
    idTeacher,
    teacherAdd: true,
  });
});

router.post(
  "/teacher/myCourses/add",
  uploadCourse.single("image"),
  async function (req, res) {
    const today = new Date();
    const lastModified = moment(today, "DD/MM/YYYY").format("YYYY-MM-DD");
    let imgPath;
    if (req.file === undefined) {
      imgPath = "";
    } else {
      imgPath = "/public/images/courses/" + req.file.filename;
    }

    const new_course = {
      imagePath: imgPath,
      price: req.body.price,
      idCat: req.body.field,
      title: req.body.title,
      description: req.body.description,
      detail: req.body.detail,
      lastModified: lastModified,
      idTeacher: req.body.idTeacher,
      status: req.body.status,
    };
    console.log(new_course);
    await courseModel.add(new_course);
    res.render("vwCourses/add", {
      layout: "userProfile.hbs",
    });
  }
);
function getDuration(url) {
  return new Promise((resolve, reject) => {
    videoUrlLink.youtube.getInfo(url, { hl: "en" }, (error, info) => {
      if (error) {
        //   console.error(error);
        return reject("ERROR : " + error);
      } else {
        const t = info.details;
        // const duration = prettyMilliseconds(Number(t.lengthSeconds * 1000), {
        //   colonNotation: true,
        // });

        let duration = "";
        if (typeof t !== "undefined") {
          const time = parseMilliseconds(t.lengthSeconds * 1000);
          time.hours = (time.hours < 10 ? "0" : "") + time.hours;
          time.minutes = (time.minutes < 10 ? "0" : "") + time.minutes;
          time.seconds = (time.seconds < 10 ? "0" : "") + time.seconds;
          duration = time.minutes + ":" + time.seconds;
        }
        return resolve(duration);
      }
    });
  });
}
router.get(
  "/teacher/myCourses/detail/:id",
  authTeacher,
  async function (req, res) {
    const id = req.params.id;

    const course = await courseModel.single(id);
    const lessons = await courseModel.getLessons(id);
    const feedbacks = await feedbackModel.allWithIdCourse(id);
    course.studentNumber = await registerModel.getStudentNumbers(id);

    // Invalid date
    const lastModified = moment(course.lastModified, "YYYY-MM-DD").format(
      "DD/MM/YYYY"
    );
    course.lastModified = lastModified;
    if (course === null) {
      return res.redirect("/admin/courses");
    }

    let firstLesson = null;
    if (lessons !== null) {
      for (let index = 0; index < lessons.length; index++) {
        const dur = await getDuration(lessons[index].videoPath);
        lessons[index].duration = dur;
      }
      firstLesson = lessons[0];
    }

    //Feedback's part
    let count_feedbacks_star = [
      { star: "1", count: 0 },
      { star: "2", count: 0 },
      { star: "3", count: 0 },
      { star: "4", count: 0 },
      { star: "5", count: 0 },
    ];

    feedbacks.forEach((element) => {
      element.dateRating = moment(element.dateRating, "YYYY-MM-DD").format(
        "MMMM Do YYYY"
      );
      count_feedbacks_star[element.ratingPoint - 1].count++;
    });
    count_feedbacks_star.reverse();

    let total_feedback_point = await feedbackModel.getRatingPoint(
      course.idCourse
    );

    res.render("vwAccount/myCourseDetail", {
      course,
      lessons,
      firstLesson,
      feedbacks,
      count_feedback: feedbacks.length,
      total_feedback_point,
      count_feedbacks_star,
    });
  }
);

router.post(
  "/teacher/myCourses/patch",
  uploadCourse.single("image"),
  async (req, res) => {
    let imgPath;
    console.log(req.body.previewImage);
    if (req.file === undefined) {
      imgPath = req.body.previewImage;
    } else {
      imgPath = "/public/images/courses/" + req.file.filename;
    }

    const today = new Date();
    let lastModified = moment(today, "DD/MM/YYYY").format("YYYY-MM-DD");
    const new_course = {
      id: req.body.idCourse,
      imagePath: imgPath,
      price: req.body.price,
      idCat: req.body.field,
      title: req.body.title,
      description: req.body.description,
      detail: req.body.detail,
      lastModified: lastModified,
      idTeacher: req.session.authUser.idUser,
      status: req.body.status,
    };

    console.log(new_course);
    await courseModel.patch(new_course);
    console.log(req.headers.referer);
    res.redirect(req.headers.referer);
  }
);

router.post("/teacher/myCourses/delete/", async function (req, res) {
  await courseModel.delete(req.body.idCourse);
  res.redirect("/account/teacher/myCourses");
});

router.post(
  "/lesson-add",
  uploadLesson.single("add_lesson_image_new"),
  async function (req, res) {
    let imgPath;
    if (req.file === undefined) {
      imgPath = "";
    } else {
      imgPath = "/public/images/lessons/" + req.file.filename;
    }
    const new_lesson = {
      idCourse: req.body.id,
      imagePath: imgPath,
      chapter: req.body.add_lesson_chapter,
      chapterName: req.body.add_lesson_name,
      videoPath: req.body.add_lesson_video,
      isPreview: req.body.add_lesson_isPreview,
    };

    await courseModel.addLesson(new_lesson);

    res.redirect(req.headers.referer);
  }
);

router.post(
  "/lesson-patch",
  uploadLesson.single("lesson_image_new"),
  async function (req, res) {
    if (req.body.deleteOrder == "true") {
      console.log(req.body.deleteOrder);
      await courseModel.deleteLesson(req.body.id, req.body.lesson_chapter);
      res.redirect(req.headers.referer);
      return;
    }

    let imgPath;
    if (req.file === undefined) {
      imgPath = req.body.lesson_image;
    } else {
      imgPath = "/public/images/lessons/" + req.file.filename;
    }
    // console.log(req.body.lesson_name);
    const new_lesson = {
      idCourse: req.body.id,
      imagePath: imgPath,
      chapter: req.body.lesson_chapter,
      chapterName: req.body.lesson_name,
      videoPath: req.body.lesson_video,
      isPreview: req.body.lesson_isPreview,
    };

    await courseModel.patchLesson(new_lesson);

    res.redirect(req.headers.referer);
  }
);
module.exports = router;
