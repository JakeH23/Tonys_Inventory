const express = require('express');
const router = express.Router();
const cloudinary = require('cloudinary').v2;

// Route to upload an image to Cloudinary
router.post('/', async (req, res, next) => {
  var index = req.params.ImagesCount;
  const id = `p-${req.params.CatalogNumber}-${index}`;
  cloudinary.uploader
    .upload(req.body.data, { asset_folder: "Parts", public_id: id, use_asset_folder_as_public_id_prefix: false, overwrite: true, unique_filename: false, invalidate: true })
    .then((result) => {
      res.json({ src: result.secure_url, alt: result.public_id.split('/').pop() });
    })
    .catch((err) => {
      console.log(err);
    });
});

// Route to update an image to Cloudinary
router.put('/:id', async (req, res, next) => {
  //Id is CatalogNumber
  cloudinary.uploader.destroy(req.params.id);
  cloudinary.uploader
    .upload(req.body.data, { asset_folder: "Parts", public_id: `p-${req.params.id}`, use_asset_folder_as_public_id_prefix: false, overwrite: true, unique_filename: false, invalidate: true })
    .then((result) => {
      res.json({ src: result.secure_url });
    })
    .catch((err) => {
      console.log(err);
    });
});

module.exports = router;