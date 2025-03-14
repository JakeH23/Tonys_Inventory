const mongoose = require('mongoose');

// Define the Car Schema
const CarSchema = mongoose.Schema({
  _id: false,
  Id: {
    type: Number,
    unique: true
  },
  ManufacturersCode: {
    type: String
  },
  Make: {
    type: String
  },
  Model: {
    type: String
  },
  EstimatedValue: {
    type: Number
  },
  Boxed: {
    type: Boolean
  },
  Notes: {
    type: String
  },
  ImageId: {
    type: Number
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

module.exports.updateCar = (id, car) => {
  const query = { 'Id': id };
  return Car.findOneAndUpdate(query, car);
};

module.exports.addCar = (newCar) => {
  const query = { 'Id': newCar.id };
  return Car.findOneAndUpdate(query, newCar, { upsert: true });
};