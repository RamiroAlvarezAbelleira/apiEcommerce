const { body } = require('express-validator');
const { User } = require('../database/models');
const { Op } = require('sequelize');
const bcryptjs = require('bcryptjs');

const validations = [
    body('email').notEmpty().withMessage('Debe ingresar un email').bail()
    .custom( async (value, { req }) => {
        let itExists = await User.findOne({
            where: {
                email: {[Op.like]: value}
            }
        });
        console.log(itExists.password)
        if(itExists == undefined) {
            throw new Error('mail o contraseña incorrecto');
        }
        return true;
    }).bail(),
    body('password').notEmpty().withMessage('mail o contraseña incorrecto').bail()
    .custom( async (value, { req }) => {
        let user = await User.findOne({
            where: {
                email: {[Op.like]: req.body.email}
            }
        });
        
        if(!bcryptjs.compareSync(value, user.password)) {
            throw new Error('mail o contraseña incorrecto')
        }
        return true;
    })
]

module.exports = validations