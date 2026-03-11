const pool = require('../db/pool');
const bcrypt = require('bcryptjs'); 

// [1] GET /profile - Mengambil profil user yang sedang login (Semua role)
exports.getProfile = async (req, res) => {
    // ID user diambil dari token yang diverifikasi oleh middleware
    const userId = req.user.id; 
    try {
        const result = await pool.query('SELECT id, fullname, username, email, role, is_active FROM users WHERE id = $1', [userId]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ 
                message: 'Profil user tidak ditemukan.' 
            });
        }

        res.json({
            message: 'Profile retrieved successfully',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error saat mengambil profil:', error);
        res.status(500).json({ 
            message: 'Gagal mengambil data profil.' 
        });
    }
};

// [2] POST /register - Membuat user baru (Dibatasi Admin Only di routes)
exports.registerUser = async (req, res) => {
    const { fullname, username, email, password } = req.body;
    const role = 'Kasir'; 
    const is_active = true; // User baru selalu aktif

    if (!fullname || !username || !email || !password) { 
        return res.status(400).json({ message: 'Semua field (fullname, username, email, password) wajib diisi.' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const query = `
            INSERT INTO users (fullname, username, email, password, role, is_active)
            VALUES ($1, $2, $3, $4, $5, $6) 
            RETURNING id, fullname, username, role`;
        
        const result = await pool.query(query, [fullname, username, email, hashedPassword, role, is_active]);

        res.status(201).json({ 
            message: 'User baru berhasil didaftarkan.',
            user: result.rows[0]
        });

    } catch (error) {
        if (error.code === '23505') { // PostgreSQL unique violation error code
            return res.status(400).json({ 
                message: 'Email atau username sudah terdaftar.' 
            });
        }
        console.error('Error saat register user:', error);
        res.status(500).json({ 
            message: 'Gagal mendaftarkan user baru.',
            error: error.message
        });
    }
};

// [3] PUT /deactivate-user - Menonaktifkan user berdasarkan ID (Admin Only)
exports.deactivateUser = async (req, res) => {
    const { id } = req.body;
    const adminId = req.user.id; // ID Admin yang sedang login diambil dari token
    const is_active = false; // Set menjadi nonaktif

    if (!id) {
        return res.status(400).json({ message: 'ID user wajib diisi di request body.' });
    }
    
    // --- PERBAIKAN UNTUK UKT NO. 30 ---
    // Cek apakah ID yang ingin dinonaktifkan sama dengan ID Admin yang sedang login
    if (parseInt(id) === parseInt(adminId)) {
        return res.status(403).json({
            message: 'Akses ditolak. Admin tidak dapat menonaktifkan akun sendiri.'
        });
    }
  

    try {
        const query = `
            UPDATE users 
            SET is_active = $1, updated_at = NOW()
            WHERE id = $2
            RETURNING id, username, is_active, updated_at
        `;

        const result = await pool.query(query, [is_active, id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: `User with ID ${id} not found` });
        }

        res.status(200).json({
            message: `User ${result.rows[0].username} berhasil dinonaktifkan.`,
            data: result.rows[0]
        });

    } catch (error) {
        console.error('Error saat menonaktifkan user:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};

module.exports = {
    getProfile: exports.getProfile,
    registerUser: exports.registerUser,
    deactivateUser: exports.deactivateUser,
};