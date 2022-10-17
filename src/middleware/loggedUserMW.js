function loggedUserMW(req, res, next) {
    res.locals.isLogged = false;
    res.locals.admin = false;

    if (req.session.userLogged) {
        res.locals.isLogged = true;
        res.locals.admin = req.session.userLogged.roleId == 1 ? true : false;
        res.locals.userLogged = req.session.userLogged
    }
    next()
}

module.exports = loggedUserMW