import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import { Filter, MapPin, Clock, Camera, RefreshCw, Layers } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

/* ── Mock obstruction data ── */
const MOCK_DATA = [
    { id: 1, lat: 12.9716, lng: 77.5946, type: 'Illegal Parking', severity: 'red', street: 'MG Road, Bangalore', time: '2 min ago', desc: 'Two cars blocking the ambulance lane', img: null, reporter: 'Auto-detected (AI)' },
    { id: 2, lat: 12.9756, lng: 77.5990, type: 'Construction', severity: 'yellow', street: 'Residency Road, Bangalore', time: '12 min ago', desc: 'Construction materials spilling into road', img: null, reporter: 'Field Officer #12' },
    { id: 3, lat: 12.9680, lng: 77.5910, type: 'Vendor Encroachment', severity: 'yellow', street: 'Brigade Road, Bangalore', time: '25 min ago', desc: 'Vegetable vendors occupying half the road', img: null, reporter: 'Citizen Report' },
    { id: 4, lat: 12.9820, lng: 77.6000, type: 'Garbage Truck Blockage', severity: 'red', street: 'Indiranagar 100ft, Bangalore', time: '5 min ago', desc: 'Garbage truck parked blocking 70% of road', img: null, reporter: 'Auto-detected (AI)' },
    { id: 5, lat: 12.9650, lng: 77.6050, type: 'Illegal Parking', severity: 'green', street: 'Koramangala 5th Block', time: '1 hr ago', desc: 'Obstruction cleared by traffic police', img: null, reporter: 'Resolved' },
    { id: 6, lat: 12.9900, lng: 77.5870, type: 'Construction', severity: 'red', street: 'Hebbal Flyover Junction', time: '8 min ago', desc: 'Steel bars and cement bags on left lane', img: null, reporter: 'Field Officer #7' },
    { id: 7, lat: 12.9600, lng: 77.5800, type: 'Vendor Encroachment', severity: 'green', street: 'JP Nagar 3rd Phase', time: '2 hr ago', desc: 'Area cleared — no obstruction', img: null, reporter: 'Patrol Update' },
    { id: 8, lat: 12.9550, lng: 77.6100, type: 'Illegal Parking', severity: 'yellow', street: 'BTM Layout 2nd Stage', time: '35 min ago', desc: 'Truck partially blocking secondary road', img: null, reporter: 'Citizen Report' },
];

const OBSTRUCTION_TYPES = ['All', 'Illegal Parking', 'Construction', 'Vendor Encroachment', 'Garbage Truck Blockage'];

const SEVERITY_CONFIG = {
    red: { color: '#EF4444', fillColor: '#FCA5A5', label: 'Blocked', radius: 14 },
    yellow: { color: '#F59E0B', fillColor: '#FCD34D', label: 'Moderate', radius: 11 },
    green: { color: '#10B981', fillColor: '#6EE7B7', label: 'Clear', radius: 9 },
};

/* ── Map auto-fit ── */
function MapBounds({ data }) {
    const map = useMap();
    useEffect(() => {
        if (data.length > 0) {
            map.setView([12.9716, 77.5946], 13);
        }
    }, [map, data]);
    return null;
}

export default function CityMapPage() {
    const [filter, setFilter] = useState('All');
    const [selected, setSelected] = useState(null);
    const [loading, setLoading] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(new Date());

    const filtered = MOCK_DATA.filter(d => filter === 'All' || d.type === filter);

    const counts = {
        red: MOCK_DATA.filter(d => d.severity === 'red').length,
        yellow: MOCK_DATA.filter(d => d.severity === 'yellow').length,
        green: MOCK_DATA.filter(d => d.severity === 'green').length,
    };

    function handleRefresh() {
        setLoading(true);
        setTimeout(() => {
            setLastUpdated(new Date());
            setLoading(false);
        }, 1200);
    }

    return (
        <div className="min-h-screen bg-bglight">
            {/* Page header */}
            <div className="bg-gradient-to-r from-primary to-primary-600 py-8 px-6">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="text-white">
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <MapPin size={22} />
                            Live Obstruction Map
                        </h1>
                        <p className="text-white/70 text-sm mt-1">
                            Real-time city-wide road accessibility status
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-white/50 text-xs hidden sm:block">
                            Updated: {lastUpdated.toLocaleTimeString()}
                        </span>
                        <button
                            onClick={handleRefresh}
                            className="bg-white/10 border border-white/20 text-white text-sm px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-white/20 transition"
                        >
                            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                            Refresh
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
                {/* Summary chips */}
                <div className="flex flex-wrap gap-3 mb-5">
                    <Chip color="bg-red-100 text-red-700 border-red-200" dot="bg-red-500" label={`${counts.red} Blocked`} />
                    <Chip color="bg-yellow-100 text-yellow-700 border-yellow-200" dot="bg-yellow-500" label={`${counts.yellow} Moderate`} />
                    <Chip color="bg-green-100 text-green-700 border-green-200" dot="bg-green-500" label={`${counts.green} Clear`} />
                    <Chip color="bg-gray-100 text-gray-600 border-gray-200" dot="bg-gray-400" label={`${MOCK_DATA.length} Total`} />
                </div>

                <div className="grid lg:grid-cols-4 gap-5">
                    {/* Sidebar */}
                    <div className="lg:col-span-1 space-y-4">
                        {/* Filter */}
                        <div className="card p-5">
                            <div className="flex items-center gap-2 mb-4 text-gray-700 font-semibold text-sm">
                                <Filter size={15} />
                                Filter by Type
                            </div>
                            <div className="space-y-2">
                                {OBSTRUCTION_TYPES.map(type => (
                                    <button
                                        key={type}
                                        onClick={() => setFilter(type)}
                                        className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${filter === type
                                                ? 'bg-primary text-white shadow-sm'
                                                : 'text-gray-600 hover:bg-gray-50 border border-gray-100'
                                            }`}
                                    >
                                        {type}
                                        {type !== 'All' && (
                                            <span className={`float-right text-xs rounded-full px-1.5 py-0.5 ${filter === type ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                                                }`}>
                                                {MOCK_DATA.filter(d => d.type === type).length}
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Legend */}
                        <div className="card p-5">
                            <div className="flex items-center gap-2 mb-4 text-gray-700 font-semibold text-sm">
                                <Layers size={15} />
                                Legend
                            </div>
                            <div className="space-y-3">
                                {Object.entries(SEVERITY_CONFIG).map(([sev, cfg]) => (
                                    <div key={sev} className="flex items-center gap-3">
                                        <div
                                            className="w-5 h-5 rounded-full border-2 flex-shrink-0"
                                            style={{ backgroundColor: cfg.fillColor, borderColor: cfg.color }}
                                        />
                                        <span className="text-xs text-gray-600">{cfg.label} Road</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Obstruction list */}
                        <div className="card p-5 max-h-72 overflow-y-auto scrollbar-hide">
                            <div className="text-sm font-semibold text-gray-700 mb-3">Recent Reports</div>
                            <div className="space-y-2">
                                {filtered.slice(0, 6).map(obs => (
                                    <button
                                        key={obs.id}
                                        onClick={() => setSelected(obs)}
                                        className={`w-full text-left p-3 rounded-xl border transition-all text-xs ${selected?.id === obs.id
                                                ? 'border-primary/40 bg-primary/5'
                                                : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                                            }`}
                                    >
                                        <div className="flex items-center gap-2 mb-1">
                                            <span
                                                className="w-2 h-2 rounded-full flex-shrink-0"
                                                style={{ backgroundColor: SEVERITY_CONFIG[obs.severity].color }}
                                            />
                                            <span className="font-semibold text-gray-700 truncate">{obs.type}</span>
                                        </div>
                                        <div className="text-gray-400 truncate pl-4">{obs.street}</div>
                                        <div className="text-gray-400 pl-4 mt-0.5 flex items-center gap-1">
                                            <Clock size={10} /> {obs.time}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Map */}
                    <div className="lg:col-span-3">
                        <div className="map-container h-[600px] relative">
                            <MapContainer
                                center={[12.9716, 77.5946]}
                                zoom={13}
                                style={{ height: '100%', width: '100%', borderRadius: '1rem' }}
                                zoomControl={false}
                            >
                                <TileLayer
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />
                                <MapBounds data={filtered} />

                                {filtered.map(obs => {
                                    const cfg = SEVERITY_CONFIG[obs.severity];
                                    return (
                                        <CircleMarker
                                            key={obs.id}
                                            center={[obs.lat, obs.lng]}
                                            radius={cfg.radius}
                                            pathOptions={{
                                                color: cfg.color,
                                                fillColor: cfg.fillColor,
                                                fillOpacity: 0.85,
                                                weight: 2.5,
                                            }}
                                            eventHandlers={{ click: () => setSelected(obs) }}
                                        >
                                            <Popup>
                                                <div className="min-w-[220px]">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span
                                                            className="w-2.5 h-2.5 rounded-full"
                                                            style={{ backgroundColor: cfg.color }}
                                                        />
                                                        <span className="font-bold text-gray-800 text-sm">{obs.type}</span>
                                                        <span
                                                            className="ml-auto text-xs px-2 py-0.5 rounded-full font-semibold"
                                                            style={{ color: cfg.color, backgroundColor: cfg.fillColor + '88' }}
                                                        >
                                                            {cfg.label}
                                                        </span>
                                                    </div>
                                                    <div className="text-gray-600 text-xs mb-1 flex items-center gap-1.5">
                                                        <MapPin size={11} /> {obs.street}
                                                    </div>
                                                    <div className="text-gray-500 text-xs mb-2">{obs.desc}</div>
                                                    <hr className="border-gray-100 my-2" />
                                                    <div className="flex justify-between text-xs text-gray-400">
                                                        <span className="flex items-center gap-1"><Clock size={10} /> {obs.time}</span>
                                                        <span>{obs.reporter}</span>
                                                    </div>
                                                    {obs.img && (
                                                        <div className="mt-2">
                                                            <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                                                                <Camera size={11} /> Photo evidence
                                                            </div>
                                                            <img src={obs.img} alt="obstruction" className="w-full rounded-lg object-cover h-24" />
                                                        </div>
                                                    )}
                                                </div>
                                            </Popup>
                                        </CircleMarker>
                                    );
                                })}
                            </MapContainer>
                        </div>

                        {/* Selected obstruction detail card */}
                        {selected && (
                            <div className="card mt-4 flex items-start gap-4 animate-slide-up">
                                <div
                                    className="w-3 h-3 rounded-full mt-1 flex-shrink-0"
                                    style={{ backgroundColor: SEVERITY_CONFIG[selected.severity].color }}
                                />
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="font-bold text-gray-800 text-sm">{selected.type}</span>
                                        <span className="text-xs text-gray-400 flex items-center gap-1">
                                            <Clock size={11} /> {selected.time}
                                        </span>
                                    </div>
                                    <div className="text-gray-500 text-xs mb-0.5 flex items-center gap-1">
                                        <MapPin size={11} /> {selected.street}
                                    </div>
                                    <p className="text-gray-600 text-xs mt-1">{selected.desc}</p>
                                    <div className="text-gray-400 text-xs mt-1">Reporter: {selected.reporter}</div>
                                </div>
                                <button
                                    onClick={() => setSelected(null)}
                                    className="text-gray-400 hover:text-gray-600 transition text-lg leading-none"
                                >
                                    ×
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function Chip({ color, dot, label }) {
    return (
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-semibold ${color}`}>
            <span className={`w-2 h-2 rounded-full ${dot}`} />
            {label}
        </div>
    );
}
