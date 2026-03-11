const jwt = require('jsonwebtoken');

// [1] Middleware untuk Verikikasi Token JWT (Implementasi Wajib)
const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Akses ditolak. Token tidak disediakan.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        // Simpan data user (id, role) dari token ke req.user
        req.user = decoded; 
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Token tidak valid atau kadaluarsa.' });
    }
};

// [2] Middleware untuk Otorisasi: Hanya Admin yang Boleh Akses
const isAdmin = (req, res, next) => {
    if (req.user.role !== 'Admin') { 
        return res.status(403).json({
            message: 'Akses ditolak. Hanya Admin yang diizinkan.'
        });
    }
    next();
};

// [3] Middleware untuk Otorisasi: Hanya Admin atau Kasir yang Boleh Akses
const isCashierOrAdmin = (req, res, next) => {
    const role = req.user.role;
    if (role !== 'Admin' && role !== 'Kasir') { 
        return res.status(403).json({
            message: 'Akses ditolak. Harus Admin atau Kasir.'
        });
    }
    next();
};

// [4] Middleware untuk Otorisasi: Hanya Kasir yang Boleh Akses
const isCashierOnly = (req, res, next) => {
    if (req.user.role !== 'Kasir') { 
        return res.status(403).json({
            message: 'Akses ditolak. Hanya Kasir yang diizinkan.'
        });
    }
    next();
};

module.exports = {
    verifyToken,
    isAdmin,
    isCashierOrAdmin,
    isCashierOnly,
};