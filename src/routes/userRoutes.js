const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const multerMW = require('../middleware/multerMW');
const upload = multerMW('users', 'user-');
const validations = require('../middleware/validatorMW')
const loginValidations = require('../middleware/loginValidatorMW')
const guestRedMW = require('../middleware/guestRedMW')
const loggedUserRedMW = require('../middleware/loggedUserRedMW')

/*RUTAS*/

router.get('/', userController.list);
router.get('/:id', userController.detail);
router.post('/crear', upload.array('image'), userController.store);
//router.put('/editar/:id', upload.array('image'), userController.update);
//router.delete('/eliminar/:id', userController.delete);



module.exports = router;