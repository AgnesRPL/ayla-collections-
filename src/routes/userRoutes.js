const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken, isAdmin } = require('../middleware/auth'); // Tidak perlu isCashierOrAdmin

// GET /users/profile - Mengambil profil user yang sedang login (Semua role)
router.get('/profile', verifyToken, userController.getProfile);

// POST /users/register - Mendaftarkan user baru (Hanya Admin)
router.post('/register', verifyToken, isAdmin, userController.registerUser);

// PUT /users/deactivate-user - Menonaktifkan user (Admin Only, ID di Body)
router.put('/deactivate-user', verifyToken, isAdmin, userController.deactivateUser);

module.exports = router;