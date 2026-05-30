const express = require('express');
const router = express.Router();
const { list, getById, updateWarehouse, generateQR } = require('../controllers/finishedLots.controller');
const { verifyToken } = require('../middleware/auth');
const { allowRoles } = require('../middleware/rbac');

router.get('/', verifyToken, list);
router.get('/:id', verifyToken, getById);
router.get('/:id/qr', verifyToken, generateQR);
router.patch('/:id/warehouse', verifyToken, allowRoles('OPERATOR', 'MANAGER'), updateWarehouse);

module.exports = router;
