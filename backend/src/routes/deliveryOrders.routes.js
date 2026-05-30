const express = require('express');
const router = express.Router();
const { list, create, getById } = require('../controllers/deliveryOrders.controller');
const { verifyToken } = require('../middleware/auth');
const { allowRoles } = require('../middleware/rbac');

router.get('/', verifyToken, list);
router.post('/', verifyToken, allowRoles('OPERATOR', 'MANAGER'), create);
router.get('/:id', verifyToken, getById);

module.exports = router;
