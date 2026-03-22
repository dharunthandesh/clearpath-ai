import React, { useState } from 'react';
import {
    BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
    XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, Legend
} from 'recharts';
import {
    AlertTriangle, TrendingUp, MapPin, Clock, Shield,
    ArrowUp, ArrowDown, Activity, Zap, Eye, Filter
} from 'lucide-react';

/* ── Mock data ── */
const HOURLY_DATA = [
    { hour: '6AM', count: 12 }, { hour: '7AM', count: 38 }, { hour: '8AM', count: 72 },
    { hour: '9AM', count: 85 }, { hour: '10AM', count: 55 }, { hour: '11AM', count: 43 },
    { hour: '12PM', count: 62 }, { hour: '1PM', count: 44 }, { hour: '2PM', count: 39 },
    { hour: '3PM', count: 47 }, { hour: '4PM', count: 58 }, { hour: '5PM', count: 91 },
    { hour: '6PM', count: 78 }, { hour: '7PM', count: 51 }, { hour: '8PM', count: 32 },
];

const WEEKLY_DATA = [
    { day: 'Mon', reported: 142, resolved: 118 },
    { day: 'Tue', reported: 165, resolved: 145 },
    { day: 'Wed', reported: 129, resolved: 110 },
    { day: 'Thu', reported: 198, resolved: 167 },
    { day: 'Fri', reported: 235, resolved: 188 },
    { day: 'Sat', reported: 180, resolved: 155 },
    { day: 'Sun', reported: 97, resolved: 90 },
];

const TYPE_DATA = [
    { name: 'Illegal Parking', value: 38, color: '#1E3A8A' },
    { name: 'Construction', value: 25, color: '#14B8A6' },
    { name: 'Vendor Encroachment', value: 20, color: '#F97316' },
    { name: 'Garbage Truck', value: 17, color: '#8B5CF6' },
];

const HIGH_RISK_ZONES = [
    { rank: 1, zone: 'MG Road Corridor', count: 142, trend: 12, severity: 'red' },
    { rank: 2, zone: 'Hebbal Junction', count: 118, trend: -5, severity: 'red' },
    { rank: 3, zone: 'Silk Board Signal', count: 97, trend: 8, severity: 'yellow' },
    { rank: 4, zone: 'Indiranagar 100ft', count: 85, trend: 3, severity: 'yellow' },
    { rank: 5, zone: 'Koramangala BDA', count: 71, trend: -11, severity: 'green' },
];

const BLOCKED_STREETS = [
    { street: 'MG Road', count: 34, pct: 85 },
    { street: 'Residency Road', count: 28, pct: 70 },
    { street: 'Brigade Road', count: 22, pct: 55 },
    { street: 'Outer Ring Road', count: 19, pct: 47 },
    { street: 'Hosur Road', count: 16, pct: 40 },
];

const RECENT_ALERTS = [
    { id: 1, type: 'Illegal Parking', location: 'MG Road Sec 4', time: '2 min ago', severity: 'red', reporter: 'AI' },
    { id: 2, type: 'Garbage Truck', location: 'Indiranagar 100ft', time: '5 min ago', severity: 'red', reporter: 'AI' },
    { id: 3, type: 'Construction', location: 'Residency Road', time: '12 min ago', severity: 'yellow', reporter: 'Officer' },
    { id: 4, type: 'Vendor Stall', location: 'Brigade Road', time: '25 min ago', severity: 'yellow', reporter: 'Citizen' },
    { id: 5, type: 'Road Blockage', location: 'Haines Road', time: '48 min ago', severity: 'yellow', reporter: 'Citizen' },
];

/* ── Stat Card ── */
function StatCard({ icon: Icon, label, value, sub, change, color, accent }) {
    const positive = change >= 0;
    return (
        <div className="card-stat">
            <div className={`absolute top-0 right-0 w-32 h-32 ${accent} rounded-full -translate-y-1/2 translate-x-1/2 opacity-10 pointer-events-none`} />
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color} mb-4`}>
                <Icon size={20} className="text-white" />
            </div>
            <div className="text-2xl font-black text-gray-800 mb-1">{value}</div>
            <div className="text-xs text-gray-500 mb-3">{label}</div>
            <div className={`flex items-center gap-1 text-xs font-semibold ${positive ? 'text-red-500' : 'text-green-500'}`}>
                {positive ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                {Math.abs(change)}% vs last week
            </div>
            {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
        </div>
    );
}

/* ── Custom tooltip ── */
function CustomTooltip({ active, payload, label }) {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white border border-gray-100 rounded-xl shadow-card px-4 py-3 text-xs">
                <div className="font-semibold text-gray-700 mb-1">{label}</div>
                {payload.map((p, i) => (
                    <div key={i} className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                        <span className="text-gray-500">{p.name}: </span>
                        <span className="font-semibold">{p.value}</span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
}

export default function Dashboard() {
    const [activeTab, setActiveTab] = useState('overview');

    return (
        <div className="min-h-screen bg-bglight">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary via-primary-600 to-teal-600 py-8 px-6">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="text-white">
                        <h1 className="text-2xl font-bold flex items-center gap-2 mb-1">
                            <Activity size={22} />
                            Smart City Dashboard
                        </h1>
                        <p className="text-white/70 text-sm">Admin analytics & real-time obstruction intelligence</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 text-white/70 text-xs">
                            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                            Live Data · {new Date().toLocaleTimeString()}
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">

                {/* KPI cards */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        icon={AlertTriangle} label="Total Obstructions Today" value="1,284"
                        sub="Across 34 zones" change={8.4} color="bg-orange-500" accent="bg-orange-400"
                    />
                    <StatCard
                        icon={Shield} label="Routes Cleared" value="1,091"
                        sub="85% resolution rate" change={-4.2} color="bg-primary" accent="bg-primary-400"
                    />
                    <StatCard
                        icon={Clock} label="Avg Response Time" value="4.8 min"
                        sub="Down from 7.2 last week" change={-33} color="bg-teal" accent="bg-teal-400"
                    />
                    <StatCard
                        icon={Zap} label="AI Detections" value="892"
                        sub="91% accuracy rate" change={12.1} color="bg-purple-600" accent="bg-purple-400"
                    />
                </div>

                {/* Main charts row */}
                <div className="grid lg:grid-cols-3 gap-5">
                    {/* Hourly peak chart */}
                    <div className="lg:col-span-2 card">
                        <div className="flex items-center justify-between mb-5">
                            <div>
                                <h3 className="font-bold text-gray-800 text-sm">Peak Obstruction Times</h3>
                                <p className="text-gray-400 text-xs mt-0.5">Hourly distribution today</p>
                            </div>
                            <span className="badge badge-blue text-xs">Today</span>
                        </div>
                        <ResponsiveContainer width="100%" height={220}>
                            <AreaChart data={HOURLY_DATA}>
                                <defs>
                                    <linearGradient id="peakGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#1E3A8A" stopOpacity={0.15} />
                                        <stop offset="95%" stopColor="#1E3A8A" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="hour" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} width={28} />
                                <Tooltip content={<CustomTooltip />} />
                                <Area
                                    type="monotone"
                                    dataKey="count"
                                    name="Obstructions"
                                    stroke="#1E3A8A"
                                    strokeWidth={2.5}
                                    fill="url(#peakGrad)"
                                    dot={false}
                                    activeDot={{ r: 5, fill: '#1E3A8A' }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Pie chart */}
                    <div className="card">
                        <h3 className="font-bold text-gray-800 text-sm mb-1">By Obstruction Type</h3>
                        <p className="text-gray-400 text-xs mb-4">Distribution this week</p>
                        <ResponsiveContainer width="100%" height={170}>
                            <PieChart>
                                <Pie
                                    data={TYPE_DATA}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={48}
                                    outerRadius={75}
                                    paddingAngle={4}
                                    dataKey="value"
                                >
                                    {TYPE_DATA.map((entry, i) => (
                                        <Cell key={i} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(v) => [`${v}%`, '']} />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="space-y-2 mt-2">
                            {TYPE_DATA.map(t => (
                                <div key={t.name} className="flex items-center gap-2 text-xs">
                                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: t.color }} />
                                    <span className="text-gray-500 flex-1 truncate">{t.name}</span>
                                    <span className="font-bold text-gray-700">{t.value}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Weekly + High-risk + streets */}
                <div className="grid lg:grid-cols-3 gap-5">
                    {/* Weekly bar */}
                    <div className="lg:col-span-2 card">
                        <div className="flex items-center justify-between mb-5">
                            <div>
                                <h3 className="font-bold text-gray-800 text-sm">Weekly Report vs Resolution</h3>
                                <p className="text-gray-400 text-xs mt-0.5">Last 7 days</p>
                            </div>
                        </div>
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={WEEKLY_DATA} barGap={4}>
                                <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} width={28} />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend iconSize={8} wrapperStyle={{ fontSize: '11px', marginTop: '8px' }} />
                                <Bar dataKey="reported" name="Reported" fill="#1E3A8A" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="resolved" name="Resolved" fill="#14B8A6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* High-risk zones */}
                    <div className="card">
                        <h3 className="font-bold text-gray-800 text-sm mb-1 flex items-center gap-1.5">
                            <Eye size={14} className="text-orange-500" />
                            High-Risk Zones
                        </h3>
                        <p className="text-gray-400 text-xs mb-4">Ranked by report frequency</p>
                        <div className="space-y-3">
                            {HIGH_RISK_ZONES.map(z => (
                                <div key={z.rank} className="flex items-center gap-3">
                                    <div className="text-xs font-black text-gray-300 w-4 text-right">{z.rank}</div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-xs font-semibold text-gray-700 truncate">{z.zone}</div>
                                        <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1">
                                            <div
                                                className={`h-1.5 rounded-full ${z.severity === 'red' ? 'bg-red-500' : z.severity === 'yellow' ? 'bg-yellow-400' : 'bg-green-500'}`}
                                                style={{ width: `${(z.count / 150) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                    <div className="text-xs text-gray-700 font-bold">{z.count}</div>
                                    <div className={`text-xs font-semibold flex items-center ${z.trend > 0 ? 'text-red-500' : 'text-green-500'}`}>
                                        {z.trend > 0 ? <ArrowUp size={10} /> : <ArrowDown size={10} />}
                                        {Math.abs(z.trend)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Bottom row: most blocked + recent alerts */}
                <div className="grid lg:grid-cols-2 gap-5">
                    {/* Most blocked streets */}
                    <div className="card">
                        <h3 className="font-bold text-gray-800 text-sm mb-1 flex items-center gap-1.5">
                            <MapPin size={14} className="text-primary" />
                            Most Blocked Streets
                        </h3>
                        <p className="text-gray-400 text-xs mb-4">This week</p>
                        <div className="space-y-3">
                            {BLOCKED_STREETS.map(s => (
                                <div key={s.street} className="flex items-center gap-3">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-xs font-semibold text-gray-700">{s.street}</span>
                                            <span className="text-xs text-gray-500">{s.count} reports</span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-2">
                                            <div
                                                className="h-2 rounded-full bg-gradient-to-r from-primary to-teal transition-all duration-700"
                                                style={{ width: `${s.pct}%` }}
                                            />
                                        </div>
                                    </div>
                                    <span className="text-xs font-bold text-gray-700 w-10 text-right">{s.pct}%</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recent alerts */}
                    <div className="card">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-gray-800 text-sm flex items-center gap-1.5">
                                <AlertTriangle size={14} className="text-orange-500" />
                                Live Alert Feed
                            </h3>
                            <div className="flex items-center gap-1.5 text-xs text-green-600 font-semibold">
                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                                Live
                            </div>
                        </div>
                        <div className="space-y-2">
                            {RECENT_ALERTS.map(alert => (
                                <div key={alert.id} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition">
                                    <span
                                        className="w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0"
                                        style={{
                                            backgroundColor: alert.severity === 'red' ? '#EF4444' : alert.severity === 'yellow' ? '#F59E0B' : '#10B981'
                                        }}
                                    />
                                    <div className="flex-1 min-w-0">
                                        <div className="text-xs font-semibold text-gray-700 truncate">{alert.type}</div>
                                        <div className="text-xs text-gray-400 truncate flex items-center gap-1">
                                            <MapPin size={9} /> {alert.location}
                                        </div>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                        <div className="text-xs text-gray-400 flex items-center gap-1">
                                            <Clock size={9} /> {alert.time}
                                        </div>
                                        <div className={`text-xs mt-0.5 font-medium ${alert.reporter === 'AI' ? 'text-primary' : 'text-gray-500'}`}>
                                            {alert.reporter}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
