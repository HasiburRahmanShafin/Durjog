import { useEffect, useState } from 'react';
import API from '../../services/api';
import { Package } from 'lucide-react';

const ResourceDemand = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [offering, setOffering] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await API.get('/community/resources');
      setRequests(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const offerHelp = async (requestId) => {
    setOffering(requestId);
    try {
      await API.post(`/community/resources/${requestId}/offer`);
      alert('✅ Help offered! The shelter will contact you.');
      await fetchRequests(); // refresh
    } catch (err) {
      alert('Failed to offer help. Try again later.');
    } finally {
      setOffering(null);
    }
  };

  const getUrgencyStyle = (urgency) => {
    switch (urgency) {
      case 'critical': return 'bg-red-100 border-red-500 text-red-700';
      case 'high': return 'bg-orange-100 border-orange-500 text-orange-700';
      default: return 'bg-yellow-100 border-yellow-500 text-yellow-700';
    }
  };

  if (loading) return <div className="text-center py-8">Loading resources...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2"><Package /> Resource Demand Board</h1>
      {requests.length === 0 && <p className="text-gray-500">No active resource requests at the moment.</p>}
      <div className="grid md:grid-cols-2 gap-6">
        {requests.map(req => (
          <div key={req._id} className={`border-l-4 rounded-lg p-4 shadow-sm ${getUrgencyStyle(req.urgency)}`}>
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-lg">{req.item}</h3>
                <p className="text-sm text-gray-600">Shelter: {req.shelter?.name}</p>
                <p>Need: {req.quantity}</p>
                <p>Fulfilled: {req.fulfilled}</p>
                <p className="text-xs uppercase font-semibold mt-1">Urgency: {req.urgency}</p>
              </div>
              <button
                onClick={() => offerHelp(req._id)}
                disabled={offering === req._id}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
              >
                {offering === req._id ? 'Offering...' : 'Offer Help 🤝'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default ResourceDemand;