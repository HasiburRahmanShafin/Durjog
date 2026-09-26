import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import { Send, MapPin, Camera, AlertTriangle, ArrowLeft, CheckCircle2 } from 'lucide-react';

const SubmitReport = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    type: 'flood',
    title: '',
    description: '',
    upazila: '',
  });
  const [location, setLocation] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    captureLocation();
  }, []);

  const captureLocation = () => {
    if (!navigator.geolocation) {
      setMessage({ type: 'error', text: 'Geolocation is not supported by your browser.' });
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGpsLoading(false);
      },
      () => {
        setMessage({ type: 'warning', text: 'Please enable GPS permissions to submit geolocation data.' });
        setGpsLoading(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'Photo must be smaller than 5MB.' });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setPhoto(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!location) {
      setMessage({ type: 'error', text: 'GPS location is required for field verification. Please click "Detect GPS" below.' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await API.post('/community/reports', {
        ...formData,
        lat: location.lat,
        lng: location.lng,
        photo: photo || '',
      });
      setMessage({ type: 'success', text: 'Incident report submitted successfully! It is now pending admin review.' });
      setFormData({ type: 'flood', title: '', description: '', upazila: '' });
      setPhoto(null);
      setTimeout(() => {
        navigate('/reports');
      }, 1800);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.msg || 'Failed to submit report. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-sm font-medium text-gray-600 hover:text-blue-600 transition"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </button>
        <button
          onClick={() => navigate('/reports')}
          className="text-sm text-blue-600 hover:underline font-medium"
        >
          View All Community Reports →
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-5 text-white">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-6 h-6 text-yellow-300" />
            <h1 className="text-2xl font-bold">Submit Citizen Incident Report</h1>
          </div>
          <p className="text-blue-100 text-sm mt-1">
            Help your community and authorities stay aware of real-time disaster conditions.
          </p>
        </div>

        <div className="p-6">
          {message.text && (
            <div
              className={`mb-6 p-4 rounded-xl flex items-center gap-2 text-sm ${
                message.type === 'success'
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : message.type === 'warning'
                  ? 'bg-yellow-50 text-yellow-800 border border-yellow-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {message.type === 'success' && <CheckCircle2 className="w-5 h-5 flex-shrink-0" />}
              <span>{message.text}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Disaster Category</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="flood">🌊 Flood / River Overflow / Waterlogging</option>
                <option value="earthquake">⚠️ Earthquake / Structural Damage / Cracks</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Incident Headline</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Embankment breach near Surma river"
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Upazila / Area</label>
              <input
                type="text"
                value={formData.upazila}
                onChange={(e) => setFormData({ ...formData, upazila: e.target.value })}
                placeholder="e.g., Sylhet Sadar"
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Detailed Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Provide details about water level, affected people, blocked roads, or collapsed structures..."
                required
                rows="4"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Attach Photo (Optional)</label>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 text-sm font-medium text-gray-700">
                  <Camera className="w-4 h-4 text-blue-600" />
                  <span>Choose Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                </label>
                {photo && (
                  <div className="relative">
                    <img src={photo} alt="Upload preview" className="h-16 w-16 object-cover rounded-lg border" />
                    <button
                      type="button"
                      onClick={() => setPhoto(null)}
                      className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* GPS Location Tracker */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center space-x-2 text-sm text-gray-700">
                <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <span>
                  {location
                    ? `GPS: ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`
                    : gpsLoading
                    ? 'Detecting GPS coordinates...'
                    : 'GPS coordinates not detected yet'}
                </span>
              </div>
              <button
                type="button"
                onClick={captureLocation}
                disabled={gpsLoading}
                className="text-xs bg-white border border-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-100 font-medium disabled:opacity-50"
              >
                {gpsLoading ? 'Detecting...' : 'Redetect GPS'}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading || !location}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl flex items-center justify-center space-x-2 shadow transition disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{loading ? 'Submitting Report...' : 'Submit Incident Report'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SubmitReport;