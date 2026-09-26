const Alert = require('../models/Alert');
const User = require('../models/User');
const RiverStation = require('../models/RiverStation');
const { fetchRecentEarthquakes } = require('./usgsService');
const { sendAlertEmail } = require('./emailService');
const { getIo } = require('./ioService');
const { updateAllRiskScores } = require('./riskScoreService');
const Location = require('../models/Location');

function getFloodLevel(current, danger) {
  const diff = current - danger;
  if (diff >= 0.8) return 'emergency';
  if (diff >= 0.3) return 'warning';
  return 'watch';
}

function getEarthquakeLevel(magnitude) {
  if (magnitude >= 4.5) return 'emergency';
  if (magnitude >= 3.5) return 'warning';
  return 'watch';
}

async function evaluateFloodRules() {
  const stations = await RiverStation.find();
  for (const station of stations) {
    if (station.currentLevel > station.dangerLevel) {
      const level = getFloodLevel(station.currentLevel, station.dangerLevel);
      const existing = await Alert.findOne({ upazila: station.upazila, type: 'flood', active: true });
      if (existing) continue;

      const alert = new Alert({
        title: `Flood Alert in ${station.upazila}`,
        description: `Water level at ${station.name} is ${station.currentLevel}m (danger: ${station.dangerLevel}m).`,
        type: 'flood',
        level,
        upazila: station.upazila,
        trigger: `River level ${station.currentLevel}m > danger ${station.dangerLevel}m`,
        expiry: new Date(Date.now() + 3*24 * 60 * 60 * 1000)
      });
      await alert.save();
      await notifyUsersForUpazila(alert);
    }
  }
}


async function findNearestUpazila(lat, lng) {
  const [result] = await Location.aggregate([
    {
      $geoNear: {
        near: { type: 'Point', coordinates: [lng, lat] },
        distanceField: 'distance',
        spherical: true,
        query: { type: 'upazila' }
      }
    },
    { $limit: 1 }
  ]);
  return result;
}

async function evaluateEarthquakeRules() {
  const quakes = await fetchRecentEarthquakes();
  for (const quake of quakes) {
    if (quake.magnitude >= 5.0) {   // threshold as required
      const nearest = await findNearestUpazila(quake.epicenter.lat, quake.epicenter.lng);
      if (!nearest) continue;

      const distanceKm = nearest.distance / 1000;
      if (distanceKm > 150) continue;

      const existing = await Alert.findOne({ upazila: nearest.name, type: 'earthquake', active: true });
      if (existing) continue;

      const level = getEarthquakeLevel(quake.magnitude);
      const alert = new Alert({
        title: `Earthquake Alert - M${quake.magnitude}`,
        description: `A ${quake.magnitude} magnitude earthquake was detected ${distanceKm.toFixed(0)} km from ${nearest.name}. ${level === 'emergency' ? 'Take cover immediately.' : 'Stay cautious.'}`,
        type: 'earthquake',
        level,
        upazila: nearest.name,
        trigger: `Magnitude ${quake.magnitude} within ${distanceKm.toFixed(0)} km of ${nearest.name}`,
        expiry: new Date(Date.now() + 12 * 60 * 60 * 1000)
      });
      await alert.save();
      await notifyUsersForUpazila(alert);
    }
  }
}


async function notifyUsersForUpazila(alert) {
  try {
    const users = await User.find({ preferredUpazilas: alert.upazila });
    if (users.length === 0) return;

    const io = getIo();
    if (!io) {
      console.error('⚠️ Socket.io not available – real‑time alerts disabled');
    } else {
      for (const user of users) {
        // Emit WebSocket event to user's private room
        io.to(user._id.toString()).emit('newAlert', {
          alert,
          message: `New ${alert.level.toUpperCase()} alert: ${alert.title}`
        });
        // Send email if user has enabled email notifications
        if (user.alertPreferences?.emailNotifications) {
          try {
            await sendAlertEmail(user.email, alert);
          } catch (emailErr) {
            console.error(`Email failed for ${user.email}:`, emailErr.message);
          }
        }
      }
    }
    console.log(`📢 Notified ${users.length} users for alert on ${alert.upazila}`);
  } catch (err) {
    console.error(`❌ Error notifying users for ${alert.upazila}:`, err);
  }
}

async function sendExistingAlertsForUpazila(user, upazilaName) {
  const activeAlerts = await Alert.find({ upazila: upazilaName, active: true });
  if (activeAlerts.length === 0) return;

  const io = getIo();
  for (const alert of activeAlerts) {
    // Send WebSocket
    if (io) {
      io.to(user._id.toString()).emit('newAlert', {
        alert,
        message: `New ${alert.level.toUpperCase()} alert: ${alert.title}`
      });
    }
    // Send email if enabled
    if (user.alertPreferences?.emailNotifications) {
      await sendAlertEmail(user.email, alert);
    }
  }
  console.log(`Sent ${activeAlerts.length} existing alerts to user ${user.email} for upazila ${upazilaName}`);
}



async function deactivateExpiredAlerts() {
  try {
    const now = new Date();
    const result = await Alert.updateMany(
      { expiry: { $lt: now }, active: true },
      { $set: { active: false } }
    );
    if (result.modifiedCount > 0) {
      console.log(`⏰ Deactivated ${result.modifiedCount} expired alerts`);
    }
  } catch (err) {
    console.error('❌ Error deactivating expired alerts:', err);
  }
}


async function runAlertEngine() {
  console.log('🔄 Running alert engine...', new Date().toISOString());
  await updateAllRiskScores();
  await evaluateFloodRules();
  await evaluateEarthquakeRules();
  await deactivateExpiredAlerts();
  console.log('✅ Alert engine finished');
}

module.exports = { runAlertEngine, sendExistingAlertsForUpazila, findNearestUpazila };