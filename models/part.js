const mongoose = require('mongoose');

// Define the Part Schema
const PartSchema = mongoose.Schema({
  _id: {
    type: Number
  },
  Id: {
    type: Number,
    unique: true,
    required: true
  },
  CatalogNumber: {
    type: String,
    required: false
  },
  Category: {
    type: String,
    required: false
  },
  ModelNumber: {
    type: String,
    required: false
  },
  PartNumber: {
    type: String,
    required: false
  },
  VehicleSide: {
    type: String,
    required: false
  },
  Description: {
    type: String,
    required: false
  },
  Notes: {
    type: String,
    required: false
  },
  Images: {
    type: Array,
    required: false
  }
});

// Create the Part model
module.exports = Part = mongoose.model('Part', PartSchema);

// Define the functions
module.exports.getAllParts = () => {
  return Part.find({});
};

module.exports.getPartById = (id) => {
  const query = { 'Id': id };
  return Part.findOne(query);
};

module.exports.updatePart = async (id, part) => {
  var existingPart = await Part.findOne({'Id': id}).exec();
  if (!existingPart) {
    return module.exports.addPart(part); // Part not found
  }
  const query = { 'Id': id };
  return Part.findOneAndUpdate(query, part, { new: true });
};

module.exports.addPart = async (newPart) => {
  const query = { _id: newPart.Id }; // Check for an existing part with the same Id
  const options = { upsert: true, new: true, setDefaultsOnInsert: true }; // Create if not found
  return Part.findOneAndUpdate(query, newPart, options);
};