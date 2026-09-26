const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  bn_name: { type: String },
  type: { type: String, enum: ['division', 'district', 'upazila'], required: true },
  parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Location', default: null },
  lat: { type: Number, default: null },           // optional, can be null
  long: { type: Number, default: null },          // optional
  riskScore: { type: Number, default: 0, min: 0, max: 100 },
  floodProne: { type: Boolean, default: false },
  seismicZone: { type: String, enum: ['low', 'moderate', 'high'], default: 'low' },
  geometry: {
    type: { type: String, enum: ['Point', 'Polygon'], default: 'Point' },
    coordinates: { type: [Number], default: null }   // allow null
  }
}, { timestamps: true });
locationSchema.index({ geometry: '2dsphere' }, { sparse: true });
module.exports = mongoose.model('Location', locationSchema);