const express = require('express');
const router = express.Router();
const { list, listPending, create, getById } = require('../controllers/qcInspections.controller');
const { verifyToken } = require('../middleware/auth');
const { allowRoles } = require('../middleware/rbac');

router.get('/', verifyToken, list);
router.get('/pending', verifyToken, listPending);
router.post('/', verifyToken, allowRoles('QC_STAFF', 'MANAGER'), create);
router.get('/:id', verifyToken, getById);

module.exports = router;
