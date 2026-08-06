const express = require('express');
const router = express.Router();
const Statistic = require('../models/statistic');
const Car = require('../models/car');
const Part = require('../models/part');

const toCsvValue = (value) => {
  if (value === null || value === undefined) {
    return '';
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === 'object') {
    return JSON.stringify(value);
  }

  return String(value);
};

const escapeCsvValue = (value) => {
  const str = toCsvValue(value).replace(/"/g, '""');
  return `"${str}"`;
};

const buildMongoDocsCsv = (docs) => {
  if (!docs.length) {
    return '';
  }

  const allKeys = Array.from(
    docs.reduce((keys, doc) => {
      Object.keys(doc).forEach((key) => keys.add(key));
      return keys;
    }, new Set())
  );

  const headers = allKeys.join(',');
  const rows = docs.map((doc) => allKeys.map((key) => escapeCsvValue(doc[key])).join(','));

  return [headers, ...rows].join('\n');
};

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

router.get('/statistics/alerts', async (req, res, next) => {
  try {
    const alerts = await Statistic.getInventoryAlerts();
    res.json(alerts);
  } catch (err) {
    next(err);
  }
});

router.get('/statistics/export/cars', async (req, res, next) => {
  try {
    const cars = await Car.find({}).lean();
    const csv = buildMongoDocsCsv(cars);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="cars-export.csv"');
    res.send(csv);
  } catch (err) {
    next(err);
  }
});

router.get('/statistics/export/parts', async (req, res, next) => {
  try {
    const parts = await Part.find({}).lean();
    const csv = buildMongoDocsCsv(parts);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="parts-export.csv"');
    res.send(csv);
  } catch (err) {
    next(err);
  }
});

// Backward compatible inventory export now maps to cars.
router.get('/statistics/export', async (req, res, next) => {
  try {
    const cars = await Car.find({}).lean();
    const csv = buildMongoDocsCsv(cars);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="inventory.csv"');
    res.send(csv);
  } catch (err) {
    next(err);
  }
});

module.exports = router;