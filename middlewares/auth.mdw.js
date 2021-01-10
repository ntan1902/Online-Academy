module.exports = {
  auth(req, res, next) {
    if (req.session.auth === false) {
      req.session.retUrl = req.originalUrl;
      return res.redirect("/account/signin");
    }
    next();
  },
  authTeacher(req, res, next) {
    if (req.session.auth === false) {
      req.session.retUrl = req.originalUrl;
      return res.redirect("/account/signin");
    } else if (req.session.isTeacher === false) {
      const url = "/";
      res.redirect(url);
    }
    next();
  },
  authAdmin(req, res, next) {
    if (req.session.auth === false) {
      req.session.retUrl = req.originalUrl;
      return res.redirect("/account/signin");
    } else if (req.session.isAdmin === false) {
      const url = "/";
      res.redirect(url);
    }
    next();
  },
};
