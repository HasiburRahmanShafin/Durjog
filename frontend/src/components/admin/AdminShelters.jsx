import { useEffect, useState } from 'react';
import API from '../../services/api';
import { Home } from 'lucide-react';

const AdminShelters = () => {
  const [shelters, setShelters] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    type: 'both',
    lat: '',
    lng: '',
    upazila: '',
    capacity: '',
    contact: '',
    status: 'open',
    facilities: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchShelters();
  }, []);

  const fetchShelters = async () => {
    try {
      const res = await API.get('/community/shelters');
      setShelters(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post('/community/shelters', {
        ...formData,
        location: { type: 'Point', coordinates: [parseFloat(formData.lng), parseFloat(formData.lat)] },
        facilities: formData.facilities ? formData.facilities.split(',').map(f => f.trim()).filter(Boolean) : []
      });
      setMessage('Shelter added successfully');
      setFormData({ name: '', type: 'both', lat: '', lng: '', upazila: '', capacity: '', contact: '', status: 'open', facilities: '' });
      fetchShelters();
    } catch (err) {
      setMessage('Failed to add shelter');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2"><Home /> Manage Shelters</h2>
      {message && <div className="mb-4 p-2 bg-blue-100 text-blue-700 rounded">{message}</div>}
      
      <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow mb-6 space-y-3">
        <h3 className="font-semibold">Add New Shelter</h3>
        <div className="grid md:grid-cols-2 gap-3">
          <input type="text" placeholder="Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required className="p-2 border rounded" />
          <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="p-2 border rounded">
            <option value="flood">Flood</option>
            <option value="earthquake">Earthquake</option>
            <option value="both">Both</option>
          </select>
          <input type="text" placeholder="Latitude" value={formData.lat} onChange={e => setFormData({...formData, lat: e.target.value})} required className="p-2 border rounded" />
          <input type="text" placeholder="Longitude" value={formData.lng} onChange={e => setFormData({...formData, lng: e.target.value})} required className="p-2 border rounded" />
          <input type="text" placeholder="Upazila" value={formData.upazila} onChange={e => setFormData({...formData, upazila: e.target.value})} required className="p-2 border rounded" />
          <input type="number" placeholder="Capacity" value={formData.capacity} onChange={e => setFormData({...formData, capacity: e.target.value})} required className="p-2 border rounded" />
          <input type="text" placeholder="Contact" value={formData.contact} onChange={e => setFormData({...formData, contact: e.target.value})} required className="p-2 border rounded" />
          <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="p-2 border rounded">
            <option value="open">Open</option>
            <option value="full">Full</option>
            <option value="closed">Closed</option>
          </select>
          <input type="text" placeholder="Facilities (comma separated)" value={formData.facilities} onChange={e => setFormData({...formData, facilities: e.target.value})} className="p-2 border rounded" />
        </div>
        <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Add Shelter</button>
      </form>

      <h3 className="font-semibold text-lg mb-2">Existing Shelters</h3>
      <div className="space-y-2">
        {shelters.map(s => (
          <div key={s._id} className="border p-3 rounded flex justify-between">
            <div><strong>{s.name}</strong><br/>{s.upazila} | {s.status}</div>
            <button onClick={() => {/* optional edit */}} className="text-blue-600">Edit</button>
          </div>
        ))}
      </div>
    </div>
  );
};
export default AdminShelters;