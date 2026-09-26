const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const { getActiveAlerts, getAlertHistory } = require('../controllers/alertController');

const { runAlertEngine } = require('../services/alertService');

router.get('/active', verifyToken, getActiveAlerts);
router.get('/history', verifyToken, getAlertHistory);
router.post('/manual', verifyToken, async (req, res) => {
  try {
    await runAlertEngine();
    res.json({ msg: 'Alert engine triggered successfully' });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

module.exports = router;