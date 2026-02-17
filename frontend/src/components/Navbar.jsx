import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { PencilLine, History, Sparkles } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
    return twMerge(clsx(inputs));
}

export default function Navbar() {
    const location = useLocation();

    const navItems = [
        { path: '/', label: 'Writer', icon: PencilLine },
        { path: '/history', label: 'History', icon: History },
    ];

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center p-6 bg-gradient-to-b from-slate-950/80 to-transparent backdrop-blur-sm">
            <div className="flex items-center gap-1 p-1 rounded-full glass-card">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={cn(
                                "flex items-center gap-2 px-6 py-2 rounded-full transition-all duration-300",
                                isActive
                                    ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/30"
                                    : "text-slate-400 hover:text-white hover:bg-white/5"
                            )}
                        >
                            <Icon size={18} />
                            <span className="text-sm font-medium">{item.label}</span>
                        </Link>
                    );
                })}
            </div>

            <div className="absolute left-10 top-8 flex items-center gap-2 text-white font-bold text-xl tracking-tight hidden lg:flex">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg">
                    <Sparkles size={20} />
                </div>
                <span>GhostWriter<span className="text-purple-500">AI</span></span>
            </div>
        </nav>
    );
}
