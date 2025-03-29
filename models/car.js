const mongoose = require('mongoose');

// Define the Car Schema
const CarSchema = mongoose.Schema({
  _id: {
    type: Number
  },
  Id: {
    type: Number,
    unique: true,
    required: true
  },
  ManufacturersCode: {
    type: String,
    required: false
  },
  Make: {
    type: String,
    required: false
  },
  Model: {
    type: String,
    required: false
  },
  EstimatedValue: {
    type: Number,
    required: false
  },
  Boxed: {
    type: Boolean,
    required: false
  },
  Notes: {
    type: String,
    required: false
  },
  Image: {
    type: String,
    required: false
  }
});

// Create the Car model
module.exports = Car = mongoose.model('Car', CarSchema);

// Define the functions
module.exports.getAllCars = () => {
  return Car.find({});
};

module.exports.getCarById = (id) => {
  const query = { 'Id': id };
  return Car.findOne(query);
};

module.exports.updateCar = async (id, car) => {
  var existingCar = await Car.findOne({'Id': id}).exec();
  if (!existingCar) {
    return module.exports.addCar(car); // Car not found
  }
  const query = { 'Id': id };
  return Car.findOneAndUpdate(query, car, { new: true });
};

module.exports.addCar = async (newCar) => {
  const query = { _id: newCar.Id }; // Check for an existing car with the same Id
  const options = { upsert: true, new: true, setDefaultsOnInsert: true }; // Create if not found
  return Car.findOneAndUpdate(query, newCar, options);
};