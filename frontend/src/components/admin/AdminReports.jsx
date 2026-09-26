import { useEffect, useState } from 'react';
import API from '../../services/api';
import { FileCheck, CheckCircle2, XCircle, Clock, MapPin, Eye } from 'lucide-react';

const AdminReports = () => {
  const [reports, setReports] = useState([]);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [previewPhoto, setPreviewPhoto] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchReports = async (status) => {
    setLoading(true);
    try {
      const res = await API.get(`/community/reports${status ? `?status=${status}` : ''}`);
      setReports(res.data);
    } catch (err) {
      console.error('Error fetching admin reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports(statusFilter);
  }, [statusFilter]);

  const verify = async (id, status) => {
    setActionLoading(id);
    try {
      await API.put('/community/reports/verify', { reportId: id, status });
      setReports(prev => prev.filter(r => r._id !== id));
    } catch (err) {
      alert('Failed to update report status: ' + (err.response?.data?.msg || err.message));
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileCheck className="w-7 h-7 text-indigo-600" />
            Citizen Incident Reports Verification
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Review, verify, and validate ground-level disaster reports from registered citizens.
          </p>
        </div>

        {/* Status filters */}
        <div className="flex bg-gray-100 p-1 rounded-xl text-xs font-semibold">
          {['pending', 'approved', 'rejected'].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg capitalize transition ${
                statusFilter === status
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-gray-500 bg-white rounded-xl border border-gray-200">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-600 border-t-transparent mb-2"></div>
          <p>Loading reports...</p>
        </div>
      ) : reports.length === 0 ? (
        <div className="p-12 text-center text-gray-500 bg-white rounded-xl border border-gray-200">
          <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-2 opacity-80" />
          <p className="text-base font-semibold text-gray-800">No {statusFilter} reports</p>
          <p className="text-sm text-gray-500 mt-1">All reports in this queue have been processed.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((r) => (
            <div
              key={r._id}
              className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow transition flex flex-col md:flex-row gap-5 justify-between"
            >
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`text-xs uppercase font-bold px-2.5 py-0.5 rounded-full ${
                    r.type === 'flood' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {r.type}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full capitalize font-medium ${
                    r.status === 'approved' ? 'bg-green-100 text-green-700' :
                    r.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {r.status}
                  </span>
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(r.createdAt).toLocaleString()}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-gray-900">{r.title}</h3>
                <p className="text-sm text-gray-600">{r.description}</p>

                <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 pt-2 border-t border-gray-100">
                  <span className="flex items-center gap-1 text-indigo-600 font-medium">
                    <MapPin className="w-3.5 h-3.5" />
                    Upazila: {r.upazila}
                  </span>
                  {r.location?.coordinates && (
                    <span>Coordinates: [{r.location.coordinates[1]?.toFixed(4)}, {r.location.coordinates[0]?.toFixed(4)}]</span>
                  )}
                  {r.user?.name && <span>Reported by: <strong>{r.user.name}</strong></span>}
                </div>
              </div>

              {/* Photo & Actions */}
              <div className="flex md:flex-col items-center md:items-end justify-between gap-3 border-t md:border-t-0 pt-3 md:pt-0">
                {r.photo && (
                  <button
                    onClick={() => setPreviewPhoto(r.photo)}
                    className="relative group w-20 h-20 rounded-lg overflow-hidden border border-gray-200"
                  >
                    <img src={r.photo} alt="Report attachment" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition">
                      <Eye className="w-5 h-5" />
                    </div>
                  </button>
                )}

                {r.status === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => verify(r._id, 'approved')}
                      disabled={actionLoading === r._id}
                      className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-sm transition disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => verify(r._id, 'rejected')}
                      disabled={actionLoading === r._id}
                      className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-sm transition disabled:opacity-50"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Photo Preview Modal */}
      {previewPhoto && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4"
          onClick={() => setPreviewPhoto(null)}
        >
          <div className="bg-white p-2 rounded-xl max-w-2xl max-h-[85vh] overflow-hidden shadow-2xl">
            <img src={previewPhoto} alt="Full preview" className="max-h-[80vh] w-auto rounded-lg object-contain" />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReports;