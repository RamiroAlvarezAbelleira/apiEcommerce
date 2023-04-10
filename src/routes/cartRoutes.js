const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');

router.get('/:id', cartController.show);
router.post('/agregar', cartController.add);

module.exports = router;