import { useEffect, useState, useCallback } from 'react';
import { getAlertHistory } from '../../services/alertService';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

const AlertHistory = () => {
  const [alerts, setAlerts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchHistory = useCallback(async () => {
    try {
      const res = await getAlertHistory(page);
      setAlerts(res.data.alerts);
      setTotalPages(res.data.pages);
    } catch (err) {
      console.error('Failed to fetch alert history', err);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  if (loading) return <div className="p-8 text-center">Loading history...</div>;

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <Calendar className="w-5 h-5 mr-2 text-blue-600" />
        Alert History
      </h2>
      {alerts.length === 0 ? (
        <p className="text-gray-500 text-center py-4">No past alerts</p>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {alerts.map(alert => (
            <div key={alert._id} className="border-b border-gray-100 pb-3 last:border-0">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded uppercase font-semibold ${
                      alert.level === 'emergency' ? 'bg-red-100 text-red-700' :
                      alert.level === 'warning' ? 'bg-orange-100 text-orange-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {alert.level}
                    </span>
                    <span className="text-xs text-gray-500">{new Date(alert.timestamp).toLocaleDateString()}</span>
                  </div>
                  <h3 className="font-medium mt-1">{alert.title}</h3>
                  <p className="text-sm text-gray-600">{alert.description}</p>
                  <div className="text-xs text-gray-400 mt-1">Trigger: {alert.trigger}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="flex justify-between items-center mt-4 pt-2 border-t">
        <button
          onClick={() => setPage(p => Math.max(1, p-1))}
          disabled={page === 1}
          className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-sm">Page {page} of {totalPages}</span>
        <button
          onClick={() => setPage(p => Math.min(totalPages, p+1))}
          disabled={page === totalPages}
          className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default AlertHistory;