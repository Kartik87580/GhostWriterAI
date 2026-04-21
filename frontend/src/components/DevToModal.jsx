import React, { useState, useEffect } from 'react';
import { X, ExternalLink, Key, Eye, EyeOff, CheckCircle2, Loader2 } from 'lucide-react';

const STORAGE_KEY = 'devto_api_key';

/**
 * DevToModal — handles the full "Publish to DEV.IO" flow:
 *  1. If API key already saved → confirm and publish immediately
 *  2. If not → ask for the key, optionally save it, then publish
 *
 * Props:
 *  - blog        : the blog object { id, topic, ... }
 *  - onClose     : called when modal is dismissed
 *  - onPublish   : async (apiKey) → called with the resolved key to do the publish
 */
export default function DevToModal({ blog, onClose, onPublish }) {
    const [step, setStep] = useState('ask');   // 'ask' | 'key-input'
    const [apiKey, setApiKey] = useState('');
    const [showKey, setShowKey] = useState(false);
    const [saveKey, setSaveKey] = useState(true);
    const [publishing, setPublishing] = useState(false);
    const [error, setError] = useState('');

    const savedKey = localStorage.getItem(STORAGE_KEY);

    // If we already have a saved key, skip straight to the confirmation step
    useEffect(() => {
        if (savedKey) setStep('confirm');
        else setStep('ask');
    }, [savedKey]);

    const handlePublish = async (keyToUse) => {
        setError('');
        setPublishing(true);
        try {
            if (saveKey && keyToUse) {
                localStorage.setItem(STORAGE_KEY, keyToUse.trim());
            }
            await onPublish(keyToUse.trim());
            onClose();
        } catch (err) {
            setError(err.response?.data?.detail || 'Publishing failed. Check your API key and try again.');
        } finally {
            setPublishing(false);
        }
    };

    const handleClearKey = () => {
        localStorage.removeItem(STORAGE_KEY);
        setStep('key-input');
    };

    return (
        /* Backdrop */
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            {/* Blur overlay */}
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" />

            {/* Panel */}
            <div className="relative z-10 w-full max-w-md glass-card rounded-2xl border border-white/10 shadow-2xl shadow-purple-900/40 overflow-hidden">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/5">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-fuchsia-500 to-purple-600 flex items-center justify-center">
                            <ExternalLink size={16} className="text-white" />
                        </div>
                        <span className="font-semibold text-white text-sm">Publish to DEV.IO</span>
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                        <X size={18} />
                    </button>
                </div>

                {/* ── STEP: ask ── */}
                {step === 'ask' && (
                    <div className="p-6 space-y-4">
                        <div className="text-center space-y-2">
                            <div className="text-4xl mb-2">🚀</div>
                            <h3 className="text-white font-bold text-lg">One-click publish!</h3>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                Would you like to publish <span className="text-white font-medium">"{blog.topic}"</span> directly to your DEV.IO profile?
                            </p>
                        </div>
                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={onClose}
                                className="flex-1 py-2.5 rounded-xl text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 transition-all text-sm font-medium"
                            >
                                Maybe later
                            </button>
                            <button
                                onClick={() => setStep('key-input')}
                                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 text-white text-sm font-semibold transition-all shadow-md shadow-purple-500/20"
                            >
                                Yes, let's go! →
                            </button>
                        </div>
                    </div>
                )}

                {/* ── STEP: key-input ── */}
                {step === 'key-input' && (
                    <div className="p-6 space-y-5">
                        <div className="space-y-1">
                            <h3 className="text-white font-bold text-base">Enter your DEV.IO API Key</h3>
                            <p className="text-slate-400 text-xs leading-relaxed">
                                Get your key at{' '}
                                <a
                                    href="https://dev.to/settings/extensions"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-purple-400 hover:underline"
                                >
                                    dev.to/settings/extensions
                                </a>{' '}
                                → "DEV Community API Keys".
                            </p>
                        </div>

                        {/* Key input */}
                        <div className="relative">
                            <Key size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                            <input
                                type={showKey ? 'text' : 'password'}
                                value={apiKey}
                                onChange={(e) => { setApiKey(e.target.value); setError(''); }}
                                placeholder="Paste your DEV.IO API key..."
                                className="w-full bg-slate-900/60 border border-slate-700 focus:border-purple-500/70 rounded-xl pl-9 pr-10 py-3 text-white text-sm placeholder-slate-500 focus:outline-none transition-all"
                            />
                            <button
                                type="button"
                                onClick={() => setShowKey(!showKey)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                            >
                                {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>

                        {/* Save toggle */}
                        <label className="flex items-center gap-3 cursor-pointer select-none group">
                            <div
                                onClick={() => setSaveKey(!saveKey)}
                                className={`w-10 h-5 rounded-full transition-all duration-200 flex items-center px-0.5 ${saveKey ? 'bg-purple-600' : 'bg-slate-700'}`}
                            >
                                <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${saveKey ? 'translate-x-5' : 'translate-x-0'}`} />
                            </div>
                            <span className="text-slate-300 text-sm group-hover:text-white transition-colors">
                                Remember my key (stored in browser only)
                            </span>
                        </label>

                        {/* Error */}
                        {error && (
                            <div className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                                {error}
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button
                                onClick={onClose}
                                className="flex-1 py-2.5 rounded-xl text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 transition-all text-sm font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handlePublish(apiKey)}
                                disabled={publishing || !apiKey.trim()}
                                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold transition-all shadow-md"
                            >
                                {publishing ? <Loader2 size={15} className="animate-spin" /> : <ExternalLink size={15} />}
                                {publishing ? 'Publishing...' : 'Publish Now'}
                            </button>
                        </div>
                    </div>
                )}

                {/* ── STEP: confirm (key already saved) ── */}
                {step === 'confirm' && (
                    <div className="p-6 space-y-5">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-green-400 text-sm font-medium">
                                <CheckCircle2 size={16} />
                                <span>API key saved</span>
                            </div>
                            <h3 className="text-white font-bold text-base">
                                Publish "<span className="text-purple-300">{blog.topic}</span>" to DEV.IO?
                            </h3>
                            <p className="text-slate-400 text-xs">
                                Using your saved DEV.IO API key.{' '}
                                <button onClick={handleClearKey} className="text-purple-400 hover:underline">
                                    Use a different key
                                </button>
                            </p>
                        </div>

                        {error && (
                            <div className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                                {error}
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button
                                onClick={onClose}
                                className="flex-1 py-2.5 rounded-xl text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 transition-all text-sm font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handlePublish(savedKey)}
                                disabled={publishing}
                                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 disabled:opacity-50 text-white text-sm font-semibold transition-all shadow-md"
                            >
                                {publishing ? <Loader2 size={15} className="animate-spin" /> : <ExternalLink size={15} />}
                                {publishing ? 'Publishing...' : 'Publish Now'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
