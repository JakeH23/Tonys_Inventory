const Car = require('./car'); // Ensure the Car model is imported

// Define the Statistics object
const Statistics = {
  totalCarsValue: 0,
  totalCarsCount: 0,
  boxedTotal: 0,
  unboxedTotal: 0,
  mostExpensiveCars: []
};

// Define the functions
module.exports.getAllStatistics = async (callback) => {
  try {
    const cars = await Car.getAllCars();
    Statistics.totalCarsCount = cars.length;
    Statistics.totalCarsValue = cars.reduce((sum, car) => sum + Car.getLatestEstimatedValue(car), 0);
    Statistics.boxedTotal = cars.filter(car => car.Boxed).length;
    Statistics.unboxedTotal = cars.filter(car => !car.Boxed).length;
    Statistics.mostExpensiveCars = cars
      .sort((a, b) => Car.getLatestEstimatedValue(b) - Car.getLatestEstimatedValue(a))
      .slice(0, 5);
    callback(null, Statistics);
  } catch (err) {
    callback(err, null);
  }
};

module.exports.getAllCarsCount = () => {
  return Car.countDocuments({});
};

module.exports.getDashboardReport = async () => {
  const cars = await Car.getAllCars();
  const totalValue = cars.reduce((sum, car) => sum + Car.getLatestEstimatedValue(car), 0);
  const boxed = cars.filter((car) => car.Boxed).length;
  const unboxed = cars.length - boxed;
  const highestValue = [...cars]
    .sort((a, b) => Car.getLatestEstimatedValue(b) - Car.getLatestEstimatedValue(a))
    .slice(0, 5);

  return {
    totalCars: cars.length,
    totalValue,
    boxed,
    unboxed,
    highestValue,
    averageValue: cars.length ? Math.round(totalValue / cars.length) : 0,
  };
};

module.exports.getExportData = async () => {
  return Car.getAllCars();
};