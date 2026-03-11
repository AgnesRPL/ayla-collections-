const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const pool = require("./db");
const bcrypt = require("bcrypt");

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// --- API AUTH ---
app.post('/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const result = await pool.query('SELECT * FROM users WHERE username=$1', [username]);
        if (result.rows.length === 0) return res.status(401).json({ message: 'User tidak ditemukan' });
        const user = result.rows[0];
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(401).json({ message: 'Password salah' });
        const token = jwt.sign({ id: user.id, role: user.role, username: user.username, fullname: user.fullname }, 'SECRET_KEY', { expiresIn: '1h' });
        res.json({ message: 'Login berhasil', token: token });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

app.post('/auth/register', async (req, res) => {
    try {
        const { username, fullname, email, password, role } = req.body;
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = await pool.query(
            "INSERT INTO users (username, fullname, email, password, role, is_active) VALUES ($1, $2, $3, $4, $5, true) RETURNING *",
            [username, fullname, email, hashedPassword, role]
        );
        res.json(newUser.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Gagal register user");
    }
});

// --- API CATEGORIES (YANG TADI HILANG) ---
app.get('/categories', async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM categories ORDER BY name ASC");
        res.json(result.rows);
    } catch (err) {
        res.status(500).send("Server Error");
    }
});

// --- API USERS (YANG TADI HILANG) ---
app.get('/users', async (req, res) => {
    try {
        const result = await pool.query("SELECT id, username, fullname, email, role, is_active, password FROM users ORDER BY id DESC");
        res.json(result.rows);
    } catch (err) {
        res.status(500).send("Server Error");
    }
});

app.put('/users/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { is_active } = req.body;
        await pool.query("UPDATE users SET is_active = $1 WHERE id = $2", [is_active, id]);
        res.json({ message: "Status user diperbarui" });
    } catch (err) {
        res.status(500).send("Gagal update status");
    }
});

// --- API PRODUK ---
app.get('/products', async (req, res) => {
    try {
        const query = `SELECT id, category_id, name, price, stock, description,
            CASE 
                WHEN name ILIKE '%Kaos Dry-Fit%' THEN 'https://img.lazcdn.com/g/p/0b63ffef8c0f52ec30eb43a49a55bbfe.png_720x720q80.png'
                WHEN name ILIKE '%Sabuk Kulit%' THEN 'https://down-id.img.susercontent.com/file/e105234316b43cea677a99fcbfb7a0a3'
                WHEN name ILIKE '%Maxi Dress%' THEN 'https://971b4fa25d33db46e77b-bd9966589f41c17b0016a5f28759e048.ssl.cf2.rackcdn.com/product-hugerect-3636690-532330-1746132349-6656d0a87340fd310704f6a5ccf53363.746132350_type_hugerect_nid_3636690_uid_532330_0'
                WHEN name ILIKE '%Celana Jeans%' THEN 'https://img.lazcdn.com/g/p/2043ca66fd173cb3a8d0cac3c07f5df1.jpg_960x960q80.jpg_.webp'
                WHEN name ILIKE '%Sneakers Kasual%' THEN 'https://img.lazcdn.com/g/ff/kf/Sa946287df4bb414eab6cd0fd328b31efq.jpg_720x720q80.jpg'
                WHEN name ILIKE '%Kaos Polos Cotton%' THEN 'https://down-id.img.susercontent.com/file/id-11134207-7rasc-m2rxts018yx087'
                WHEN name ILIKE '%Topi Baseball%' THEN 'https://down-id.img.susercontent.com/file/id-11134207-7r98o-lo6n66vvnklv5e'
                WHEN name ILIKE '%Rok Plisket%' THEN 'https://img.lazcdn.com/g/p/44613f2fdc11bf90b0f683aa222d2368.png_960x960q80.png_.webp'
                WHEN name ILIKE '%Heels Formal%' THEN 'https://www.static-src.com/wcsstore/Indraprastha/images/catalog/full/catalog-image/MTA-143123294/no_brand_sepatu_sendal_wanita_pesta_kerja_formal_kondangan_ak11_diamond_high_heels_hak_tinggi_9cm_hitam_black_elegan_sexy_full01_hx1fu8ge.jpg'
                WHEN name ILIKE '%Kemeja Batik%' THEN 'https://media.karousell.com/media/photos/products/2024/6/28/kemeja_batik_modern_slim_fit_s_1719556665_4a48ff09_progressive.jpg'
                WHEN name ILIKE '%Blouse Korean%' THEN 'https://id-test-11.slatic.net/p/6ca4136a3bdb919bc8d6d08fd9bf28c8.jpg'
                WHEN name ILIKE '%Baju Kaos Jersey%' THEN 'https://i.pinimg.com/736x/82/5b/17/825b17952091c3d72e4e0408450be73a.jpg'
                ELSE COALESCE(image, 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=400')
            END as image 
            FROM products ORDER BY id DESC`;
        const allProducts = await pool.query(query);
        res.json(allProducts.rows);
    } catch (err) {
        res.status(500).send("Server Error");
    }
});

app.post('/products', async (req, res) => {
    try {
        const { category_id, name, price, stock, description, image } = req.body;
        const finalDesc = description || "Produk berkualitas dari Ayla Collection";
        const finalImg = image || "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=400";
        const newProduct = await pool.query(
            "INSERT INTO products (category_id, name, price, stock, description, image) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
            [category_id, name, price, stock, finalDesc, finalImg]
        );
        res.json(newProduct.rows[0]);
    } catch (err) {
        res.status(500).send("Gagal tambah produk");
    }
});

app.put('/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { category_id, name, price, stock, description, image } = req.body;
        await pool.query(
            "UPDATE products SET category_id=$1, name=$2, price=$3, stock=$4, description=COALESCE($5, description), image=COALESCE($6, image) WHERE id=$7",
            [category_id, name, price, stock, description, image, id]
        );
        res.json({ message: "Produk diperbarui" });
    } catch (err) {
        res.status(500).send("Gagal update produk");
    }
});

app.delete('/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query("DELETE FROM products WHERE id = $1", [id]);
        res.json({ message: "Produk dihapus" });
    } catch (err) {
        res.status(500).send("Gagal hapus: Produk ini mungkin terikat data transaksi.");
    }
});

app.listen(5000, () => {
    console.log("🚀 Server berjalan di http://localhost:5000");
});