require('dotenv').config();
const express = require('express');
const cors = require('cors');
require('./models'); // This will execute the code in models/index.js
const { connectDB } = require('./config/database');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');

connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const userRoutes = require('./routes/userRoutes');
const quoteRoutes = require('./routes/quoteRoutes');
const orderRoutes = require('./routes/orderRoutes');

app.use('/api', userRoutes);
app.use('/api', quoteRoutes);
app.use('/api', orderRoutes);

if (process.env.NODE_ENV !== 'test') {
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

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
