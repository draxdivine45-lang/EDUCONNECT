const express = require('express');
const userController = require('../controllers/userController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/me', requireAuth, userController.getMe);
router.put('/me', requireAuth, userController.updateMe);

module.exports = router;
