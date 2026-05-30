const express = require('express');
const router = express.Router();
const { list, create, getById, update, addInput } = require('../controllers/productionOrders.controller');
const { verifyToken } = require('../middleware/auth');
const { allowRoles } = require('../middleware/rbac');

router.get('/', verifyToken, list);
router.post('/', verifyToken, allowRoles('PPIC', 'MANAGER'), create);
router.get('/:id', verifyToken, getById);
router.patch('/:id', verifyToken, allowRoles('PPIC', 'MANAGER'), update);
router.post('/:id/inputs', verifyToken, allowRoles('PPIC', 'MANAGER'), addInput);

module.exports = router;
