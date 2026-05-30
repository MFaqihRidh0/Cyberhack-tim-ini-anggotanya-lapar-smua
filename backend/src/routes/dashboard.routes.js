const express = require('express');
const router = express.Router();
const { summary } = require('../controllers/dashboard.controller');
const { verifyToken } = require('../middleware/auth');

router.get('/summary', verifyToken, summary);

module.exports = router;
