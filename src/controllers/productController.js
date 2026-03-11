const pool = require('../db/pool');

// GET ALL PRODUCTS (JOIN with categories)
const getAllProducts = async (req, res) => {
    try {
        const query = `
            SELECT 
                p.id, 
                p.name, 
                p.price, 
                p.stock, 
                p.description, 
                c.name as category_name,
                p.created_at
            FROM products p 
            JOIN categories c ON p.category_id = c.id
            ORDER BY p.id ASC
        `;
        const result = await pool.query(query);
        res.status(200).json({
            message: 'Successfully retrieved all products',
            data: result.rows
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// GET PRODUCT BY ID (JOIN with categories)
const getProductById = async (req, res) => {
    const { id } = req.params;
    try {
        const query = `
            SELECT 
                p.id, 
                p.name, 
                p.price, 
                p.stock, 
                p.description, 
                c.name as category_name,
                p.created_at
            FROM products p
            JOIN categories c ON p.category_id = c.id
            WHERE p.id = $1
        `;
        const result = await pool.query(query, [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: `Product with ID ${id} not found` });
        }
        res.status(200).json({
            message: `Successfully retrieved product with ID ${id}`,
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error fetching product by ID:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// CREATE NEW PRODUCT (Admin Only)
const createProduct = async (req, res) => {
    const { name, category_id, price, stock, description } = req.body;
    if (!name || !category_id || !price || !stock) {
        return res.status(400).json({ message: 'Name, category_id, price, and stock are required' });
    }
    try {
        const query = `
            INSERT INTO products (name, category_id, price, stock, description) 
            VALUES ($1, $2, $3, $4, $5) 
            RETURNING id, name, category_id, price, stock, description
        `;
        const result = await pool.query(query, [name, category_id, price, stock, description]);
        res.status(201).json({
            message: 'Product successfully created',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};

// UPDATE PRODUCT (Admin Only)
const updateProduct = async (req, res) => {
    const { id } = req.params;
    const { name, category_id, price, stock, description } = req.body;
    
    if (!name && !category_id && !price && !stock && !description) {
        return res.status(400).json({ message: 'At least one field (name, category_id, price, stock, or description) is required for update' });
    }

    try {
        // Logika untuk membuat query UPDATE dinamis
        const fields = [];
        const values = [];
        let index = 1;

        if (name) { fields.push(`name = $${index++}`); values.push(name); }
        if (category_id) { fields.push(`category_id = $${index++}`); values.push(category_id); }
        if (price) { fields.push(`price = $${index++}`); values.push(price); }
        if (stock) { fields.push(`stock = $${index++}`); values.push(stock); }
        if (description) { fields.push(`description = $${index++}`); values.push(description); }
        
        fields.push(`updated_at = NOW()`);
        
        // ID produk selalu menjadi nilai terakhir
        values.push(id); 

        const query = `
            UPDATE products 
            SET ${fields.join(', ')} 
            WHERE id = $${index} 
            RETURNING id, name, updated_at
        `;

        const result = await pool.query(query, values);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: `Product with ID ${id} not found` });
        }

        res.status(200).json({
            message: `Product with ID ${id} successfully updated`,
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};

// DELETE PRODUCT (Admin Only)
const deleteProduct = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING id', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: `Product with ID ${id} not found` });
        }
        res.status(200).json({ message: `Product with ID ${id} successfully deleted` });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

module.exports = {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
};