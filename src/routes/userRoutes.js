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
router.post('/ingresar', userController.login);
router.post('/crear', upload.array('image'), validations, userController.store);
router.get('/:id', userController.detail);
router.put('/editar/:id', upload.array('image'), validations, userController.update);
router.delete('/eliminar/:id', userController.delete);



module.exports = router;