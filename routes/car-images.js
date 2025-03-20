const express = require('express');
const router = express.Router();
const CarImage = require('../models/car-image');

// Route to get all statistics
router.get('/', (req, res, next) => {
  CarImage.getRandomCarImages((err, carImages) => {
    if (err) {
      return res.status(500).json({ success: false, msg: 'Failed to retrieve random cars', error: err });
    }
    res.json({ success: true, carImages: carImages });
  });
});

module.exports = router;