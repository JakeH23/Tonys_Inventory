const express = require('express');
const router = express.Router();
const Part = require('../models/part');
const config = require('../config/database');

// Route to get all parts
router.get('/', async (req, res, next) => {
  try {
    const parts = await Part.getAllParts();
    res.json(parts);
  } catch (err) {
    next(err);
  }
});

// Route to get a part by ID
router.get('/:id', async (req, res, next) => {
  try {
    const part = await Part.getPartById(req.params.id);
    part.Image = `https://res.cloudinary.com/${config.cloudinary_cloud_name}/image/upload/p-${part.CatalogNumber}.png`;
    if (!part) {
      return res.status(404).json({ success: false, msg: 'Part not found' });
    }
    res.json(part);
  } catch (err) {
    next(err);
  }
});

// Route to update a part by ID
router.put('/:id', async (req, res, next) => {
  try {
    const updatedPart = await Part.updatePart(req.params.id, req.body);
    if (!updatedPart) {
      return res.status(404).json({ success: false, msg: 'Failed to update part' });
    }
    res.json({ success: true, msg: 'Part updated', part: updatedPart });
  } catch (err) {
    next(err);
  }
});

// Route to add a new part
router.post('/', async (req, res, next) => {
  try {
    // Fetch all parts to calculate the new ID
    const parts = await Part.getAllParts();
    const id = parts.length + 1; 
    const newPart = new Part({
      Id: id,
      CatalogNumber: req.body.CatalogNumber,
      Category: req.body.Category,
      ModelNumber: req.body.ModelNumber,
      PartNumber: req.body.PartNumber,
      VehicleSide: req.body.VehicleSide,
      Description: req.body.Description,
      Notes: req.body.Notes
    });

    // Save the new part to the database
    await Part.addPart(newPart);
    res.json({ success: true, msg: 'Part added', id });
  } catch (err) {
    res.status(500).json({ success: false, msg: 'Failed to add part', error: err });
  }
});
module.exports = router;