const { body } = require('express-validator');
const path = require('path');
const { User } = require('../database/models');
const { Op } = require('sequelize');

const validations = [
    body('firstName').notEmpty().withMessage('Debe ingresar un nombre'),
    body('lastName').notEmpty().withMessage('Debe ingresar un apellido'),
    body('birthdate').notEmpty().withMessage('Debe ingresar su fecha de nacimiento'),
    body('email').notEmpty().withMessage('Debe ingresar un email').bail()
    .custom( async (value, { req }) => {
        let itExists = await User.findOne({
            where: {
                email: {[Op.like] : value}
            }
        });
        if(itExists != undefined) {
            throw new Error('este mail se encuentra registrado');
        }
        return true;
    }),
    body('password').notEmpty().withMessage('Debe ingresar una contraseña').bail()
    .custom((value, { req }) => {
        if(value != req.body['user-confirm-password']) {
            throw new Error('las contraseñas deben coincidir')
        }
        return true;
    }),
    body('repassword').notEmpty().withMessage('Debe reingresar la contraseña'),
    body('image').custom((value, { req }) => {
        let files = req.files;
        let acceptedExtensions = ['.jpg', '.jpeg', '.png'];
        
        if(files) {
            files.forEach(file => {
                let fileExtension = path.extname(file.originalname);
                if(!acceptedExtensions.includes(fileExtension)) {
                    throw new Error('extensiones aceptadas: .png .jpg .jpeg')
                }
            })
        }
        
        return true;
    })
]

module.exports = validations