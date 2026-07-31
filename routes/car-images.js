const express = require('express');
const router = express.Router();
const CarImage = require('../models/car-image');
const Car = require('../models/car');
const cloudinary = require('cloudinary').v2;

const sendRandomCarImages = (req, res) => {
  CarImage.getRandomCarImages((err, carImages) => {
    if (err) {
      return res.status(500).json({ success: false, msg: 'Failed to retrieve random cars', error: err });
    }
    res.json({ success: true, carImages: carImages });
  });
};

// Route to get random car images
router.get('/', sendRandomCarImages);
router.get('/random', sendRandomCarImages);

// Route to upload an image to Cloudinary
router.post('/', async (req, res, next) => {
  const cars = await Car.getAllCars();
  const id = (cars.length + 1).toString();
  cloudinary.uploader
    .upload(req.body.data, { asset_folder: "Cars", public_id: id, use_asset_folder_as_public_id_prefix: false, overwrite: true, unique_filename: false, invalidate: true })
    .then((result) => {
      res.json({ src: result.secure_url, alt: result.public_id.split('/').pop() });
    })
    .catch((err) => {
      console.log(err);
    });
});

// Route to update an image to Cloudinary
router.put('/:id', async (req, res, next) => {
  cloudinary.uploader.destroy(req.params.id);
  cloudinary.uploader
    .upload(req.body.data, { asset_folder: "Cars", public_id: req.params.id, use_asset_folder_as_public_id_prefix: false, overwrite: true, unique_filename: false, invalidate: true })
    .then((result) => {
      res.json({ src: result.secure_url });
    })
    .catch((err) => {
      console.log(err);
    });
});

module.exports = router;