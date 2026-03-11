const { Pool } = require("pg");

const pool = new Pool({
    user: "postgres",       
    host: "localhost",      
    database: "toko_online", 
    password: "postgres",      
    port: 5432,
});

// Untuk tes koneksi di terminal
pool.connect((err, client, release) => {
    if (err) {
        return console.error('Waduh, koneksi database gagal total:', err.stack);
    }
    console.log('Koneksi ke Database PostgreSQL Berhasil.');
    release();
});

module.exports = pool;