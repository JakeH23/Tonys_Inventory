const express = require('express');
const router = express.Router();
const Car = require('../models/car');
const config = require('../config/database');

// Route to bulk update estimated values for cars
router.post('/bulk-estimated-values', async (req, res, next) => {
  try {
    const updates = req.body?.updates;
    const skipIfSame = req.body?.skipIfSame !== false;

    if (!Array.isArray(updates) || !updates.length) {
      return res.status(400).json({
        success: false,
        msg: 'Payload must include a non-empty updates array.',
        example: {
          updates: [
            { Id: 1, EstimatedCost: 190, DateChanged: '2026-07-31T08:00:00.000Z' },
            { Id: 2, EstimatedCost: 45.5 },
          ],
          skipIfSame: true,
        },
      });
    }

    const result = await Car.bulkUpdateEstimatedValues(updates, { skipIfSame });

    res.json({
      success: true,
      msg: 'Bulk estimated value update processed.',
      ...result,
    });
  } catch (err) {
    next(err);
  }
});

// Route to get a car by ID
router.get('/:id', async (req, res, next) => {
  try {
    const car = await Car.getCarById(req.params.id);
    if (!car) {
      return res.status(404).json({ success: false, msg: 'Car not found' });
    }

    car.Image = `https://res.cloudinary.com/${config.cloudinary_cloud_name}/image/upload/${car.Id}.png`;
    res.json(car);
  } catch (err) {
    next(err);
  }
});

// Route to get all cars with optional filtering, sorting, and pagination
router.get('/', async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const pageSizeParam = req.query.pageSize;
    const pageSize = pageSizeParam === undefined || pageSizeParam === ''
      ? 20
      : pageSizeParam === '0' || pageSizeParam === 'all'
        ? null
        : Math.min(100, Math.max(1, parseInt(pageSizeParam, 10)));
    const sortBy = req.query.sortBy || 'Id';
    const sortDirection = req.query.sortDirection === 'desc' ? -1 : 1;
    const search = (req.query.search || '').toString().trim().toLowerCase();
    const filter = (req.query.filter || '').toString().trim().toLowerCase();

    const query = {};
    if (search) {
      query.$or = [
        { ManufacturersCode: { $regex: search, $options: 'i' } },
        { Make: { $regex: search, $options: 'i' } },
        { Model: { $regex: search, $options: 'i' } },
        { Notes: { $regex: search, $options: 'i' } },
      ];
    }
    if (filter === 'boxed') {
      query.Boxed = true;
    }
    if (filter === 'unboxed') {
      query.Boxed = false;
    }

    const total = await Car.countDocuments(query);
    const carsQuery = Car.find(query).sort({ [sortBy]: sortDirection });

    if (pageSize !== null) {
      carsQuery.skip((page - 1) * pageSize).limit(pageSize);
    }

    const cars = await carsQuery;

    res.json({ items: cars, total, page, pageSize: pageSize ?? total });
  } catch (err) {
    next(err);
  }
});

// Route to update a car by ID
router.put('/:id', async (req, res, next) => {
  try {
    const updatedCar = await Car.updateCar(req.params.id, req.body);
    if (!updatedCar) {
      return res.status(404).json({ success: false, msg: 'Failed to update car' });
    }
    res.json({ success: true, msg: 'Car updated', car: updatedCar });
  } catch (err) {
    next(err);
  }
});

// Route to add a new car
router.post('/', async (req, res, next) => {
  try {
    // Fetch all cars to calculate the new ID
    const cars = await Car.getAllCars();
    const id = cars.length + 1; 
    const newCar = new Car({
      Id: id,
      ManufacturersCode: req.body.ManufacturersCode,
      Make: req.body.Make,
      Model: req.body.Model,
      EstimatedValue: req.body.EstimatedValue,
      Boxed: req.body.Boxed,
      Notes: req.body.Notes
    });

    // Save the new car to the database
    await Car.addCar(newCar);
    res.json({ success: true, msg: 'Car added', id });
  } catch (err) {
    res.status(500).json({ success: false, msg: 'Failed to add car', error: err });
  }
});
module.exports = router;