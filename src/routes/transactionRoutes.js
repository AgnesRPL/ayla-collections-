// src/routes/transactionRoutes.js
const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const { verifyToken, isAdmin, isCashierOrAdmin, isCashierOnly } = require('../middleware/auth'); 

// GET /transactions - Ambil semua transaksi (Hanya Kasir)
router.get('/', verifyToken, isCashierOnly, transactionController.getAllTransactions);

// GET /transactions/:id - Ambil transaksi berdasarkan ID (Hanya Kasir)
router.get('/:id', verifyToken, isCashierOnly, transactionController.getTransactionById);

// POST /transactions - Simpan transaksi baru (Hanya Kasir)
router.post('/', verifyToken, isCashierOnly, transactionController.createTransaction);

// PUT /transactions/:id - Ubah transaksi yang sudah ada (Hanya Admin)
router.put('/:id', verifyToken, isCashierOrAdmin, transactionController.updateTransaction);

module.exports = router;