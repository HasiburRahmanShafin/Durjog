const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const {
  getLocations,
  getLocationById,
  computeRisk,
  getRiskSummary,
  searchLocations
} = require('../controllers/locationController');

router.get('/', verifyToken, getLocations);
router.get('/search', verifyToken, searchLocations);
router.get('/risk-summary', verifyToken, getRiskSummary);
router.get('/:id', verifyToken, getLocationById);
router.put('/:id/risk', verifyToken, computeRisk);

module.exports = router;