const express = require('express');
const router = express.Router();
const cloudinary = require('cloudinary').v2;

// Route to update an image to Cloudinary
router.put('/:id/:index', async (req, res, next) => {
  //Id is CatalogNumber
  var id = `p-${req.params.id}-${req.params.index}`;
  cloudinary.uploader
    .upload(req.body.data, { asset_folder: "Parts", public_id: id, use_asset_folder_as_public_id_prefix: false, overwrite: true, unique_filename: false, invalidate: true })
    .then((result) => {
      res.json({ src: result.secure_url });
    })
    .catch((err) => {
      console.log(err);
    });
});

module.exports = router;