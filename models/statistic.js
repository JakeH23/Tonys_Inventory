const Car = require('./car'); // Ensure the Car model is imported
const cloudinary = require('cloudinary').v2;

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

module.exports.getInventoryAlerts = async () => {
  const cars = await Car.getAllCars();
  const totalValue = cars.reduce((sum, car) => sum + Car.getLatestEstimatedValue(car), 0);
  const averageValue = cars.length ? totalValue / cars.length : 0;
  const staleValuationDays = 180;
  const staleCutoff = new Date(Date.now() - staleValuationDays * 24 * 60 * 60 * 1000);
  const imageCheckSampleSize = Math.min(15, cars.length);

  const toAlertItem = (car) => ({
    Id: car.Id,
    Make: car.Make || 'Unknown make',
    Model: car.Model || 'Unknown model',
    ManufacturersCode: car.ManufacturersCode || '',
    Boxed: !!car.Boxed,
    EstimatedValue: Car.getLatestEstimatedValue(car),
  });

  const noNotesCars = cars
    .filter((car) => !(car.Notes || '').toString().trim())
    .map(toAlertItem)
    .slice(0, 5);

  const missingManufacturersCodeCars = cars
    .filter((car) => !(car.ManufacturersCode || '').toString().trim())
    .map(toAlertItem)
    .slice(0, 5);

  const zeroValueCars = cars
    .filter((car) => Car.getLatestEstimatedValue(car) <= 0)
    .map(toAlertItem)
    .slice(0, 5);

  const staleValuationCars = cars
    .filter((car) => {
      const history = Car.normalizeEstimatedValueHistory(car.EstimatedValue);
      if (!history.length) {
        return false;
      }
      const latestDate = new Date(history[0].DateChanged);
      return latestDate < staleCutoff;
    })
    .sort((a, b) => Car.getLatestEstimatedValue(b) - Car.getLatestEstimatedValue(a))
    .map(toAlertItem)
    .slice(0, 5);

  // Keep image existence checks lightweight by sampling the most recent entries.
  const imageSampleCandidates = [...cars]
    .sort((a, b) => (Number(b.Id) || 0) - (Number(a.Id) || 0))
    .slice(0, imageCheckSampleSize);

  const imageCheckResults = await Promise.all(
    imageSampleCandidates.map(async (car) => {
      try {
        await cloudinary.api.resource(String(car.Id), { resource_type: 'image' });
        return { car, exists: true };
      } catch (err) {
        if (err?.http_code === 404) {
          return { car, exists: false };
        }
        return { car, exists: true, skipped: true };
      }
    })
  );

  const missingCloudinaryImageCars = imageCheckResults
    .filter((result) => result.exists === false)
    .map((result) => toAlertItem(result.car))
    .slice(0, 5);

  const skippedCloudinaryImageChecks = imageCheckResults.filter((result) => result.skipped).length;
  const successfulCloudinaryImageChecks = imageCheckResults.length - skippedCloudinaryImageChecks;

  const rules = [
    {
      id: 'missing-cloudinary-image-sample',
      title: 'Sampled cars missing Cloudinary image',
      description: `Checked ${successfulCloudinaryImageChecks}/${imageCheckSampleSize} recent cars for image assets.`,
      severity: 'warning',
      count: imageCheckResults.filter((result) => result.exists === false).length,
      items: missingCloudinaryImageCars,
    },
    {
      id: 'no-notes',
      title: 'Cars with no notes',
      description: 'Add context like condition, rarity, or purchase source.',
      severity: 'info',
      count: cars.filter((car) => !(car.Notes || '').toString().trim()).length,
      items: noNotesCars,
    },
    {
      id: 'missing-manufacturers-code',
      title: 'Cars missing manufacturer code',
      description: 'Manufacturer code improves search quality and matching.',
      severity: 'warning',
      count: cars.filter((car) => !(car.ManufacturersCode || '').toString().trim()).length,
      items: missingManufacturersCodeCars,
    },
    {
      id: 'zero-estimated-value',
      title: 'Cars with no estimated value',
      description: 'Add a valuation so totals and analytics remain accurate.',
      severity: 'warning',
      count: cars.filter((car) => Car.getLatestEstimatedValue(car) <= 0).length,
      items: zeroValueCars,
    },
    {
      id: 'stale-valuation',
      title: 'Cars with stale valuation updates',
      description: `Review values older than ${staleValuationDays} days.`,
      severity: 'info',
      count: cars.filter((car) => {
        const history = Car.normalizeEstimatedValueHistory(car.EstimatedValue);
        if (!history.length) {
          return false;
        }
        const latestDate = new Date(history[0].DateChanged);
        return latestDate < staleCutoff;
      }).length,
      items: staleValuationCars,
    },
  ];

  return {
    generatedAt: new Date().toISOString(),
    summary: {
      totalCars: cars.length,
      averageValue: Math.round(averageValue),
      staleValuationDays,
      imageCheckSampleSize,
      activeRules: rules.filter((rule) => rule.count > 0).length,
    },
    rules,
  };
};

module.exports.getExportData = async () => {
  return Car.getAllCars();
};