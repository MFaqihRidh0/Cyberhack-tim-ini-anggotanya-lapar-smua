const express = require('express');
const router = express.Router();
const { list, create, confirm } = require('../controllers/sampleDispatches.controller');
const { verifyToken } = require('../middleware/auth');
const { allowRoles } = require('../middleware/rbac');

router.get('/', verifyToken, list);
router.post('/', verifyToken, allowRoles('MANAGER'), create);
router.patch('/:id/confirm', verifyToken, allowRoles('MANAGER'), confirm);

module.exports = router;
