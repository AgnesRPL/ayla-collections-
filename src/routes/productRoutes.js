const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { verifyToken, isAdmin, isCashierOrAdmin } = require('../middleware/auth'); // Tambahkan isCashierOrAdmin

// GET /products - Melihat list semua product (Kasir atau Admin)
// Diubah dari Admin Only menjadi Kasir atau Admin (isCashierOrAdmin) agar Kasir bisa melihat produk untuk transaksi.
router.get('/', verifyToken, isAdmin, productController.getAllProducts);

// GET /products/:id - Melihat product berdasarkan id (Semua yang Login)
router.get('/:id', verifyToken, productController.getProductById);

// POST /products - Menyimpan product baru (Hanya Admin)
router.post('/', verifyToken, isAdmin, productController.createProduct);

// PUT /products/:id - Mengubah product yang ada berdasarkan id (Hanya Admin)
router.put('/:id', verifyToken, isAdmin, productController.updateProduct);

// DELETE /products/:id - Menghapus product yang ada berdasarkan id (Hanya Admin)
router.delete('/:id', verifyToken, isAdmin, productController.deleteProduct);

module.exports = router;