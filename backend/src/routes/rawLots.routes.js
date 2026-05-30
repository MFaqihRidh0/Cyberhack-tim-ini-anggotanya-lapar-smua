const express = require('express');
const router = express.Router();
const { list, create, getById, getRemaining, updateStatus, generateQR } = require('../controllers/rawLots.controller');
const { verifyToken } = require('../middleware/auth');
const { allowRoles } = require('../middleware/rbac');

router.get('/', verifyToken, list);
router.post('/', verifyToken, allowRoles('OPERATOR', 'MANAGER'), create);
router.get('/:id', verifyToken, getById);
router.get('/:id/remaining', verifyToken, getRemaining);
router.get('/:id/qr', verifyToken, generateQR);
router.patch('/:id/status', verifyToken, updateStatus); // role dicek per status tujuan di controller

module.exports = router;
