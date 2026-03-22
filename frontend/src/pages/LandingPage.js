import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
    MapPin, AlertTriangle, Navigation, Brain, Users,
    Clock, ChevronRight, ArrowRight, Shield, BarChart3,
    CheckCircle, Radio, Activity
} from 'lucide-react';

/* ─── Animated counter hook ─── */
function useCounter(target, duration = 2000) {
    const [count, setCount] = React.useState(0);
    const ref = useRef(null);
    useEffect(() => {
        const observer = new IntersectionObserver(([e]) => {
            if (e.isIntersecting) {
                let start = 0;
                const step = target / (duration / 16);
                const timer = setInterval(() => {
                    start = Math.min(start + step, target);
                    setCount(Math.floor(start));
                    if (start >= target) clearInterval(timer);
                }, 16);
                observer.disconnect();
            }
        }, { threshold: 0.3 });
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [target, duration]);
    return { count, ref };
}

/* ─── Stat card ─── */
function StatCard({ value, label, suffix = '', color }) {
    const { count, ref } = useCounter(value);
    return (
        <div ref={ref} className="text-center">
            <div className={`text-4xl font-black ${color}`}>{count}{suffix}</div>
            <div className="text-sm text-gray-300 mt-1 font-medium">{label}</div>
        </div>
    );
}

/* ─── Feature Card ─── */
function FeatureCard({ icon: Icon, title, desc, accent }) {
    return (
        <div className="card group cursor-default">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${accent} group-hover:scale-110 transition-transform duration-300`}>
                <Icon size={22} className="text-white" />
            </div>
            <h3 className="font-bold text-gray-800 text-base mb-2">{title}</h3>
            <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
        </div>
    );
}

/* ─── Problem card ─── */
function ProblemItem({ icon: Icon, title, desc }) {
    return (
        <div className="flex gap-4 items-start p-5 bg-orange-50 rounded-2xl border border-orange-100 hover:border-orange-200 transition-all">
            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <Icon size={18} className="text-white" />
            </div>
            <div>
                <h4 className="font-semibold text-gray-800 text-sm">{title}</h4>
                <p className="text-gray-500 text-xs mt-1 leading-relaxed">{desc}</p>
            </div>
        </div>
    );
}

/* ─── Solution step ─── */
function SolutionStep({ num, title, desc, color }) {
    return (
        <div className="flex gap-4 items-start">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-white text-sm ${color}`}>
                {num}
            </div>
            <div>
                <h4 className="font-semibold text-gray-800 text-sm">{title}</h4>
                <p className="text-gray-500 text-xs mt-1 leading-relaxed">{desc}</p>
            </div>
        </div>
    );
}

export default function LandingPage() {
    return (
        <div className="overflow-x-hidden">

            {/* ── HERO ── */}
            <section className="relative hero-gradient min-h-screen flex items-center overflow-hidden">
                {/* Background ornaments */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-32 -right-32 w-96 h-96 bg-teal/20 rounded-full blur-3xl" />
                    <div className="absolute top-1/2 -left-48 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-primary-300/10 rounded-full blur-2xl" />

                    {/* Grid lines */}
                    <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#grid)" />
                    </svg>

                    {/* Animated dots */}
                    {[...Array(6)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute w-2 h-2 bg-teal/60 rounded-full animate-ping-slow"
                            style={{
                                left: `${15 + i * 14}%`,
                                top: `${20 + (i % 3) * 25}%`,
                                animationDelay: `${i * 0.4}s`,
                            }}
                        />
                    ))}
                </div>

                <div className="relative max-w-7xl mx-auto px-6 py-20 flex flex-col lg:flex-row items-center gap-16">
                    {/* Left copy */}
                    <div className="flex-1 text-white animate-fade-in">
                        <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-4 py-2 rounded-full text-sm font-medium mb-8 backdrop-blur-sm">
                            <Radio size={14} className="text-teal-300 animate-pulse" />
                            <span className="text-white/90">AI-Powered Smart City Platform</span>
                        </div>

                        <h1 className="text-5xl lg:text-7xl font-black leading-tight mb-6">
                            Clear<span className="text-teal-400">Path</span>
                            <span className="block text-2xl lg:text-3xl font-semibold text-white/70 mt-2">AI</span>
                        </h1>

                        <p className="text-xl lg:text-2xl text-white/80 font-light mb-4 leading-snug">
                            AI-powered emergency route accessibility
                            <br className="hidden lg:block" /> for smarter cities.
                        </p>

                        <p className="text-white/60 text-base leading-relaxed mb-10 max-w-lg">
                            Every second counts in an emergency. ClearPath AI detects real-time road obstructions —
                            illegal parking, construction zones, vendor encroachments — and re-routes emergency
                            vehicles before it's too late.
                        </p>

                        <div className="flex flex-wrap gap-4">
                            <Link to="/map" className="btn-teal text-base py-4 px-8 shadow-xl shadow-teal/30">
                                <MapPin size={18} />
                                View Live Map
                                <ChevronRight size={16} />
                            </Link>
                            <Link to="/report" className="btn-orange text-base py-4 px-8 shadow-xl shadow-orange-500/30">
                                <AlertTriangle size={18} />
                                Report Obstruction
                            </Link>
                        </div>

                        {/* Trust badges */}
                        <div className="flex flex-wrap gap-4 mt-10">
                            {['AI Powered', 'Real-time', 'Crowdsourced'].map(badge => (
                                <div key={badge} className="flex items-center gap-1.5 text-white/70 text-sm">
                                    <CheckCircle size={14} className="text-teal-400" />
                                    {badge}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right visual */}
                    <div className="flex-1 flex justify-center animate-slide-up">
                        <div className="relative w-full max-w-md">
                            {/* Main card */}
                            <div className="glass rounded-3xl p-6 shadow-2xl">
                                <div className="flex items-center gap-3 mb-5">
                                    <div className="w-3 h-3 bg-red-400 rounded-full" />
                                    <div className="w-3 h-3 bg-yellow-400 rounded-full" />
                                    <div className="w-3 h-3 bg-green-400 rounded-full" />
                                    <span className="text-white/50 text-xs ml-2 font-mono">clearpath.ai/live</span>
                                </div>

                                {/* Simulated map */}
                                <div className="bg-primary-800/50 rounded-2xl h-48 flex items-center justify-center relative overflow-hidden mb-4">
                                    <svg viewBox="0 0 300 200" className="w-full h-full opacity-40">
                                        <line x1="0" y1="100" x2="300" y2="100" stroke="#14B8A6" strokeWidth="3" strokeDasharray="8,4" />
                                        <line x1="150" y1="0" x2="150" y2="200" stroke="#14B8A6" strokeWidth="2" strokeDasharray="6,4" />
                                        <line x1="0" y1="60" x2="300" y2="130" stroke="#333" strokeWidth="2" strokeDasharray="5,3" />
                                    </svg>

                                    {/* Markers */}
                                    {[
                                        { x: '30%', y: '45%', color: 'bg-red-500', pulse: true },
                                        { x: '60%', y: '55%', color: 'bg-yellow-400', pulse: false },
                                        { x: '75%', y: '30%', color: 'bg-green-400', pulse: false },
                                        { x: '20%', y: '65%', color: 'bg-green-400', pulse: false },
                                    ].map((m, i) => (
                                        <div key={i} className="absolute" style={{ left: m.x, top: m.y }}>
                                            {m.pulse && (
                                                <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-60 scale-150" />
                                            )}
                                            <div className={`w-4 h-4 ${m.color} rounded-full border-2 border-white shadow-lg relative z-10`} />
                                        </div>
                                    ))}

                                    {/* Route line */}
                                    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 300 200">
                                        <path d="M 50 150 Q 120 80 240 80" stroke="#14B8A6" strokeWidth="3" fill="none"
                                            strokeLinecap="round" strokeDasharray="8,4" className="animate-pulse" />
                                    </svg>
                                </div>

                                {/* Alert cards */}
                                {[
                                    { label: 'Obstruction Detected', loc: 'MG Road, Sector 4', type: 'Illegal Parking', color: 'bg-red-500/20 border-red-500/30', dot: 'bg-red-500' },
                                    { label: 'Route Optimized', loc: 'Alternative via NH-7', type: 'ETA: 4.2 min', color: 'bg-teal/20 border-teal/30', dot: 'bg-teal' },
                                ].map((alert, i) => (
                                    <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border ${alert.color} mb-2`}>
                                        <div className={`w-2.5 h-2.5 ${alert.dot} rounded-full flex-shrink-0 ${i === 0 ? 'animate-pulse' : ''}`} />
                                        <div className="flex-1 min-w-0">
                                            <div className="text-white text-xs font-semibold truncate">{alert.label}</div>
                                            <div className="text-white/50 text-xs truncate">{alert.loc} • {alert.type}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Floating chips */}
                            <div className="absolute -top-4 -right-4 bg-teal text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg float">
                                🟢 Route Clear
                            </div>
                            <div className="absolute -bottom-4 -left-4 bg-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg animate-bounce-gentle">
                                🚨 2 Obstructions
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats strip */}
                <div className="absolute bottom-0 left-0 right-0 bg-black/20 backdrop-blur-sm border-t border-white/10">
                    <div className="max-w-7xl mx-auto px-6 py-5 grid grid-cols-2 md:grid-cols-4 gap-6">
                        <StatCard value={1240} suffix="+" label="Obstructions Cleared" color="text-teal-300" />
                        <StatCard value={87} suffix="%" label="Response Time Saved" color="text-orange-300" />
                        <StatCard value={34} suffix="" label="Cities Connected" color="text-blue-300" />
                        <StatCard value={99} suffix="%" label="AI Accuracy" color="text-green-300" />
                    </div>
                </div>
            </section>

            {/* ── PROBLEM ── */}
            <section className="py-24 px-6 bg-white">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-14">
                        <span className="badge bg-orange-100 text-orange-600 mb-4 text-xs px-4 py-1.5 rounded-full font-semibold">
                            The Problem
                        </span>
                        <h2 className="section-title">Emergency vehicles lose precious minutes</h2>
                        <p className="section-subtitle max-w-2xl mx-auto">
                            Traditional navigation systems only analyze traffic data. They cannot detect
                            real-world micro-obstructions that block narrow urban streets every day.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-5">
                        <ProblemItem
                            icon={Clock}
                            title="Delayed Response Times"
                            desc="Every 60-second delay in emergency response increases mortality risk by up to 10%. Obstructions are invisible to standard GPS navigation."
                        />
                        <ProblemItem
                            icon={MapPin}
                            title="Undetected Micro-Obstructions"
                            desc="Illegal parking, construction materials, and vendor stalls are dynamic, short-lived, and unregistered in any existing map database."
                        />
                        <ProblemItem
                            icon={AlertTriangle}
                            title="No Real-Time Data"
                            desc="Current systems react to fixed data — they cannot crowdsource or process live urban obstruction events as they happen."
                        />
                        <ProblemItem
                            icon={Navigation}
                            title="Suboptimal Routing"
                            desc="Emergency operators rely on memory and radio communication rather than data-driven, AI-assisted route recommendations."
                        />
                    </div>
                </div>
            </section>

            {/* ── SOLUTION ── */}
            <section className="py-24 px-6 bg-bglight relative">
                <div className="absolute inset-0 bg-mesh pointer-events-none" />
                <div className="max-w-6xl mx-auto relative">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <span className="badge bg-teal/10 text-teal mb-5 text-xs px-4 py-1.5 rounded-full font-semibold inline-block">
                                The Solution
                            </span>
                            <h2 className="section-title mb-5">ClearPath AI — End-to-end intelligent route clearing</h2>
                            <p className="text-gray-500 text-base leading-relaxed mb-8">
                                ClearPath AI combines computer vision, crowdsourced intelligence, and real-time
                                geospatial analysis to give emergency responders a live, accurate picture of
                                every street — before they drive down it.
                            </p>
                            <div className="space-y-5">
                                <SolutionStep num="01" title="AI Obstruction Detection" color="bg-primary"
                                    desc="Uploaded road images are processed by TensorFlow models to identify specific obstruction types in under 2 seconds." />
                                <SolutionStep num="02" title="Crowdsourced Reporting" color="bg-teal"
                                    desc="Citizens and field officers report real-time obstructions via mobile-friendly forms with GPS auto-detection." />
                                <SolutionStep num="03" title="Accessibility Map" color="bg-orange-500"
                                    desc="A live-updated Leaflet map shows road status with color-coded markers — green, yellow, and red — across the city." />
                                <SolutionStep num="04" title="Emergency Route Optimization" color="bg-primary-600"
                                    desc="The route engine queries the obstruction database and calculates the safest, fastest alternative path in real time." />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { icon: Brain, label: 'AI Detection', sublabel: 'OpenCV + TensorFlow', color: 'from-primary to-primary-600' },
                                { icon: Users, label: 'Crowdsourced', sublabel: 'Real-time reports', color: 'from-teal to-teal-600' },
                                { icon: MapPin, label: 'Live Map', sublabel: 'GIS + OpenStreetMap', color: 'from-orange-500 to-orange-600' },
                                { icon: Shield, label: 'Route Safety', sublabel: 'Emergency optimized', color: 'from-primary-600 to-teal' },
                            ].map(({ icon: Icon, label, sublabel, color }) => (
                                <div key={label} className={`bg-gradient-to-br ${color} p-6 rounded-2xl text-white shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300`}>
                                    <Icon size={28} className="mb-3 opacity-90" />
                                    <div className="font-bold text-sm">{label}</div>
                                    <div className="text-white/60 text-xs mt-1">{sublabel}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── FEATURES ── */}
            <section className="py-24 px-6 bg-white">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-14">
                        <span className="badge bg-primary/10 text-primary mb-4 text-xs px-4 py-1.5 rounded-full font-semibold inline-block">
                            Features
                        </span>
                        <h2 className="section-title">Everything a smart city needs</h2>
                        <p className="section-subtitle max-w-xl mx-auto">
                            Designed for emergency responders, city administrators, and civic-minded citizens.
                        </p>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        <FeatureCard
                            icon={Brain}
                            title="AI Obstruction Detection"
                            desc="Computer vision pipeline classifies road obstructions from uploaded images with high accuracy using OpenCV and TensorFlow."
                            accent="bg-gradient-to-br from-primary to-primary-600"
                        />
                        <FeatureCard
                            icon={Users}
                            title="Crowdsourced Reporting"
                            desc="Empower citizens and field officers to report real-time obstructions with geolocation, image upload, and type classification."
                            accent="bg-gradient-to-br from-teal to-teal-600"
                        />
                        <FeatureCard
                            icon={Navigation}
                            title="Emergency Route Optimizer"
                            desc="Query the live obstruction database and compute the safest accessible route for ambulances, fire trucks, and police."
                            accent="bg-gradient-to-br from-orange-500 to-orange-600"
                        />
                        <FeatureCard
                            icon={BarChart3}
                            title="Smart City Analytics"
                            desc="Admin dashboard with real-time KPIs, peak obstruction times, high-risk zones, and interactive charts for city planners."
                            accent="bg-gradient-to-br from-primary-600 to-teal"
                        />
                    </div>
                </div>
            </section>

            {/* ── CTA Strip ── */}
            <section className="py-20 px-6 bg-gradient-to-r from-primary via-primary-600 to-teal relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=60 height=60 viewBox=0 0 60 60 xmlns=http://www.w3.org/2000/svg%3E%3Cg fill=none fill-rule=evenodd%3E%3Cg fill=%23ffffff fill-opacity=0.05%3E%3Cpath d=M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40" />
                <div className="max-w-4xl mx-auto text-center relative">
                    <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-4 py-1.5 rounded-full text-sm text-white/80 mb-6">
                        <Activity size={14} className="animate-pulse text-teal-300" />
                        Live system active
                    </div>
                    <h2 className="text-3xl lg:text-4xl font-black text-white mb-4">
                        Ready to make your city safer?
                    </h2>
                    <p className="text-white/70 text-lg mb-8 max-w-xl mx-auto">
                        Join the smart city revolution. Report obstructions, view the live map, and help emergency vehicles arrive on time.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Link to="/map" className="btn-secondary text-base py-4 px-8">
                            <MapPin size={18} />
                            View Live Map
                            <ArrowRight size={16} />
                        </Link>
                        <Link to="/report" className="btn-orange text-base py-4 px-8">
                            <AlertTriangle size={18} />
                            Report an Obstruction
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-primary py-10 px-6 text-white/60 text-sm">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="font-semibold text-white">ClearPath AI © 2026</div>
                    <div className="flex gap-6">
                        {['Home', 'City Map', 'Report', 'Route Finder', 'Dashboard'].map(l => (
                            <span key={l} className="hover:text-white cursor-pointer transition-colors">{l}</span>
                        ))}
                    </div>
                </div>
            </footer>
        </div>
    );
}
