module.exports = {
  auth(req, res, next) {
    if (req.session.auth === false) {
      req.session.retUrl = req.originalUrl;
      return res.redirect("/account/signin");
    }
    next();
  },
  authAdmin(req, res, next) {
    if (req.session.auth === false) {
      req.session.retUrl = req.originalUrl;
      return res.redirect("/account/signin");
    } else if (req.session.isAdmin === false) {
      const url = req.headers.referer || "/";
      res.redirect(url);
    }
    next();
  },
};
