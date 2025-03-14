const express = require('express');
const router = express.Router();
const Statistic = require('../models/statistic');

// Route to get all statistics
router.get('/statistics', (req, res, next) => {
  Statistic.getAllStatistics((err, stats) => {
    if (err) {
      return res.status(500).json({ success: false, msg: 'Failed to retrieve statistics', error: err });
    }
    res.json({ success: true, statistics: stats });
  });
});

module.exports = router;