// server/server.js
const express = require('express');
const path = require('path');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// MongoDB Connection - Simplified (remove deprecated options)
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/family-tree', {
  serverSelectionTimeoutMS: 5000,
})
.then(() => console.log('✅ MongoDB Connected Successfully'))
.catch(err => {
  console.error('❌ MongoDB Connection Error:', err.message);
  console.log('\nTroubleshooting steps:');
  console.log('1. Make sure MongoDB is installed');
  console.log('2. Check if MongoDB service is running');
  console.log('3. Try running: "mongod" in a separate terminal');
});

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api', require('./routes'));

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../client/dist')));

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});