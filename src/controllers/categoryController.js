const pool = require('../db/pool');

// GET /categories
const getAllCategories = async (req, res) => {
    try {
        const result = await pool.query('SELECT id, name, created_at, updated_at FROM categories ORDER BY id ASC');
        res.status(200).json({
            message: 'Successfully retrieved all categories',
            data: result.rows
        });
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// GET /categories/:id
const getCategoryById = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT id, name, created_at, updated_at FROM categories WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: `Category with ID ${id} not found` });
        }
        res.status(200).json({
            message: `Successfully retrieved category with ID ${id}`,
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error fetching category by ID:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// POST /categories (Admin Only)
const createCategory = async (req, res) => {
    const { name } = req.body;
    if (!name) {
        return res.status(400).json({ message: 'Category name is required' });
    }
    try {
        const result = await pool.query('INSERT INTO categories (name) VALUES ($1) RETURNING id, name, created_at', [name]);
        res.status(201).json({
            message: 'Category successfully created',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error creating category:', error);
        res.status(500).json({ message: 'Gagal membuat kategori. Nama kategori sudah digunakan.' });
    }
};

// PUT /categories/:id (Admin Only)
const updateCategory = async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    if (!name) {
        return res.status(400).json({ message: 'Category name is required' });
    }
    try {
        const result = await pool.query('UPDATE categories SET name = $1, updated_at = NOW() WHERE id = $2 RETURNING id, name, updated_at', [name, id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: `Category with ID ${id} not found` });
        }
        res.status(200).json({
            message: `Category with ID ${id} successfully updated`,
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error updating category:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// DELETE /categories/:id (Admin Only)
const deleteCategory = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM categories WHERE id = $1 RETURNING id', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: `Category with ID ${id} not found` });
        }
        res.status(200).json({ message: `Category with ID ${id} successfully deleted` });
    } catch (error) {
        console.error('Error deleting category:', error);
        res.status(500).json({ message: 'Gagal menghapus kategori. Kategori ini masih terikat dengan satu atau lebih produk.' });
    }
};

module.exports = {
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory
};