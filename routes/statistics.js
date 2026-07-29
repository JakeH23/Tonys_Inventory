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

router.get('/statistics/count', async (req, res, next) => {
  try {
    const count = await Statistic.getAllCarsCount();
    res.json(count);
  } catch (err) {
    next(err);
  }
});

router.get('/statistics/report', async (req, res, next) => {
  try {
    const report = await Statistic.getDashboardReport();
    res.json(report);
  } catch (err) {
    next(err);
  }
});

router.get('/statistics/export', async (req, res, next) => {
  try {
    const cars = await Statistic.getExportData();
    const csv = [
      'Id,ManufacturersCode,Make,Model,EstimatedValue,Boxed,Notes',
      ...cars.map((car) => [
        car.Id,
        `"${(car.ManufacturersCode || '').replace(/"/g, '""')}"`,
        `"${(car.Make || '').replace(/"/g, '""')}"`,
        `"${(car.Model || '').replace(/"/g, '""')}"`,
        car.EstimatedValue || 0,
        car.Boxed ? 'true' : 'false',
        `"${(car.Notes || '').replace(/"/g, '""')}"`,
      ].join(',')),
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="inventory.csv"');
    res.send(csv);
  } catch (err) {
    next(err);
  }
});

module.exports = router;