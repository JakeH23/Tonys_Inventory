const mongoose = require('mongoose');
const config = require('../config/database');

const LEGACY_VALUE_DATE = new Date('2025-06-01T00:00:00.000Z');
const NUMERIC_BSON_TYPES = ['int', 'long', 'double', 'decimal'];

const args = new Set(process.argv.slice(2));
const isDryRun = args.has('--dry-run');
const idArg = process.argv.slice(2).find((arg) => arg.startsWith('--id='));
const targetId = idArg ? Number(idArg.split('=')[1]) : null;

const logHeader = () => {
  console.log('EstimatedValue History Migration');
  console.log('--------------------------------');
  console.log('Database:', config.database);
  console.log('Mode:', isDryRun ? 'DRY RUN (no updates)' : 'EXECUTE (writes enabled)');
  console.log('Legacy date used:', LEGACY_VALUE_DATE.toISOString());
  if (targetId !== null) {
    console.log('Target car Id:', targetId);
  }
};

const getLegacyNumericFilter = () => {
  const filter = {
    EstimatedValue: { $type: NUMERIC_BSON_TYPES },
  };

  if (targetId !== null) {
    filter.Id = targetId;
  }

  return filter;
};

const run = async () => {
  if (targetId !== null && (!Number.isInteger(targetId) || targetId <= 0)) {
    throw new Error('Invalid --id value. Please provide a positive integer, e.g. --id=1');
  }

  logHeader();

  await mongoose.connect(config.database);
  const carsCollection = mongoose.connection.collection('cars');

  const filter = getLegacyNumericFilter();
  const legacyCount = await carsCollection.countDocuments(filter);

  console.log('Legacy numeric records found:', legacyCount);

  if (!legacyCount) {
    console.log('No migration needed.');
    return;
  }

  if (isDryRun) {
    const sample = await carsCollection
      .find(filter, { projection: { Id: 1, EstimatedValue: 1 } })
      .limit(10)
      .toArray();

    console.log('Sample records that would be updated (max 10):');
    sample.forEach((car) => {
      console.log(`- Id=${car.Id}, EstimatedValue=${car.EstimatedValue}`);
    });

    return;
  }

  const updatePipeline = [
    {
      $set: {
        EstimatedValue: [
          {
            EstimatedCost: { $toDouble: '$EstimatedValue' },
            DateChanged: LEGACY_VALUE_DATE,
          },
        ],
      },
    },
  ];

  const result = await carsCollection.updateMany(filter, updatePipeline);

  console.log('Migration complete.');
  console.log('Matched records:', result.matchedCount);
  console.log('Modified records:', result.modifiedCount);

  if (targetId !== null) {
    const updatedCar = await carsCollection.findOne(
      { Id: targetId },
      { projection: { Id: 1, EstimatedValue: 1 } }
    );

    if (updatedCar) {
      console.log('Updated target preview:', JSON.stringify(updatedCar, null, 2));
    }
  }
};

run()
  .catch((err) => {
    console.error('Migration failed:', err);
    process.exitCode = 1;
  })
  .finally(async () => {
    try {
      await mongoose.disconnect();
    } catch (_) {
      // Ignore disconnect errors after a fatal path.
    }
  });
