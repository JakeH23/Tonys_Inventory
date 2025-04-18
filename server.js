const express = require('express');
const path = require('path');
const cors = require('cors');
const mongoose = require('mongoose');
const config = require('./config/database');
const cloudinary = require('cloudinary').v2;
const compression = require('compression')

mongoose.connect(config.database);
// On Connection
mongoose.connection.on('connected', () => {
  console.log('Connected to Database ' + config.database);
});
// On Error
mongoose.connection.on('error', (err) => {
  console.log('Database error ' + err);
});

// Return "https" URLs by setting secure: true
cloudinary.config({
  secure: true,
  cloud_name: config.cloudinary_cloud_name,
  api_key: config.cloudinary_api_key,
  api_secret: config.cloudinary_api_secret
});

const app = express();
app.use(compression())

const cars = require('./routes/cars');
const statistics = require('./routes/statistics');
const carImages = require('./routes/car-images');

// Port Number
const port = process.env.PORT || 8080;

// CORS Middleware
app.use(cors());

// Set Static Folder
app.use(express.static(path.join(__dirname, 'public')));

// Body Parser Middleware
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({ extended: true, limit: '50mb'}));

app.use('/api/', statistics);
app.use('/api/cars', cars);
app.use('/api/car-images', carImages);

// Index Route
// app.get('/', (req, res) => {
//   res.send('invaild endpoint');
// });

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Start Server
app.listen(port, () => {
  console.log('Server started on port ' + port);
});
