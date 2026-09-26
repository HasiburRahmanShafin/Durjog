const Shelter = require('../models/Shelter');

// Create shelter (admin)
exports.createShelter = async (req, res) => {
  try {
    const shelter = new Shelter(req.body);
    await shelter.save();
    res.status(201).json(shelter);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// Get all shelters
exports.getShelters = async (req, res) => {
  try {
    const shelters = await Shelter.find();
    res.json(shelters);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// Update shelter status (admin)
exports.updateShelter = async (req, res) => {
  try {
    const { id } = req.params;
    const shelter = await Shelter.findByIdAndUpdate(id, req.body, { new: true });
    res.json(shelter);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// Find nearest shelters (by user's coordinates)
exports.findNearestShelters = async (req, res) => {
  try {
    const { lng, lat, maxDistance = 50000 } = req.query; // max 50km
    const parsedLng = parseFloat(lng);
    const parsedLat = parseFloat(lat);

    if (isNaN(parsedLng) || isNaN(parsedLat)) {
      return res.status(400).json({ msg: 'Valid longitude and latitude are required' });
    }

    const shelters = await Shelter.aggregate([
      {
        $geoNear: {
          near: { type: 'Point', coordinates: [parsedLng, parsedLat] },
          distanceField: 'distance',
          maxDistance: parseInt(maxDistance, 10) || 50000,
          spherical: true
        }
      },
      { $match: { status: 'open' } },
      { $sort: { distance: 1 } },
      { $limit: 10 }
    ]);
    res.json(shelters);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};