const mongoose = require('mongoose');

const LEGACY_VALUE_MIGRATION_DATE = new Date('2025-06-01T00:00:00.000Z');

const EstimatedValueHistorySchema = mongoose.Schema(
  {
    EstimatedCost: {
      type: Number,
      required: true,
      min: 0,
    },
    DateChanged: {
      type: Date,
      required: true,
    },
  },
  { _id: false }
);

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
    type: [EstimatedValueHistorySchema],
    default: [],
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

const normalizeEstimatedValueEntry = (entry) => {
  if (entry == null) {
    return null;
  }

  const estimatedCost = Number(entry.EstimatedCost ?? entry.estimatedCost);
  if (!Number.isFinite(estimatedCost) || estimatedCost < 0) {
    return null;
  }

  const dateValue = entry.DateChanged ?? entry.dateChanged;
  const parsedDate = dateValue ? new Date(dateValue) : new Date();
  const dateChanged = Number.isNaN(parsedDate.getTime()) ? new Date() : parsedDate;

  return {
    EstimatedCost: estimatedCost,
    DateChanged: dateChanged,
  };
};

const normalizeEstimatedValueHistory = (value) => {
  if (value == null) {
    return [];
  }

  if (typeof value === 'number') {
    return Number.isFinite(value) && value >= 0
      ? [{ EstimatedCost: value, DateChanged: LEGACY_VALUE_MIGRATION_DATE }]
      : [];
  }

  if (!Array.isArray(value)) {
    return [];
  }

  const normalized = value
    .map((entry) => {
      if (typeof entry === 'number') {
        return Number.isFinite(entry) && entry >= 0
          ? { EstimatedCost: entry, DateChanged: LEGACY_VALUE_MIGRATION_DATE }
          : null;
      }
      return normalizeEstimatedValueEntry(entry);
    })
    .filter(Boolean);

  return normalized.sort((a, b) => new Date(b.DateChanged).getTime() - new Date(a.DateChanged).getTime());
};

const serializeHistory = (history) => {
  return JSON.stringify(
    history.map((entry) => ({
      EstimatedCost: Number(entry.EstimatedCost),
      DateChanged: new Date(entry.DateChanged).toISOString(),
    }))
  );
};

module.exports.normalizeEstimatedValueHistory = normalizeEstimatedValueHistory;

module.exports.getLatestEstimatedValue = (car) => {
  if (!car) {
    return 0;
  }

  const history = normalizeEstimatedValueHistory(car.EstimatedValue);
  if (!history.length) {
    return 0;
  }

  return Number(history[0].EstimatedCost) || 0;
};

module.exports.appendEstimatedValueHistory = (history, estimatedCost, dateChanged = new Date(), skipIfSame = true) => {
  const normalizedHistory = normalizeEstimatedValueHistory(history);
  const nextCost = Number(estimatedCost);

  if (!Number.isFinite(nextCost) || nextCost < 0) {
    return normalizedHistory;
  }

  if (skipIfSame && normalizedHistory.length && Number(normalizedHistory[0].EstimatedCost) === nextCost) {
    return normalizedHistory;
  }

  const parsedDate = new Date(dateChanged);
  const safeDate = Number.isNaN(parsedDate.getTime()) ? new Date() : parsedDate;

  return normalizeEstimatedValueHistory([
    {
      EstimatedCost: nextCost,
      DateChanged: safeDate,
    },
    ...normalizedHistory,
  ]);
};

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
  car.EstimatedValue = normalizeEstimatedValueHistory(car.EstimatedValue);
  const query = { 'Id': id };
  return Car.findOneAndUpdate(query, car, { new: true });
};

module.exports.addCar = async (newCar) => {
  newCar.EstimatedValue = normalizeEstimatedValueHistory(newCar.EstimatedValue);
  const query = { _id: newCar.Id }; // Check for an existing car with the same Id
  const options = { upsert: true, new: true, setDefaultsOnInsert: true }; // Create if not found
  return Car.findOneAndUpdate(query, newCar, options);
};

module.exports.migrateLegacyEstimatedValues = async () => {
  const cars = await Car.find({}).lean();
  const updates = cars
    .map((car) => {
      const rawValue = car.EstimatedValue;
      const normalized = normalizeEstimatedValueHistory(car.EstimatedValue);

      let needsUpdate = false;
      if (typeof rawValue === 'number' || rawValue == null || !Array.isArray(rawValue)) {
        needsUpdate = true;
      } else {
        const hasInvalidEntries = rawValue.some((entry) => {
          if (typeof entry === 'number') {
            return true;
          }
          const normalizedEntry = normalizeEstimatedValueEntry(entry);
          return !normalizedEntry;
        });

        if (hasInvalidEntries) {
          needsUpdate = true;
        } else {
          const currentSerialized = serializeHistory(rawValue);
          const normalizedSerialized = serializeHistory(normalized);
          needsUpdate = currentSerialized !== normalizedSerialized;
        }
      }

      if (!needsUpdate) {
        return null;
      }

      return {
        updateOne: {
          filter: { _id: car._id },
          update: {
            $set: {
              EstimatedValue: normalized,
            },
          },
        },
      };
    })
    .filter(Boolean);

  if (!updates.length) {
    return { modifiedCount: 0 };
  }

  return Car.bulkWrite(updates);
};

module.exports.bulkUpdateEstimatedValues = async (updates, options = {}) => {
  const skipIfSame = options.skipIfSame !== false;
  const now = new Date();

  const normalizedUpdates = (updates || [])
    .map((item) => ({
      Id: Number(item.Id),
      EstimatedCost: Number(item.EstimatedCost ?? item.EstimatedValue),
      DateChanged: item.DateChanged || item.dateChanged || now.toISOString(),
    }))
    .filter((item) => Number.isInteger(item.Id) && item.Id > 0 && Number.isFinite(item.EstimatedCost) && item.EstimatedCost >= 0);

  const uniqueIds = Array.from(new Set(normalizedUpdates.map((item) => item.Id)));
  const cars = await Car.find({ Id: { $in: uniqueIds } }).lean();
  const carsById = new Map(cars.map((car) => [Number(car.Id), car]));

  const operations = [];
  const results = [];

  normalizedUpdates.forEach((item) => {
    const existing = carsById.get(item.Id);
    if (!existing) {
      results.push({ Id: item.Id, updated: false, reason: 'not_found' });
      return;
    }

    const nextHistory = module.exports.appendEstimatedValueHistory(
      existing.EstimatedValue,
      item.EstimatedCost,
      item.DateChanged,
      skipIfSame
    );

    const previousSerialized = serializeHistory(normalizeEstimatedValueHistory(existing.EstimatedValue));
    const nextSerialized = serializeHistory(nextHistory);

    if (previousSerialized === nextSerialized) {
      results.push({ Id: item.Id, updated: false, reason: 'no_change' });
      return;
    }

    operations.push({
      updateOne: {
        filter: { Id: item.Id },
        update: {
          $set: {
            EstimatedValue: nextHistory,
          },
        },
      },
    });

    carsById.set(item.Id, { ...existing, EstimatedValue: nextHistory });
    results.push({ Id: item.Id, updated: true, estimatedCost: item.EstimatedCost, dateChanged: new Date(item.DateChanged).toISOString() });
  });

  let writeResult = { matchedCount: 0, modifiedCount: 0 };
  if (operations.length) {
    writeResult = await Car.bulkWrite(operations);
  }

  return {
    totalReceived: updates?.length || 0,
    totalValidated: normalizedUpdates.length,
    totalApplied: operations.length,
    matchedCount: writeResult.matchedCount || 0,
    modifiedCount: writeResult.modifiedCount || 0,
    results,
  };
};