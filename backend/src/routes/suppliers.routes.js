const express = require('express');
const router = express.Router();
const { list, create, getById, update } = require('../controllers/suppliers.controller');
const { verifyToken } = require('../middleware/auth');
const { allowRoles } = require('../middleware/rbac');

router.get('/', verifyToken, list);
router.post('/', verifyToken, allowRoles('MANAGER'), create);
router.get('/:id', verifyToken, getById);
router.patch('/:id', verifyToken, allowRoles('MANAGER'), update);

module.exports = router;
