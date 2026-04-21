import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

export default function PublicNavbar() {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
                    ? 'bg-slate-950/90 backdrop-blur-lg border-b border-white/5 shadow-xl shadow-black/20'
                    : 'bg-transparent'
                }`}
        >
            <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
                {/* Brand */}
                <Link to="/landing" className="flex items-center gap-2 text-white font-bold text-xl tracking-tight">
                    <div className="p-1.5 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg">
                        <Sparkles size={18} />
                    </div>
                    GhostWriter<span className="text-purple-400">AI</span>
                </Link>

                {/* CTA */}
                <div className="flex items-center gap-3">
                    <Link
                        to="/login"
                        className="text-slate-300 hover:text-white text-sm font-medium transition-colors px-4 py-2 rounded-xl hover:bg-white/5"
                    >
                        Sign In
                    </Link>
                    <Link
                        to="/signup"
                        className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-sm font-semibold shadow-md shadow-purple-500/20 transition-all duration-300 hover:scale-105"
                    >
                        Get Started
                    </Link>
                </div>
            </div>
        </nav>
    );
}
