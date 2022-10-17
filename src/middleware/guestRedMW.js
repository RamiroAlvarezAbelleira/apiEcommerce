function guestRedMW(req, res, next) {
    if(req.session.userLogged) {
        res.redirect('/usuarios/profile')
    }
    next()
}

module.exports = guestRedMW