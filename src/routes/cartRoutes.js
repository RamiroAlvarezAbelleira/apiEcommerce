const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');

router.get('/:id', cartController.show);
router.delete('/eliminar/:id', cartController.delete);
router.put('/editar/:id', cartController.update);
router.post('/agregar', cartController.add);

module.exports = router;