const jwt = require('jsonwebtoken');
const pool = require('../db/pool');
const bcrypt = require('bcryptjs'); 

// [1] POST /auth/login 
exports.login = async (req, res) => {
    const { username, password } = req.body;
    
    try {
        const result = await pool.query('SELECT id, username, password, role, email, is_active FROM users WHERE username = $1', [username]);
        const user = result.rows[0];

        if (!user) {
            return res.status(401).json({ message: 'Username atau password salah.' });
        }
        
        // Cek apakah user aktif
        if (user.is_active === false) {
             return res.status(401).json({ message: 'Akun ini telah dinonaktifkan.' });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).json({ message: 'Username atau password salah.' });
        }

        const token = jwt.sign(
            { id: user.id, role: user.role, username: user.username, email: user.email },
            process.env.JWT_SECRET_KEY,
            { expiresIn: process.env.JWT_ACCESS_EXPIRATION || '1h' }
        );

        res.json({
            message: 'Login berhasil',
            token: token,
            role: user.role,
            username: user.username
        });
    
    } catch (error) {
        console.error('Error saat proses login:', error);
        res.status(500).json({ message: 'Server error saat proses login.' });
    }
};

// [2] POST /auth/refresh-token 
exports.refreshToken = (req, res) => {
    try {
        // Data user (id, role, etc.) sudah ada di req.user dari middleware verifyToken
        const userPayload = req.user;

        // Buat token baru dengan waktu kedaluwarsa baru
        const newToken = jwt.sign(
            { id: userPayload.id, role: userPayload.role, username: userPayload.username, email: userPayload.email },
            process.env.JWT_SECRET_KEY,
            { expiresIn: process.env.JWT_ACCESS_EXPIRATION || '1h' } 
        );

        res.json({
            message: 'Token berhasil diperbarui',
            token: newToken,
            role: userPayload.role
        });

    } catch (error) {
        // Jika terjadi error (misalnya token sudah sangat kedaluwarsa), ini tertangkap di verifyToken, 
        // tapi kita tambahkan tangkapan di sini sebagai fallback.
        console.error('Error saat refresh token:', error);
        res.status(500).json({ message: 'Gagal memperbarui token.' });
    }
};

// [3] POST /auth/logout (PERBAIKAN IMPLEMENTASI)
exports.logout = (req, res) => {
    // Dengan JWT, logout hanya berarti klien menghapus token yang disimpan (localStorage/Cookie).
    // Di sisi server, kita hanya mengonfirmasi permintaannya.
    res.json({ message: 'Logout berhasil. Token telah dihilangkan di sisi klien.' });
};

module.exports = {
    login: exports.login,
    refreshToken: exports.refreshToken,
    logout: exports.logout,
};