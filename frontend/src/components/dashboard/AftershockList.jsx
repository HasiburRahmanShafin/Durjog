import { useEffect, useState, useCallback } from 'react';
import API from '../../services/api';
import { Plus } from 'lucide-react';

const AftershockList = ({ eventId }) => {
  const [aftershocks, setAftershocks] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newMagnitude, setNewMagnitude] = useState(4.0);
  const [newDepth, setNewDepth] = useState(30);

  const fetchAftershocks = useCallback(async () => {
    try {
      const res = await API.get(`/disaster/earthquakes/aftershocks/${eventId}`);
      setAftershocks(res.data);
    } catch (err) {
      console.error(err);
    }
  }, [eventId]);

  useEffect(() => {
    fetchAftershocks();
  }, [fetchAftershocks]);

  const addAftershock = async () => {
    try {
      await API.post('/disaster/earthquakes/aftershocks', {
        mainEvent: eventId,
        magnitude: newMagnitude,
        depth: newDepth,
        epicenter: 'Near epicenter'
      });
      fetchAftershocks();
      setShowAdd(false);
    } catch (err) {
      console.error(err);
    }
  };

  if (!aftershocks.length && !showAdd) return null;

  return (
    <div className="mt-3 pt-2 border-t text-sm">
      <div className="font-semibold">Aftershocks ({aftershocks.length})</div>
      <ul className="list-disc list-inside text-gray-600">
        {aftershocks.map(af => (
          <li key={af._id}>M{af.magnitude} at {new Date(af.time).toLocaleString()} (depth {af.depth}km)</li>
        ))}
      </ul>
      <button onClick={() => setShowAdd(true)} className="mt-2 text-blue-600 text-xs flex items-center gap-1"><Plus className="w-3 h-3"/> Log aftershock</button>
      {showAdd && (
        <div className="mt-2 p-2 bg-gray-50 rounded flex gap-2 items-end">
          <div><label className="text-xs">Mag</label><input type="number" step="0.1" value={newMagnitude} onChange={e => setNewMagnitude(parseFloat(e.target.value))} className="w-16 px-1 border rounded" /></div>
          <div><label className="text-xs">Depth</label><input type="number" value={newDepth} onChange={e => setNewDepth(parseInt(e.target.value))} className="w-16 px-1 border rounded" /></div>
          <button onClick={addAftershock} className="bg-blue-600 text-white px-2 py-1 rounded text-xs">Save</button>
          <button onClick={() => setShowAdd(false)} className="text-gray-500 text-xs">Cancel</button>
        </div>
      )}
    </div>
  );
};
export default AftershockList;