const express = require('express');
const router = express.Router();
const Car = require('../models/car');

// Route to get all cars
router.get('/', async (req, res, next) => {
  try {
    const cars = await Car.getAllCars();
    res.json(cars);
  } catch (err) {
    next(err);
  }
});

// Route to get a car by ID
router.get('/:id', async (req, res, next) => {
  debugger;
  try {
    const car = await Car.getCarById(req.params.id);
    if (!car) {
      return res.status(404).json({ success: false, msg: 'Car not found' });
    }
    res.json(car);
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
  const cars = await Car.getAllCars();
  const id = cars.length + 1;
  const newCar = new Car({  
    Id: id,
    ManufacturersCode: req.body.manufacturersCode,
    Make: req.body.make,
    Model: req.body.model,
    EstimatedValue: req.body.estimatedValue,
    Boxed: req.body.boxed,
    Notes: req.body.notes,
    ImageId: id
  });

  try {
    const car = await Car.addCar(newCar);
    res.json({ success: true, msg: 'Car added', id });
  } catch (err) {
    res.status(500).json({ success: false, msg: 'Failed to add car', error: err });
  }
});

module.exports = router;