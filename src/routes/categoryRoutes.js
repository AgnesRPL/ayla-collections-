const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { verifyToken, isAdmin } = require('../middleware/auth');

// GET /categories - Mengambil semua kategori (Hanya Admin)
router.get('/', verifyToken, isAdmin, categoryController.getAllCategories);

// GET /categories/:id - Mengambil kategori berdasarkan id (Semua yang Login)
router.get('/:id', verifyToken, categoryController.getCategoryById);

// POST /categories - Menyimpan kategori baru (Hanya Admin)
router.post('/', verifyToken, isAdmin, categoryController.createCategory);

// PUT /categories/:id - Mengubah kategori yang ada berdasarkan id (Hanya Admin)
router.put('/:id', verifyToken, isAdmin, categoryController.updateCategory);

// DELETE /categories/:id - Menghapus kategori yang ada berdasarkan id (Hanya Admin)
router.delete('/:id', verifyToken, isAdmin, categoryController.deleteCategory);

module.exports = router;