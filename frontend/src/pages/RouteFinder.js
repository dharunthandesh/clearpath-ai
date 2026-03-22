import React, { useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, Polyline, useMap } from 'react-leaflet';
import { Navigation, MapPin, Clock, AlertTriangle, Loader, Route } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

/* ── Mock data ── */
const LOCATIONS = [
    { label: 'Majestic Bus Stand', lat: 12.9767, lng: 77.5713 },
    { label: 'Koramangala 5th Block', lat: 12.9352, lng: 77.6245 },
    { label: 'Hebbal Flyover', lat: 13.0358, lng: 77.5970 },
    { label: 'Indiranagar 100ft Road', lat: 12.9784, lng: 77.6408 },
    { label: 'Whitefield ITPL', lat: 12.9839, lng: 77.7285 },
    { label: 'Silk Board Junction', lat: 12.9176, lng: 77.6237 },
    { label: 'MG Road Metro', lat: 12.9755, lng: 77.6073 },
    { label: 'Jayanagar 4th Block', lat: 12.9302, lng: 77.5838 },
];

function generateRoute(start, end) {
    const midLat = (start.lat + end.lat) / 2 + (Math.random() - 0.5) * 0.02;
    const midLng = (start.lng + end.lng) / 2 + (Math.random() - 0.5) * 0.02;
    return [
        [start.lat, start.lng],
        [midLat, midLng],
        [end.lat, end.lng],
    ];
}

function generateObstacles(start, end) {
    const count = Math.floor(Math.random() * 3) + 1;
    const obstacles = [];
    for (let i = 0; i < count; i++) {
        const t = (i + 1) / (count + 1);
        obstacles.push({
            id: i,
            lat: start.lat + (end.lat - start.lat) * t + (Math.random() - 0.5) * 0.01,
            lng: start.lng + (end.lng - start.lng) * t + (Math.random() - 0.5) * 0.01,
            severity: ['yellow', 'red', 'yellow'][i % 3],
            type: ['Illegal Parking', 'Construction Zone', 'Vendor Stall', 'Garbage Truck'][Math.floor(Math.random() * 4)],
        });
    }
    return obstacles;
}

const SEV_COLOR = { red: '#EF4444', yellow: '#F59E0B', green: '#10B981' };

function FitBounds({ bounds }) {
    const map = useMap();
    React.useEffect(() => {
        if (bounds) {
            map.fitBounds(bounds, { padding: [40, 40] });
        }
    }, [map, bounds]);
    return null;
}

export default function RouteFinder() {
    const [startIdx, setStartIdx] = useState('');
    const [endIdx, setEndIdx] = useState('');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showAlt, setShowAlt] = useState(false);

    function handleFind(e) {
        e.preventDefault();
        if (startIdx === '' || endIdx === '' || startIdx === endIdx) return;
        setLoading(true);
        setResult(null);

        setTimeout(() => {
            const start = LOCATIONS[startIdx];
            const end = LOCATIONS[endIdx];
            const routePoints = generateRoute(start, end);
            const altPoints = generateRoute(start, end);
            const obstacles = generateObstacles(start, end);
            const distance = ((Math.random() * 5 + 3)).toFixed(1);
            const eta = (distance / 40 * 60 + obstacles.length * 1.5).toFixed(1);
            const altEta = (Number(eta) + 2.5 + Math.random() * 2).toFixed(1);
            setResult({ start, end, routePoints, altPoints, obstacles, distance, eta, altEta });
            setLoading(false);
        }, 1800);
    }

    const bounds = result
        ? [
            [result.start.lat, result.start.lng],
            [result.end.lat, result.end.lng],
            ...result.routePoints,
        ]
        : null;

    return (
        <div className="min-h-screen bg-bglight">
            {/* Header */}
            <div className="bg-gradient-to-r from-teal to-teal-600 py-8 px-6">
                <div className="max-w-7xl mx-auto text-white">
                    <h1 className="text-2xl font-bold flex items-center gap-2 mb-1">
                        <Navigation size={22} />
                        Emergency Route Finder
                    </h1>
                    <p className="text-white/70 text-sm">
                        Calculate the safest, fastest route considering live obstructions
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
                <div className="grid lg:grid-cols-4 gap-5">
                    {/* Controls */}
                    <div className="lg:col-span-1 space-y-4">
                        <div className="card">
                            <h3 className="font-semibold text-gray-700 text-sm mb-4 flex items-center gap-2">
                                <Route size={15} className="text-teal" />
                                Route Inputs
                            </h3>

                            <form onSubmit={handleFind} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                                        <MapPin size={11} className="inline mr-1 text-green-500" />
                                        Start Location
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={startIdx}
                                            onChange={e => setStartIdx(e.target.value)}
                                            required
                                            className="select-field pr-8 text-xs"
                                        >
                                            <option value="">Select start...</option>
                                            {LOCATIONS.map((loc, i) => (
                                                <option key={i} value={i}>{loc.label}</option>
                                            ))}
                                        </select>
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 text-xs">▾</div>
                                    </div>
                                </div>

                                <div className="flex justify-center">
                                    <div className="w-px h-5 bg-gray-200" />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                                        <MapPin size={11} className="inline mr-1 text-red-500" />
                                        Destination
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={endIdx}
                                            onChange={e => setEndIdx(e.target.value)}
                                            required
                                            className="select-field pr-8 text-xs"
                                        >
                                            <option value="">Select destination...</option>
                                            {LOCATIONS.map((loc, i) => (
                                                <option key={i} value={i}>{loc.label}</option>
                                            ))}
                                        </select>
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 text-xs">▾</div>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading || startIdx === '' || endIdx === ''}
                                    className="btn-teal w-full justify-center text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <><Loader size={14} className="animate-spin" /> Analyzing...</>
                                    ) : (
                                        <><Navigation size={14} /> Find Safe Route</>
                                    )}
                                </button>
                            </form>
                        </div>

                        {/* Results panel */}
                        {result && (
                            <div className="card animate-slide-up space-y-4">
                                {/* ETA */}
                                <div className="bg-teal/5 border border-teal/20 rounded-xl p-4">
                                    <div className="text-xs text-teal font-bold mb-2 flex items-center gap-1.5">
                                        <Clock size={12} /> Primary Route
                                    </div>
                                    <div className="text-2xl font-black text-gray-800">{result.eta} min</div>
                                    <div className="text-xs text-gray-500 mt-0.5">{result.distance} km via optimal path</div>
                                </div>

                                {/* Obstacles */}
                                <div>
                                    <div className="text-xs font-semibold text-gray-600 mb-2 flex items-center gap-1.5">
                                        <AlertTriangle size={12} className="text-orange-500" />
                                        {result.obstacles.length} Obstacle{result.obstacles.length !== 1 ? 's' : ''} on Route
                                    </div>
                                    <div className="space-y-1.5">
                                        {result.obstacles.map(obs => (
                                            <div key={obs.id} className="flex items-center gap-2 text-xs p-2 rounded-lg bg-gray-50">
                                                <span
                                                    className="w-2 h-2 rounded-full flex-shrink-0"
                                                    style={{ backgroundColor: SEV_COLOR[obs.severity] }}
                                                />
                                                <span className="text-gray-600 truncate">{obs.type}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Alternative */}
                                <button
                                    onClick={() => setShowAlt(!showAlt)}
                                    className={`w-full text-xs py-2.5 px-4 rounded-xl border font-medium flex items-center justify-center gap-2 transition-all ${showAlt
                                            ? 'bg-primary text-white border-primary'
                                            : 'border-gray-200 text-gray-600 hover:border-primary/30 hover:bg-primary/5'
                                        }`}
                                >
                                    <Route size={13} />
                                    {showAlt ? 'Hide' : 'Show'} Alternative Route
                                    {!showAlt && <span className="ml-auto bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded-full text-xs">+{(result.altEta - result.eta).toFixed(1)} min</span>}
                                </button>

                                {showAlt && (
                                    <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 animate-slide-up">
                                        <div className="text-xs text-orange-600 font-bold mb-1">Alternative Route</div>
                                        <div className="text-xl font-black text-gray-800">{result.altEta} min</div>
                                        <div className="text-xs text-gray-500 mt-0.5">Longer path, {result.obstacles.filter(o => o.severity === 'red').length} fewer red obstructions</div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Map */}
                    <div className="lg:col-span-3">
                        <div className="map-container h-[600px]">
                            <MapContainer
                                center={[12.9716, 77.5946]}
                                zoom={12}
                                style={{ height: '100%', width: '100%', borderRadius: '1rem' }}
                                zoomControl={true}
                            >
                                <TileLayer
                                    attribution='&copy; OpenStreetMap contributors'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />
                                {bounds && <FitBounds bounds={bounds} />}

                                {result && (
                                    <>
                                        {/* Primary route */}
                                        <Polyline
                                            positions={result.routePoints}
                                            pathOptions={{ color: '#14B8A6', weight: 5, opacity: 0.9, dashArray: null }}
                                        />

                                        {/* Alt route */}
                                        {showAlt && (
                                            <Polyline
                                                positions={result.altPoints}
                                                pathOptions={{ color: '#F97316', weight: 4, opacity: 0.7, dashArray: '10, 6' }}
                                            />
                                        )}

                                        {/* Start marker */}
                                        <CircleMarker
                                            center={[result.start.lat, result.start.lng]}
                                            radius={12}
                                            pathOptions={{ color: '#10B981', fillColor: '#6EE7B7', fillOpacity: 0.9, weight: 3 }}
                                        >
                                            <Popup>
                                                <strong>🟢 Start</strong><br />{result.start.label}
                                            </Popup>
                                        </CircleMarker>

                                        {/* End marker */}
                                        <CircleMarker
                                            center={[result.end.lat, result.end.lng]}
                                            radius={12}
                                            pathOptions={{ color: '#EF4444', fillColor: '#FCA5A5', fillOpacity: 0.9, weight: 3 }}
                                        >
                                            <Popup>
                                                <strong>🔴 Destination</strong><br />{result.end.label}
                                            </Popup>
                                        </CircleMarker>

                                        {/* Obstacles */}
                                        {result.obstacles.map(obs => (
                                            <CircleMarker
                                                key={obs.id}
                                                center={[obs.lat, obs.lng]}
                                                radius={9}
                                                pathOptions={{
                                                    color: SEV_COLOR[obs.severity],
                                                    fillColor: SEV_COLOR[obs.severity],
                                                    fillOpacity: 0.8,
                                                    weight: 2,
                                                }}
                                            >
                                                <Popup>
                                                    <strong>⚠️ {obs.type}</strong>
                                                    <br />
                                                    <span style={{ color: SEV_COLOR[obs.severity] }}>
                                                        {obs.severity === 'red' ? 'Severely Blocked' : 'Moderately Blocked'}
                                                    </span>
                                                </Popup>
                                            </CircleMarker>
                                        ))}
                                    </>
                                )}

                                {/* Default all locations */}
                                {!result && LOCATIONS.map((loc, i) => (
                                    <CircleMarker
                                        key={i}
                                        center={[loc.lat, loc.lng]}
                                        radius={7}
                                        pathOptions={{ color: '#1E3A8A', fillColor: '#7598DD', fillOpacity: 0.7, weight: 2 }}
                                    >
                                        <Popup>{loc.label}</Popup>
                                    </CircleMarker>
                                ))}
                            </MapContainer>
                        </div>

                        {/* Route legend */}
                        {result && (
                            <div className="flex flex-wrap gap-4 mt-3 px-1 animate-fade-in">
                                <div className="flex items-center gap-2 text-xs text-gray-600">
                                    <div className="w-6 h-1 bg-teal rounded" /> Primary Route
                                </div>
                                {showAlt && (
                                    <div className="flex items-center gap-2 text-xs text-gray-600">
                                        <div className="w-6 h-1 bg-orange-500 rounded border-b border-dashed" /> Alternative Route
                                    </div>
                                )}
                                <div className="flex items-center gap-2 text-xs text-gray-600">
                                    <div className="w-3 h-3 rounded-full bg-yellow-400" /> Moderate Obstruction
                                </div>
                                <div className="flex items-center gap-2 text-xs text-gray-600">
                                    <div className="w-3 h-3 rounded-full bg-red-500" /> Blocked
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
