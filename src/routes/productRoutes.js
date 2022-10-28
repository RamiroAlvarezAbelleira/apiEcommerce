const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const multerMW = require('../middleware/multerMW');
const upload = multerMW('products', 'product-');
const productValidation = require('../middleware/productValidatorMW');

/*RUTAS*/
router.get('/', productController.list);
router.get('/destacados', productController.highlights);
router.get('/info-formulario', productController.formInfo);
router.post('/crear', upload.array('image'), productValidation, productController.create);
router.get('/detalle/:id', productController.productDetail);
router.put('/editar/:id', upload.array('image'), productValidation, productController.edit);
router.delete('/eliminar/:id', productController.delete);

module.exports = router;