const Location = require('../models/Location');
const Report = require('../models/Report');
const riverStations = require('../../data/riverStationsDetailed.json');
const { fetchRecentEarthquakes } = require('./usgsService');

const coastalDistricts = ['Barguna', 'Bhola', 'Patuakhali', "Cox's Bazar", 'Noakhali', 'Satkhira', 'Khulna'];

// Fast Haversine formula (km)
function distance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// ------------------------------------------------------------------
// In-memory risk calculation for a single upazila
// ------------------------------------------------------------------
function computeRiskForUpazilaSync(upazila, earthquakes, districtMap, reportsMap) {
  let score = 0;

  // 1. Seismic zone
  if (upazila.seismicZone === 'high') score += 55;
  else if (upazila.seismicZone === 'moderate') score += 40;
  else score += 25;

  // 2. Flood proneness
  if (upazila.floodProne) score += 45;

  // 3. Coastal proximity
  if (upazila.parent) {
    const parentDistrictName = districtMap.get(upazila.parent.toString());
    if (parentDistrictName && coastalDistricts.includes(parentDistrictName)) {
      score += 20;
    }
  }

  // 4. River level exceedance
  const station = riverStations.find(s => s.upazila === upazila.name);
  if (station && station.currentLevel > station.dangerLevel) {
    const d = station.currentLevel / station.dangerLevel;
    const exceed = Math.min(70, d * 100);
    score += exceed;
  }

  // 5. Rainfall trend
  if (station && station.upstreamRainfall) {
    const rain = Math.min(30, station.upstreamRainfall);
    score += rain;
  }

  // 6. Earthquake impact (using pre-fetched earthquakes)
  const upLat = parseFloat(upazila.lat);
  const upLng = parseFloat(upazila.long);
  if (earthquakes && !isNaN(upLat) && !isNaN(upLng)) {
    for (const q of earthquakes) {
      let eqLat, eqLng;
      if (q.epicenter) {
        eqLat = q.epicenter.lat;
        eqLng = q.epicenter.lng;
      } else if (q.lat && q.lng) {
        eqLat = q.lat;
        eqLng = q.lng;
      } else {
        continue;
      }
      if (distance(upLat, upLng, eqLat, eqLng) < 100) {
        if (q.magnitude >= 5.5) score += 35;
        else if (q.magnitude >= 4.5) score += 20;
        else if (q.magnitude >= 3.0) score += 15;
        break;
      }
    }
  }

  // 7. Citizen reports (last 7 days)
  const reportsCount = reportsMap.get(upazila.name) || 0;
  score += Math.min(50, reportsCount * 20);

  return Math.min(100, Math.round(score));
}

// ------------------------------------------------------------------
// Main batch risk update function (efficient bulk operations)
// ------------------------------------------------------------------
async function updateAllRiskScores() {
  console.log('🔄 Starting risk score update...');

  // 1. Fetch earthquakes once (cached in usgsService)
  let earthquakes = [];
  try {
    earthquakes = await fetchRecentEarthquakes();
  } catch (err) {
    console.error('Failed to fetch earthquakes, continuing without quake contribution:', err.message);
  }

  // 2. Pre-fetch districts and citizen report counts in batch
  const districts = await Location.find({ type: 'district' });
  const districtMap = new Map(districts.map(d => [d._id.toString(), d.name]));

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  let reportsMap = new Map();
  try {
    const reportAgg = await Report.aggregate([
      { $match: { status: 'approved', createdAt: { $gte: sevenDaysAgo } } },
      { $group: { _id: '$upazila', count: { $sum: 1 } } }
    ]);
    reportsMap = new Map(reportAgg.map(r => [r._id, r.count]));
  } catch (err) {
    console.warn('Could not aggregate reports for risk calculation:', err.message);
  }

  // 3. Update all upazilas in memory and prepare bulk write
  const upazilas = await Location.find({ type: 'upazila' });
  const upazilaRiskMap = new Map();
  const districtChildRisks = new Map(); // districtId -> array of child risk scores

  const upazilaBulkOps = [];
  for (const up of upazilas) {
    const risk = computeRiskForUpazilaSync(up, earthquakes, districtMap, reportsMap);
    upazilaRiskMap.set(up._id.toString(), risk);

    if (up.parent) {
      const parentIdStr = up.parent.toString();
      if (!districtChildRisks.has(parentIdStr)) {
        districtChildRisks.set(parentIdStr, []);
      }
      districtChildRisks.get(parentIdStr).push(risk);
    }

    upazilaBulkOps.push({
      updateOne: {
        filter: { _id: up._id },
        update: { $set: { riskScore: risk } }
      }
    });
  }

  if (upazilaBulkOps.length > 0) {
    await Location.bulkWrite(upazilaBulkOps);
    console.log(`✅ Updated risk scores for ${upazilaBulkOps.length} upazilas`);
  }

  // 4. Update districts using the aggregated upazila risks in bulk
  const districtBulkOps = [];
  for (const dist of districts) {
    const childScores = districtChildRisks.get(dist._id.toString()) || [];
    let districtRisk = 0;
    if (childScores.length > 0) {
      const sum = childScores.reduce((acc, val) => acc + val, 0);
      districtRisk = Math.round(sum / childScores.length);
    }

    districtBulkOps.push({
      updateOne: {
        filter: { _id: dist._id },
        update: { $set: { riskScore: districtRisk } }
      }
    });
  }

  if (districtBulkOps.length > 0) {
    await Location.bulkWrite(districtBulkOps);
    console.log(`✅ Updated risk scores for ${districtBulkOps.length} districts`);
  }
}

module.exports = { updateAllRiskScores };