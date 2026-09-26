import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Cloud, MapPin, TrendingUp, FileCheck, Home, Package } from 'lucide-react';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import RiskMap from '../map/RiskMap';
import DisasterHistory from './DisasterHistory';
import AlertFeed from './AlertFeed';
import FloodMonitoring from './FloodMonitoring';
import EarthquakeTracker from './EarthquakeTracker';
import FloodForecast from './FloodForecast';
import MultiDisasterTimeline from './MultiDisasterTimeline';

const Dashboard = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [stats, setStats] = useState({
    activeAlerts: 0,
    highRiskAreas: 0,
    openShelters: 0,
    recentReports: 0,
  });
  const [topRiskDistricts, setTopRiskDistricts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch active alerts count
        const alertsRes = await API.get('/alerts/active');
        const activeAlerts = alertsRes.data.length;

        // Fetch high risk areas (districts with riskScore >= 70)
        const locationsRes = await API.get('/locations?type=district');
        const highRiskAreas = locationsRes.data.filter(loc => loc.riskScore >= 70).length;

        // Fetch open shelters count
        const sheltersRes = await API.get('/community/shelters');
        const openShelters = sheltersRes.data.filter(s => s.status === 'open').length;

        // Fetch recent reports count (last 7 days, any status)
        const reportsRes = await API.get('/community/reports');
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const recentReports = reportsRes.data.filter(r => new Date(r.createdAt) >= sevenDaysAgo).length;

        setStats({ activeAlerts, highRiskAreas, openShelters, recentReports });

        // Fetch top risk districts (sorted, limit 4)
        const riskSummaryRes = await API.get('/locations/risk-summary');
        setTopRiskDistricts(riskSummaryRes.data.slice(0, 4));
      } catch (err) {
        console.error('Failed to load dashboard data', err);
        setError('Unable to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const statItems = [
    { label: 'Active Alerts', value: stats.activeAlerts, icon: AlertTriangle, color: 'text-red-600' },
    { label: 'High Risk Areas', value: stats.highRiskAreas, icon: MapPin, color: 'text-orange-600' },
    { label: 'Open Shelters', value: stats.openShelters, icon: Cloud, color: 'text-green-600' },
    { label: 'Recent Reports', value: stats.recentReports, icon: TrendingUp, color: 'text-blue-600' },
  ];

  if (loading) return <div className="text-center py-10">Loading dashboard...</div>;
  if (error) return <div className="text-center py-10 text-red-600">{error}</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Real-time disaster monitoring and early warning alerts</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statItems.map((stat) => (
          <div key={stat.label} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">{stat.label}</span>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Admin Quick Actions (only visible to admin) */}
      {isAdmin && (
        <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/admin/reports" className="bg-indigo-50 rounded-lg p-4 border border-indigo-200 hover:shadow-md transition">
            <div className="flex items-center gap-2 text-indigo-700">
              <FileCheck className="w-6 h-6" />
              <span className="font-semibold">Verify Reports</span>
            </div>
            <p className="text-sm text-indigo-600 mt-1">Approve/reject citizen reports</p>
          </Link>
          <Link to="/admin/shelters" className="bg-green-50 rounded-lg p-4 border border-green-200 hover:shadow-md transition">
            <div className="flex items-center gap-2 text-green-700">
              <Home className="w-6 h-6" />
              <span className="font-semibold">Manage Shelters</span>
            </div>
            <p className="text-sm text-green-600 mt-1">Add or update shelter information</p>
          </Link>
          <Link to="/admin/resources" className="bg-orange-50 rounded-lg p-4 border border-orange-200 hover:shadow-md transition">
            <div className="flex items-center gap-2 text-orange-700">
              <Package className="w-6 h-6" />
              <span className="font-semibold">Post Resources</span>
            </div>
            <p className="text-sm text-orange-600 mt-1">Add urgent needs for shelters</p>
          </Link>
        </div>
      )}

      {/* Risk Map Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-3">Risk Map (Districts)</h2>
        <RiskMap />
      </div>

      {/* Alert Feed */}
      <div className="mb-8">
        <AlertFeed />
        <div className="text-right mt-2">
          <Link to="/alerts" className="text-sm text-blue-600 hover:underline">View full history →</Link>
        </div>
      </div>

      {/* Risk Summary + Disaster History */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Top Risk Districts</h2>
          {topRiskDistricts.length === 0 ? (
            <p className="text-gray-500">No risk data available</p>
          ) : (
            <div className="space-y-3">
              {topRiskDistricts.map((district) => (
                <div key={district.name}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{district.name}</span>
                    <span>{district.riskScore}/100</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${district.riskScore >= 70 ? 'bg-red-500' : district.riskScore >= 40 ? 'bg-orange-500' : 'bg-green-500'}`}
                      style={{ width: `${district.riskScore}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <DisasterHistory compact={true} />
      </div>

      {/* Sprint 4 Modules */}
      <div className="mt-12 pt-8 border-t border-gray-200 space-y-10">
        <FloodMonitoring />
        <div className="grid lg:grid-cols-2 gap-8">
          <EarthquakeTracker />
          <div className="space-y-8">
            <FloodForecast />
            <MultiDisasterTimeline />
          </div>
        </div>
      </div>

      {/* Citizen Quick Actions */}
      <div className="mt-8 grid md:grid-cols-3 gap-4">
        <Link to="/shelters" className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-center">Find Nearest Shelter</Link>
        <Link to="/submit-report" className="p-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-center">Submit a Report</Link>
        <Link to="/disasters" className="p-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-center">View Disaster Modules</Link>
      </div>
    </div>
  );
};

export default Dashboard;