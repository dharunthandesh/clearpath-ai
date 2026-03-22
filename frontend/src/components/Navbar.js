import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    MapPin, AlertTriangle, Navigation, LayoutDashboard,
    Menu, X, Zap
} from 'lucide-react';

const navItems = [
    { path: '/', label: 'Home', icon: Zap },
    { path: '/map', label: 'City Map', icon: MapPin },
    { path: '/report', label: 'Report', icon: AlertTriangle },
    { path: '/route-finder', label: 'Route Finder', icon: Navigation },
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
];

export default function Navbar() {
    const location = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2.5 group">
                        <div className="w-9 h-9 bg-gradient-to-br from-primary to-teal rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                <path d="M12 2L4 7v5c0 4.97 3.4 9.63 8 10.93C16.6 21.63 20 16.97 20 12V7l-8-5z" fill="white" fillOpacity="0.9" />
                                <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <div>
                            <span className="text-base font-bold text-primary">ClearPath</span>
                            <span className="text-base font-bold text-teal ml-1">AI</span>
                        </div>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-1">
                        {navItems.map(({ path, label, icon: Icon }) => (
                            <Link
                                key={path}
                                to={path}
                                className={location.pathname === path ? 'nav-link-active' : 'nav-link'}
                            >
                                <Icon size={14} className="inline mr-1.5 mb-0.5" />
                                {label}
                            </Link>
                        ))}
                    </div>

                    {/* CTA */}
                    <div className="hidden md:flex items-center gap-3">
                        <Link to="/report" className="btn-orange text-xs py-2 px-4">
                            <AlertTriangle size={14} />
                            Report Now
                        </Link>
                    </div>

                    {/* Mobile menu */}
                    <button
                        className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition"
                        onClick={() => setMenuOpen(!menuOpen)}
                    >
                        {menuOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>
            </div>

            {/* Mobile dropdown */}
            {menuOpen && (
                <div className="md:hidden bg-white border-t border-gray-100 px-4 py-3 space-y-1 shadow-lg animate-fade-in">
                    {navItems.map(({ path, label, icon: Icon }) => (
                        <Link
                            key={path}
                            to={path}
                            onClick={() => setMenuOpen(false)}
                            className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all ${location.pathname === path
                                    ? 'bg-primary/10 text-primary'
                                    : 'text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            <Icon size={16} />
                            {label}
                        </Link>
                    ))}
                </div>
            )}
        </nav>
    );
}
