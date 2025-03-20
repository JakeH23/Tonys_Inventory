const Car = require('./car'); // Ensure the Car model is imported
const config = require('../config/database');

// Define the functions
module.exports.getRandomCarImages = async (callback) => {
  try {
    const cars = await Car.getAllCars();
    const carImages = [];
    do {
      const randomIndex = Math.floor(Math.random() * cars.length);
      const car = cars[randomIndex];
      carImages.push({
        Id: car.Id,
        Make: car.Make,
        Model: car.Model,
        Image: `https://res.cloudinary.com/${config.cloudinary_cloud_name}/image/upload/${car.Id}.png`
      });
    } while (carImages.length < 10);
    callback(null, carImages);
  } catch (err) {
    callback(err, null);
  }
};