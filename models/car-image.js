const Car = require('./car'); // Ensure the Car model is imported
const config = require('../config/database');

// Define the functions
module.exports.getRandomCarImages = async (callback) => {
  try {
    const cars = await Car.getAllCars();
    if (!cars.length) {
      return callback(null, []);
    }

    const sampleSize = Math.min(10, cars.length);
    const shuffledCars = [...cars].sort(() => Math.random() - 0.5);
    const selectedCars = shuffledCars.slice(0, sampleSize);
    const carImages = [];
    selectedCars.forEach((car) => {
      carImages.push({
        Id: car.Id,
        Make: car.Make,
        Model: car.Model,
        Image: `https://res.cloudinary.com/${config.cloudinary_cloud_name}/image/upload/${car.Id}.png`
      });
    });

    callback(null, carImages);
  } catch (err) {
    callback(err, null);
  }
};