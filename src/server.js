require('dotenv').config();
const express = require('express');
const cors = require('cors');
require('./models'); // This will execute the code in models/index.js
const { connectDB } = require('./config/database');

connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const quoteRoutes = require('./routes/quoteRoutes');

app.use('/api/auth', authRoutes);
app.use('/api', userRoutes);
app.use('/api', quoteRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

module.exports = app;
