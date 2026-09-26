import { useEffect, useState } from 'react';
import API from '../../services/api';
import { FileText, MapPin, CheckCircle, XCircle, Clock } from 'lucide-react';

const Reports = () => {
  const [myReports, setMyReports] = useState([]);
  const [formData, setFormData] = useState({ type: 'flood', title: '', description: '', upazila: '' });
  const [location, setLocation] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchMyReports();
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setMessage('Please enable GPS to submit reports')
      );
    }
  }, []);

  const fetchMyReports = async () => {
    try {
      const res = await API.get('/community/reports');
      setMyReports(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPhoto(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!location) {
      setMessage('Please enable GPS to submit report');
      return;
    }
    setLoading(true);
    try {
      await API.post('/community/reports', {
        ...formData,
        lat: location.lat,
        lng: location.lng,
        photo: photo || ''
      });
      setMessage('Report submitted! Pending admin review.');
      setFormData({ type: 'flood', title: '', description: '', upazila: '' });
      setPhoto(null);
      fetchMyReports();
    } catch (err) {
      setMessage('Submission failed');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'approved') return <span className="flex items-center gap-1 text-green-600"><CheckCircle className="w-4 h-4"/> Approved</span>;
    if (status === 'rejected') return <span className="flex items-center gap-1 text-red-600"><XCircle className="w-4 h-4"/> Rejected</span>;
    return <span className="flex items-center gap-1 text-yellow-600"><Clock className="w-4 h-4"/> Pending</span>;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2"><FileText className="w-8 h-8" /> Community Reports</h1>

      {/* Submit Form */}
      <div className="bg-white rounded-xl p-6 shadow-sm border mb-8">
        <h2 className="text-xl font-semibold mb-4">Submit New Report</h2>
        {message && <div className="mb-4 p-2 bg-blue-100 text-blue-700 rounded">{message}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1">Disaster Type</label>
            <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full p-2 border rounded">
              <option value="flood">Flood / Waterlogging</option>
              <option value="earthquake">Earthquake / Building Cracks</option>
            </select>
          </div>
          <div>
            <label className="block mb-1">Title</label>
            <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required className="w-full p-2 border rounded" />
          </div>
          <div>
            <label className="block mb-1">Description</label>
            <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required rows="3" className="w-full p-2 border rounded" />
          </div>
          <div>
            <label className="block mb-1">Upazila</label>
            <input type="text" value={formData.upazila} onChange={e => setFormData({...formData, upazila: e.target.value})} required placeholder="e.g., Sylhet Sadar" className="w-full p-2 border rounded" />
          </div>
          <div>
            <label className="block mb-1">Photo (optional)</label>
            <input type="file" accept="image/*" onChange={handlePhotoChange} className="w-full" />
            {photo && <img src={photo} alt="Preview" className="mt-2 h-24 object-cover" />}
          </div>
          <div className="text-sm text-gray-500 flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            {location ? `📍 ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : '📍 Capturing GPS...'}
          </div>
          <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50">
            {loading ? 'Submitting...' : 'Submit Report'}
          </button>
        </form>
      </div>

      {/* My Reports List */}
      <h2 className="text-xl font-semibold mb-4">My Submitted Reports</h2>
      {myReports.length === 0 && <p className="text-gray-500">You haven't submitted any reports yet.</p>}
      <div className="space-y-4">
        {myReports.map(report => (
          <div key={report._id} className="bg-white rounded-lg p-4 border shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold uppercase bg-gray-100 px-2 py-0.5 rounded">{report.type}</span>
                  {getStatusBadge(report.status)}
                </div>
                <h3 className="font-semibold">{report.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{report.description}</p>
                <p className="text-xs text-gray-500 mt-1">📍 {report.upazila}</p>
                {report.photo && <img src={report.photo} alt="report" className="mt-2 h-24 object-cover rounded" />}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default Reports;