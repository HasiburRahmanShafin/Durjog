import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import API from '../../services/api';

// Side panel component
const DistrictDetails = ({ district }) => {
  if (!district) return null;
  return (
    <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
      <h3 className="font-bold text-lg mb-2">{district.name}</h3>
      <div className="space-y-2 text-sm">
        <p><span className="font-medium">Risk Score:</span> {district.riskScore}/100</p>
        <p><span className="font-medium">Flood Prone:</span> {district.floodProne ? 'Yes' : 'No'}</p>
        <p><span className="font-medium">Seismic Zone:</span> {district.seismicZone}</p>
        <p><span className="font-medium">Type:</span> {district.type}</p>
      </div>
    </div>
  );
};

const RiskMap = () => {
  const [geoJsonData, setGeoJsonData] = useState(null);
  const [riskData, setRiskData] = useState({});
  const [fullLocationData, setFullLocationData] = useState({});
  const [locationsList, setLocationsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [showFloodOverlay, setShowFloodOverlay] = useState(false);
  const [showSeismicOverlay, setShowSeismicOverlay] = useState(false);
  const [floodOverlayData, setFloodOverlayData] = useState(null);
  const [seismicOverlayData, setSeismicOverlayData] = useState(null);

  const API_BASE = process.env.REACT_APP_API_URL 
    ? process.env.REACT_APP_API_URL.replace(/\/api\/?$/, '') 
    : 'http://localhost:5000';

  // Fetch GeoJSON boundaries and district data
  useEffect(() => {
    const fetchGeoJson = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/geojson/bangladesh.geojson`);
        const data = await res.json();
        setGeoJsonData(data);
      } catch (err) {
        console.error('Failed to load GeoJSON', err);
      }
    };

    const fetchDistricts = async () => {
      try {
        const res = await API.get('/locations?type=district');
        const riskMap = {};
        const fullMap = {};
        const list = [];
        res.data.forEach(loc => {
          riskMap[loc.name] = loc.riskScore;
          fullMap[loc.name] = loc;
          list.push(loc);
        });
        setRiskData(riskMap);
        setFullLocationData(fullMap);
        setLocationsList(list);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchGeoJson();
    fetchDistricts();
  }, [API_BASE]);

  // Fetch flood overlay when toggled on
  useEffect(() => {
    if (showFloodOverlay) {
      fetch(`${API_BASE}/api/geojson/flood-prone-areas.geojson`)
        .then(res => res.json())
        .then(data => {
          setFloodOverlayData(data);
        })
        .catch(err => console.error('Flood overlay error', err));
    } else {
      setFloodOverlayData(null);
    }
  }, [showFloodOverlay, API_BASE]);

  // Fetch seismic overlay when toggled on
  useEffect(() => {
    if (showSeismicOverlay) {
      fetch(`${API_BASE}/api/geojson/seismic-zones.geojson`)
        .then(res => res.json())
        .then(data => {
          setSeismicOverlayData(data);
        })
        .catch(err => console.error('Seismic overlay error', err));
    } else {
      setSeismicOverlayData(null);
    }
  }, [showSeismicOverlay, API_BASE]);

  // Vibrant colors
  const getColorByRisk = (risk) => {
    if (risk >= 70) return '#ff2a2a'; // bright red
    if (risk >= 40) return '#ff8c00'; // bright orange
    return '#32cd32'; // lime green
  };

  // Style for GeoJSON polygons
  const style = (feature) => {
    const districtName = feature.properties?.NAME_3 || feature.properties?.NAME_2 || feature.properties?.name || feature.properties?.DISTRICT;
    const risk = riskData[districtName] || 0;
    return {
      fillColor: getColorByRisk(risk),
      weight: 1.5,
      opacity: 0.8,
      color: '#ffffff',
      fillOpacity: 0.7,
    };
  };

  // Style for flood overlay polygons
  const floodOverlayStyle = {
    color: '#00aaff',
    weight: 3,
    fillColor: '#00aaff',
    fillOpacity: 0.8,
    dashArray: '5,5',
  };

  // Style for seismic overlay lines
  const seismicOverlayStyle = {
    color: '#ff4444',
    weight: 5,
    opacity: 1,
  };

  // Handle click on a district (map)
  const onEachFeature = (feature, layer) => {
    const districtName = feature.properties?.NAME_3 || feature.properties?.NAME_2 || feature.properties?.name || feature.properties?.DISTRICT;
    const risk = riskData[districtName] || 0;

    // Tooltip on hover
    layer.bindTooltip(districtName, { sticky: true, className: 'font-semibold text-sm' });

    // Optional popup
    layer.bindPopup(`
      <b>${districtName}</b><br/>
      Risk: ${risk}/100
    `);

    // Click -> update side panel
    layer.on('click', () => {
      const details = fullLocationData[districtName] || {
        name: districtName,
        riskScore: risk,
        floodProne: 'Unknown',
        seismicZone: 'Unknown',
        type: 'district'
      };
      setSelectedDistrict(details);
    });
  };

  // Handle dropdown selection
  const handleDropdownChange = (e) => {
    const districtName = e.target.value;
    if (!districtName) {
      setSelectedDistrict(null);
      return;
    }
    const details = fullLocationData[districtName];
    if (details) {
      setSelectedDistrict(details);
    } else {
      setSelectedDistrict({
        name: districtName,
        riskScore: riskData[districtName] || 0,
        floodProne: 'Unknown',
        seismicZone: 'Unknown',
        type: 'district'
      });
    }
  };

  if (loading) return <div className="h-96 flex items-center justify-center">Loading map...</div>;

  return (
    <div className="relative">
      {/* Controls: dropdown + overlay toggles */}
      <div className="mb-4 flex flex-wrap gap-4 items-center">
        <select
          onChange={handleDropdownChange}
          className="w-full md:w-80 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
          defaultValue=""
        >
          <option value="">Select a district...</option>
          {locationsList.map(loc => (
            <option key={loc._id} value={loc.name}>{loc.name}</option>
          ))}
        </select>

        <label className="flex items-center space-x-2 bg-white px-3 py-2 rounded shadow">
          <input
            type="checkbox"
            checked={showFloodOverlay}
            onChange={(e) => setShowFloodOverlay(e.target.checked)}
            className="rounded border-gray-300"
          />
          <span className="text-sm">🌊 Flood‑prone areas</span>
        </label>
        <label className="flex items-center space-x-2 bg-white px-3 py-2 rounded shadow">
          <input
            type="checkbox"
            checked={showSeismicOverlay}
            onChange={(e) => setShowSeismicOverlay(e.target.checked)}
            className="rounded border-gray-300"
          />
          <span className="text-sm">⚠️ Seismic fault lines</span>
        </label>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <MapContainer
            center={[23.685, 90.356]}
            zoom={7}
            style={{ height: '500px', width: '100%' }}
            className="rounded-xl shadow-md"
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {/* District boundaries */}
            {geoJsonData && (
              <GeoJSON
                data={geoJsonData}
                style={style}
                onEachFeature={onEachFeature}
              />
            )}
            {/* Flood overlay */}
            {showFloodOverlay && floodOverlayData && (
              <GeoJSON
                data={floodOverlayData}
                style={floodOverlayStyle}
              />
            )}
            {/* Seismic overlay */}
            {showSeismicOverlay && seismicOverlayData && (
              <GeoJSON
                data={seismicOverlayData}
                style={seismicOverlayStyle}
              />
            )}
          </MapContainer>
        </div>
        <div>
          <DistrictDetails district={selectedDistrict} />
          {!selectedDistrict && (
            <div className="bg-gray-50 p-4 rounded-lg text-center text-gray-500">
              Click on a district or select from dropdown to see details
            </div>
          )}
        </div>
      </div>

      {/* Legend (updated with overlay indicators) */}
      <div className="absolute bottom-4 left-4 bg-white p-3 rounded-md shadow-md z-[1000] text-sm">
        <h4 className="font-semibold mb-1">Risk Level</h4>
        <div className="flex items-center mb-1">
          <div className="w-4 h-4 rounded mr-2" style={{ backgroundColor: '#32cd32' }}></div>
          <span>Low (0-39)</span>
        </div>
        <div className="flex items-center mb-1">
          <div className="w-4 h-4 rounded mr-2" style={{ backgroundColor: '#ff8c00' }}></div>
          <span>Medium (40-69)</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 rounded mr-2" style={{ backgroundColor: '#ff2a2a' }}></div>
          <span>High (70-100)</span>
        </div>
        {showFloodOverlay && (
          <div className="mt-2 pt-2 border-t">
            <div className="w-8 h-0 border-t-2 border-blue-500 border-dashed"></div>
            <span className="text-xs">Flood‑prone area</span>
          </div>
        )}
        {showSeismicOverlay && (
          <div className="mt-1">
            <div className="w-8 h-0 border-t-2 border-red-500"></div>
            <span className="text-xs">Seismic fault line</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default RiskMap;