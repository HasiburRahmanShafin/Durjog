import { useEffect, useState, useCallback } from 'react';
import { getActiveAlerts } from '../../services/alertService';
import { getSocket } from '../../services/socket';
import { useAuth } from '../../context/AuthContext';
import { AlertTriangle, Droplets, TrendingUp, MapPin, Clock } from 'lucide-react';

const AlertFeed = () => {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('severity'); // severity, date

  const fetchAlerts = useCallback(async () => {
    try {
      const res = await getActiveAlerts();
      // Filter alerts: only show those whose upazila is in user's preferredUpazilas
      const followedUpazilas = user?.preferredUpazilas || [];
      let filtered = res.data;
      if (followedUpazilas.length > 0) {
        filtered = res.data.filter(alert => followedUpazilas.includes(alert.upazila));
      }
      setAlerts(filtered);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAlerts();
    const socket = getSocket();
    const onAlert = () => fetchAlerts();
    if (socket) {
      socket.on('newAlert', onAlert);
    }
    const interval = setInterval(fetchAlerts, 30000);
    return () => {
      clearInterval(interval);
      if (socket) socket.off('newAlert', onAlert);
    };
  }, [fetchAlerts]);

  const sortedAlerts = [...alerts];
  if (sortBy === 'severity') {
    const order = { emergency: 3, warning: 2, watch: 1 };
    sortedAlerts.sort((a, b) => order[b.level] - order[a.level] || new Date(b.timestamp) - new Date(a.timestamp));
  } else {
    sortedAlerts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  const getLevelBadge = (level) => {
    switch (level) {
      case 'emergency': return 'bg-red-100 text-red-700 border-red-500';
      case 'warning': return 'bg-orange-100 text-orange-700 border-orange-500';
      default: return 'bg-yellow-100 text-yellow-700 border-yellow-500';
    }
  };

  const getTypeIcon = (type) => {
    return type === 'flood' ? <Droplets className="w-5 h-5 text-blue-600" /> : <TrendingUp className="w-5 h-5 text-orange-600" />;
  };

  const getRecommendedAction = (level, type) => {
    if (type === 'flood') {
      if (level === 'emergency') return '🚨 Evacuate to higher ground immediately.';
      if (level === 'warning') return '⚠️ Prepare to move valuables. Monitor water levels.';
      return '📢 Stay informed. Avoid flooded roads.';
    } else {
      if (level === 'emergency') return '🏃 Drop, cover, hold on. Evacuate if unsafe.';
      if (level === 'warning') return '🪑 Stay away from windows. Secure heavy objects.';
      return '👀 Be aware of possible aftershocks.';
    }
  };

  if (loading) return <div className="p-4 text-center">Loading alerts...</div>;

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2 text-red-600" />
          Active Alerts
          {alerts.length > 0 && <span className="ml-2 bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full">{alerts.length}</span>}
        </h2>
        <div className="flex gap-2 text-sm">
          <button onClick={() => setSortBy('severity')} className={`px-2 py-1 rounded ${sortBy === 'severity' ? 'bg-blue-100 text-blue-700' : 'text-gray-500'}`}>Severity</button>
          <button onClick={() => setSortBy('date')} className={`px-2 py-1 rounded ${sortBy === 'date' ? 'bg-blue-100 text-blue-700' : 'text-gray-500'}`}>Newest</button>
        </div>
      </div>
      {alerts.length === 0 ? (
        <p className="text-gray-500 text-center py-4">No active alerts</p>
      ) : (
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {sortedAlerts.map(alert => (
            <div key={alert._id} className={`border-l-4 rounded-lg p-4 ${getLevelBadge(alert.level)}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    {getTypeIcon(alert.type)}
                    <span className="text-xs font-semibold uppercase">{alert.level}</span>
                    <span className="text-xs text-gray-500 flex items-center"><Clock className="w-3 h-3 mr-1" />{new Date(alert.timestamp).toLocaleString()}</span>
                  </div>
                  <h3 className="font-medium">{alert.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{alert.description}</p>
                  <p className="text-xs text-gray-500 mt-1 italic">{getRecommendedAction(alert.level, alert.type)}</p>
                  <div className="flex items-center text-xs text-gray-500 mt-2">
                    <MapPin className="w-3 h-3 mr-1" />
                    {alert.upazila}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AlertFeed;