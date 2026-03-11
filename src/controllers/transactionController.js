const pool = require('../db/pool');

// GET ALL TRANSACTIONS (Cashier or Admin)
const getAllTransactions = async (req, res) => {
    try {
        const query = `
            SELECT 
                t.id, 
                t.total_amount,
                t.payment_method, 
                t.created_at, 
                u.username AS cashier_username
            FROM transactions t
            JOIN users u ON t.user_id = u.id
            ORDER BY t.created_at DESC
        `;
        const result = await pool.query(query);
        res.status(200).json({
            message: 'Successfully retrieved all transactions',
            data: result.rows
        });
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// GET TRANSACTION BY ID (Cashier or Admin)
const getTransactionById = async (req, res) => {
    const { id } = req.params;
    try {
        // 1. Ambil data header transaksi
        const transactionQuery = `
            SELECT 
                t.id, 
                t.total_amount,
                t.payment_method, 
                t.created_at, 
                u.username AS cashier_username
            FROM transactions t
            JOIN users u ON t.user_id = u.id
            WHERE t.id = $1
        `;
        const transactionResult = await pool.query(transactionQuery, [id]);

        if (transactionResult.rows.length === 0) {
            return res.status(404).json({ message: `Transaction with ID ${id} not found` });
        }

        // 2. Ambil item-item transaksi
        const itemsQuery = `
            SELECT 
                ti.product_id, 
                p.name AS product_name, 
                ti.quantity, 
                ti.unit_price, 
                ti.subtotal,
                ti.size 
            FROM transaction_items ti
            JOIN products p ON ti.product_id = p.id
            WHERE ti.transaction_id = $1
        `;
        const itemsResult = await pool.query(itemsQuery, [id]);

        const transactionData = {
            ...transactionResult.rows[0],
            items: itemsResult.rows
        };

        res.status(200).json({
            message: `Successfully retrieved transaction with ID ${id}`,
            data: transactionData
        });
    } catch (error) {
        console.error('Error fetching transaction by ID:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// CREATE NEW TRANSACTION (Cashier or Admin) - Menggunakan Database Transaction
const createTransaction = async (req, res) => {
    const { items, payment_method } = req.body; 
    const cashier_id = req.user.id;

    if (!items || items.length === 0) {
        return res.status(400).json({ message: 'Transaction must contain at least one item' });
    }
    if (!payment_method) {
         return res.status(400).json({ message: 'Payment method is required' });
    }

    const client = await pool.connect();
    
    try {
        await client.query('BEGIN'); // START TRANSACTION

        let total_amount = 0;
        const transactionItems = [];

        // 1. Verifikasi stok dan hitung total amount
        for (const item of items) {
            const { product_id, quantity, size } = item; 
            
            const productResult = await client.query('SELECT name, price, stock FROM products WHERE id = $1 FOR UPDATE', [product_id]); 
            if (productResult.rows.length === 0) {
                throw new Error(`Product with ID ${product_id} not found`);
            }
            const product = productResult.rows[0];

            if (product.stock < quantity) {
                throw new Error(`Insufficient stock for product ${product.name}. Available: ${product.stock}, Requested: ${quantity}`);
            }

            const unit_price = parseFloat(product.price);
            const subtotal = unit_price * quantity;
            total_amount += subtotal;

            transactionItems.push({ product_id, quantity, unit_price, subtotal, product_name: product.name, size: size || null }); 
        }

        // 2. Buat entri di tabel 'transactions'
        const transactionQuery = `
            INSERT INTO transactions (user_id, total_amount, payment_method) 
            VALUES ($1, $2, $3) 
            RETURNING id, created_at, total_amount, payment_method
        `;
        const transactionResult = await client.query(transactionQuery, [cashier_id, total_amount, payment_method]);
        const newTransaction = transactionResult.rows[0];

        // 3. Masukkan entri di tabel 'transaction_items' dan kurangi stok
        for (const item of transactionItems) {
            const { product_id, quantity, unit_price, subtotal, size } = item;
            
            const itemQuery = `
                INSERT INTO transaction_items (transaction_id, product_id, quantity, unit_price, subtotal, size) 
                VALUES ($1, $2, $3, $4, $5, $6)
            `;
            await client.query(itemQuery, [newTransaction.id, product_id, quantity, unit_price, subtotal, size]);

            // Kurangi stok produk
            const stockUpdateQuery = 'UPDATE products SET stock = stock - $1 WHERE id = $2';
            await client.query(stockUpdateQuery, [quantity, product_id]);
        }

        await client.query('COMMIT'); // COMMIT TRANSACTION
        
        res.status(201).json({
            message: 'Transaction successfully created',
            data: {
                transaction: newTransaction,
                cashier_id: cashier_id,
                items_sold: transactionItems.map(i => ({ product_name: i.product_name, quantity: i.quantity, subtotal: i.subtotal, size: i.size }))
            }
        });

    } catch (error) {
        await client.query('ROLLBACK'); // ROLLBACK TRANSACTION jika ada error
        console.error('Error creating transaction:', error.message);
        const status = error.message.includes('not found') || error.message.includes('Insufficient stock') ? 400 : 500;
        res.status(status).json({ message: 'Transaction failed', error: error.message });
    } finally {
        client.release();
    }
};

// PUT /transactions/:id (Hanya Admin) - Mengubah transaksi yang sudah ada
const updateTransaction = async (req, res) => {
    const { id } = req.params;
    const { payment_method } = req.body; 

    if (!payment_method) {
        return res.status(400).json({ message: 'Setidaknya satu field (payment_method) diperlukan untuk update.' });
    }

    try {
        const query = `
            UPDATE transactions 
            SET payment_method = $1, updated_at = NOW()
            WHERE id = $2
            RETURNING id, total_amount, payment_method, created_at, updated_at;
        `;
        const result = await pool.query(query, [payment_method, id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: `Transaction with ID ${id} not found` });
        }

        res.status(200).json({
            message: `Transaction with ID ${id} successfully updated`,
            data: result.rows[0]
        });

    } catch (error) {
        console.error('Error updating transaction:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};

module.exports = {
    getAllTransactions,
    getTransactionById,
    createTransaction,
    updateTransaction, 
};