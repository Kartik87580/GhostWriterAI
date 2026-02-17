import React from 'react';

export default function Loader({ message = "Generating your masterpiece..." }) {
    return (
        <div className="flex flex-col items-center justify-center gap-6 py-20 animate-in fade-in duration-700">
            <div className="relative w-20 h-20">
                <div className="absolute inset-0 border-4 border-purple-500/20 rounded-full" />
                <div className="absolute inset-0 border-4 border-t-purple-500 rounded-full animate-spin" />
                <div className="absolute inset-4 border-4 border-blue-500/20 rounded-full" />
                <div className="absolute inset-4 border-4 border-b-blue-500 rounded-full animate-spin-slow" />
            </div>
            <div className="flex flex-col items-center gap-2">
                <p className="text-xl font-medium text-white tracking-wide animate-pulse">{message}</p>
                <p className="text-slate-400 text-sm">Our AI is researching and writing, this may take a few seconds.</p>
            </div>
        </div>
    );
}
