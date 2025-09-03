module.exports = (req, res, next) => {
  if (req.session && req.session.user && req.session.user.role === 'admin') {
    next();
  } else {
    res.status(403).send("Bu alana yalnızca yöneticiler erişebilir.");
  }
};
