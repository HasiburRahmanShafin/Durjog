import { useEffect, useState } from 'react';
import API from '../../services/api';
import { MapPin, Phone, Navigation, Shield } from 'lucide-react';

const Shelters = () => {
  const [shelters, setShelters] = useState([]);
  const [nearest, setNearest] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    API.get('/community/shelters')
      .then(res => setShelters(res.data))
      .catch(console.error);
  }, []);

  const findNearest = () => {
    if (!navigator.geolocation) {
      alert('Geolocation not supported');
      return;
    }
    navigator.geolocation.getCurrentPosition(async (pos) => {
      setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      setLoading(true);
      try {
        const res = await API.get(`/community/shelters/nearby?lng=${pos.coords.longitude}&lat=${pos.coords.latitude}`);
        setNearest(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2"><Shield className="w-8 h-8" /> Emergency Shelters</h1>
      
      <div className="flex items-center gap-4 mb-6">
        <button onClick={findNearest} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700">
          <Navigation className="w-4 h-4" /> Find Nearest Open Shelter
        </button>
        {userLocation && (
          <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1.5 rounded-lg flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-blue-600" />
            Your GPS: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
          </span>
        )}
      </div>

      {loading && <p>Searching nearby shelters...</p>}
      {nearest.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-3">Nearest Shelters (within 50km)</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {nearest.map(s => (
              <div key={s._id} className="border rounded-lg p-4 shadow-sm">
                <h3 className="font-bold text-lg">{s.name}</h3>
                <p className="text-sm text-gray-600">Distance: {(s.distance / 1000).toFixed(1)} km</p>
                <p>Capacity: {s.occupied}/{s.capacity}</p>
                <p>Status: <span className={s.status === 'open' ? 'text-green-600' : 'text-red-600'}>{s.status}</span></p>
                <p className="flex items-center gap-1"><Phone className="w-4 h-4" /> {s.contact}</p>
                <a href={`https://www.google.com/maps/dir/?api=1&destination=${s.location.coordinates[1]},${s.location.coordinates[0]}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-sm mt-2 inline-block">Get Directions →</a>
              </div>
            ))}
          </div>
        </div>
      )}

      <h2 className="text-xl font-semibold mb-3">All Shelters</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {shelters.map(s => (
          <div key={s._id} className="border rounded-lg p-4 shadow-sm">
            <h3 className="font-bold">{s.name}</h3>
            <p className="text-sm text-gray-600 flex items-center gap-1"><MapPin className="w-3 h-3"/> {s.upazila}</p>
            <p>Status: <span className={s.status === 'open' ? 'text-green-600' : 'text-red-600'}>{s.status}</span></p>
            <p>Capacity: {s.occupied}/{s.capacity}</p>
            <p className="flex items-center gap-1"><Phone className="w-4 h-4" /> {s.contact}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
export default Shelters;