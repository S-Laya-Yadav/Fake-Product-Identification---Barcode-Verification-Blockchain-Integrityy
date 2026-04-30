const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Read config
dotenv.config();

// Connect DB
// Connect DB and Start Server
connectDB().then(() => {
    const app = express();

    app.use(express.json());
    app.use(cors());

    // Routes
    const authRoutes = require('./routes/authRoutes');
    const productRoutes = require('./routes/productRoutes');
    const fakeRoutes = require('./routes/fakeRoutes');

    app.use('/api/auth', authRoutes);
    app.use('/api/products', productRoutes);
    app.use('/api/fakes', fakeRoutes);

    app.get('/', (req, res) => {
        res.send('API is running....');
    });

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
});
