const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth'); 

// POST /auth/login
router.post('/login', authController.login);

// POST /auth/refresh-token
router.post('/refresh-token', verifyToken, authController.refreshToken); 
// POST /auth/logout
router.post('/logout', authController.logout); 

module.exports = router;