const { body } = require('express-validator');
const path = require('path');

const validations = [
    body('firstName').notEmpty().withMessage('Debe ingresar un nombre'),
    body('lastName').notEmpty().withMessage('Debe ingresar un apellido'),
    body('birthdate').notEmpty().withMessage('Debe ingresar su fecha de nacimiento'),
    body('email').notEmpty().withMessage('Debe ingresar un email').bail(),
    body('password').custom((value, { req }) => {
        if(value != req.body['repassword']) {
            throw new Error('las contraseñas deben coincidir')
        }
        return true;
    }),
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