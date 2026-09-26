import { useEffect, useState } from 'react';
import API from '../../services/api';
import { Calendar, Droplets, TrendingUp, Wind, Sun, Users, DollarSign, X, ExternalLink, History } from 'lucide-react';

const DisasterHistory = ({ compact = false }) => {
  const [historyList, setHistoryList] = useState([]);
  const [timelineEvents, setTimelineEvents] = useState([]);
  const [selectedDisaster, setSelectedDisaster] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [activeTab, setActiveTab] = useState('catalog'); // 'catalog' | 'timeline'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [historyRes, timelineRes] = await Promise.all([
          API.get('/disaster'),
          API.get('/disaster/timeline')
        ]);
        setHistoryList(historyRes.data || []);
        setTimelineEvents(timelineRes.data || []);
      } catch (err) {
        console.error('Failed to load disaster history', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getTypeIcon = (type) => {
    switch (type) {
      case 'flood':
        return <Droplets className="w-5 h-5 text-blue-500" />;
      case 'earthquake':
        return <TrendingUp className="w-5 h-5 text-amber-500" />;
      case 'cyclone':
        return <Wind className="w-5 h-5 text-cyan-500" />;
      default:
        return <Sun className="w-5 h-5 text-red-500" />;
    }
  };

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'extreme':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'severe':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'moderate':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  };

  const filteredHistory = historyList.filter(item => {
    if (filterType === 'all') return true;
    return item.type === filterType;
  });

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 text-center py-10">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
        <p className="mt-2 text-sm text-gray-500">Loading historical disaster records...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <History className="w-6 h-6 text-blue-600" />
            Historical Disasters of Bangladesh
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Key disaster events, socio-economic impact & retrospective records
          </p>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center bg-gray-100 p-1 rounded-lg text-xs font-medium">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`px-3 py-1.5 rounded-md transition ${
              activeTab === 'catalog' ? 'bg-white shadow text-gray-900 font-semibold' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Major Events ({historyList.length})
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`px-3 py-1.5 rounded-md transition ${
              activeTab === 'timeline' ? 'bg-white shadow text-gray-900 font-semibold' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Timeline Stream ({timelineEvents.length})
          </button>
        </div>
      </div>

      {activeTab === 'catalog' ? (
        <div>
          {/* Filters */}
          <div className="flex flex-wrap gap-2 mb-6">
            {['all', 'flood', 'cyclone', 'earthquake'].map(type => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider transition ${
                  filterType === type
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Cards Grid */}
          <div className={`grid gap-4 ${compact ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
            {filteredHistory.map((item) => (
              <div
                key={item.id}
                className="group border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition flex flex-col justify-between bg-white"
              >
                <div>
                  {/* Thumbnail */}
                  <div className="relative h-44 bg-gray-100 overflow-hidden">
                    <img
                      src={item.thumbnail || item.image}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm text-white px-2.5 py-1 rounded-full text-xs">
                      {getTypeIcon(item.type)}
                      <span className="capitalize">{item.type}</span>
                    </div>
                    <span
                      className={`absolute top-3 right-3 text-xs uppercase px-2 py-0.5 rounded-full font-bold border ${getSeverityBadge(
                        item.severity
                      )}`}
                    >
                      {item.severity}
                    </span>
                  </div>

                  {/* Body */}
                  <div className="p-4">
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {item.date}
                      </span>
                    </div>

                    <h3 className="font-bold text-gray-900 text-base mb-2 group-hover:text-blue-600 transition">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 text-xs line-clamp-2 mb-4">
                      {item.description}
                    </p>

                    {/* Stats pills */}
                    <div className="grid grid-cols-2 gap-2 bg-gray-50 rounded-lg p-2.5 text-xs mb-2">
                      <div className="flex items-center gap-1.5 text-gray-700">
                        <Users className="w-3.5 h-3.5 text-blue-600" />
                        <div>
                          <div className="text-[10px] text-gray-500 uppercase font-bold">Affected</div>
                          <div className="font-semibold">{item.affected}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-700">
                        <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                        <div>
                          <div className="text-[10px] text-gray-500 uppercase font-bold">Damage</div>
                          <div className="font-semibold">{item.damage}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 pt-0">
                  <button
                    onClick={() => setSelectedDisaster(item)}
                    className="w-full py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded-lg flex items-center justify-center gap-1 transition"
                  >
                    <span>Read Full Case Study</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Timeline View */
        <div className="relative border-l-2 border-blue-200 ml-4 pl-6 space-y-6 max-h-[550px] overflow-y-auto pr-2">
          {timelineEvents.map((event, idx) => (
            <div key={idx} className="relative group">
              <div className="absolute -left-[31px] top-1 w-3.5 h-3.5 bg-blue-600 rounded-full border-2 border-white shadow"></div>
              <div className="flex items-center gap-2 mb-1">
                {getTypeIcon(event.type)}
                <span className="text-xs text-gray-500 font-medium">
                  {new Date(event.date).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </span>
                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${getSeverityBadge(event.severity)}`}>
                  {event.severity}
                </span>
              </div>
              <h4 className="font-bold text-gray-900 text-sm">{event.title}</h4>
              <p className="text-xs text-gray-600 mt-1">{event.description}</p>
              {event.upazila && (
                <p className="text-[11px] text-blue-600 mt-1 font-medium">
                  📍 {event.upazila}
                </p>
              )}
            </div>
          ))}
          {timelineEvents.length === 0 && (
            <p className="text-gray-500 text-sm">No timeline events available.</p>
          )}
        </div>
      )}

      {/* Case Study Modal */}
      {selectedDisaster && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100">
            <div className="relative h-60 bg-gray-900">
              <img
                src={selectedDisaster.image || selectedDisaster.thumbnail}
                alt={selectedDisaster.title}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setSelectedDisaster(null)}
                className="absolute top-4 right-4 bg-black/60 hover:bg-black/80 text-white rounded-full p-1.5 transition"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-lg text-white">
                <span className="text-xs uppercase font-bold tracking-wider text-yellow-300">
                  {selectedDisaster.type}
                </span>
                <h3 className="text-lg font-bold">{selectedDisaster.title}</h3>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-3 gap-3 mb-6 bg-blue-50 border border-blue-100 rounded-xl p-3.5 text-center">
                <div>
                  <div className="text-xs text-gray-500 uppercase font-semibold">Date</div>
                  <div className="font-bold text-gray-900 text-sm">{selectedDisaster.date}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 uppercase font-semibold">Affected</div>
                  <div className="font-bold text-blue-600 text-sm">{selectedDisaster.affected}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 uppercase font-semibold">Financial Loss</div>
                  <div className="font-bold text-emerald-600 text-sm">{selectedDisaster.damage}</div>
                </div>
              </div>

              <div className="space-y-4 text-gray-700 text-sm leading-relaxed">
                <h4 className="font-semibold text-gray-900 text-base">Impact Analysis & History</h4>
                <p>{selectedDisaster.fullDescription || selectedDisaster.description}</p>
              </div>

              <div className="mt-8 flex justify-end">
                <button
                  onClick={() => setSelectedDisaster(null)}
                  className="px-5 py-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-lg transition"
                >
                  Close Case Study
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DisasterHistory;