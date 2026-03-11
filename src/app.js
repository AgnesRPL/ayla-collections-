require('dotenv').config();

const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express'); 
const swaggerDocument = require('../swagger.json'); 

// Import Routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
 
const app = express();
const PORT = process.env.APP_PORT || 3000; // Menggunakan APP_PORT dari .env

// Middleware
app.use(cors());
app.use(express.json()); // Middleware untuk parsing JSON body 

// Route Test Server
app.get('/', (req, res) => {
    res.json({
        message: 'Server Toko Pakaian Api berjalan!',
        version:'1.0.0'
    });
});

// Routes untuk Authentication dan User Management
app.use('/auth', authRoutes); 
app.use('/users', userRoutes);

// Routes untuk Data Maaster
app.use('/categories', categoryRoutes);
app.use('/products', productRoutes);

// Routes untuk Transaksi
app.use('/transactions', transactionRoutes);

// --- KONFIGURASI ROUTE SWAGGER ---
// Dokumentasi API dapat diakses di: http://localhost:${PORT}/api-docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
// ----------------------------------


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});