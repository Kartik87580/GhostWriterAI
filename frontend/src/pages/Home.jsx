import React, { useState } from 'react';
import { Sparkles, Copy, Check, FileText, PencilLine, Download, ExternalLink, Rocket } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { blogService } from '../services/api';
import Loader from '../components/Loader';
import DevToModal from '../components/DevToModal';
import toast, { Toaster } from 'react-hot-toast';

export default function Home() {
    const [input, setInput] = useState('');
    const [mode, setMode] = useState('topic'); // 'topic' | 'youtube'
    const [loading, setLoading] = useState(false);
    const [blog, setBlog] = useState(null);
    const [copied, setCopied] = useState(false);

    // DevTo modal state
    const [showDevToModal, setShowDevToModal] = useState(false);
    // After generation, show the "Would you like to publish?" banner
    const [showPublishBanner, setShowPublishBanner] = useState(false);

    const handleGenerate = async (e) => {
        e.preventDefault();
        if (!input.trim()) {
            toast.error(`Please enter a ${mode === 'topic' ? 'topic' : 'YouTube URL'}`);
            return;
        }

        setLoading(true);
        setBlog(null);
        setShowPublishBanner(false);
        try {
            const payload = mode === 'topic' ? { topic: input } : { youtube_url: input };
            const data = await blogService.generateBlog(payload);
            setBlog(data);
            toast.success('Blog generated successfully!');
            // Show the publish prompt banner after a short delay
            setTimeout(() => setShowPublishBanner(true), 800);
        } catch (err) {
            console.error(err);
            toast.error('Failed to generate blog. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        if (!blog) return;
        navigator.clipboard.writeText(blog.content);
        setCopied(true);
        toast.success('Copied to clipboard!');
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = () => {
        if (!blog) return;
        blogService.downloadBlog(blog);
        toast.success('Downloaded as Markdown!');
    };

    // Called by DevToModal with the resolved API key
    const handlePublish = async (apiKey) => {
        const result = await blogService.publishToDevTo(blog.id, apiKey);
        toast.success(
            <span>
                🎉 Published!{' '}
                <a href={result.url} target="_blank" rel="noreferrer" className="underline font-semibold">
                    View on DEV.TO ↗
                </a>
            </span>,
            { duration: 9000 }
        );
        setShowPublishBanner(false);
    };

    return (
        <div className="max-w-5xl mx-auto pt-32 px-6 pb-20">
            <Toaster position="bottom-right" />

            {/* DevTo publish modal */}
            {showDevToModal && blog && (
                <DevToModal
                    blog={blog}
                    onClose={() => setShowDevToModal(false)}
                    onPublish={handlePublish}
                />
            )}

            {/* ── Header ── */}
            <div className="text-center mb-16 space-y-4">
                <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-white mb-6">
                    Write <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500">Brilliant</span> Blogs <br /> in Seconds
                </h1>
                <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                    Expert-level research and writing, powered by advanced AI. Use a topic or a YouTube video.
                </p>
            </div>

            {/* ── Mode Selector ── */}
            <div className="flex justify-center mb-8">
                <div className="flex p-1 bg-white/5 rounded-xl border border-white/10">
                    <button
                        onClick={() => setMode('topic')}
                        className={`flex items-center gap-2 px-6 py-2 rounded-lg transition-all ${mode === 'topic' ? 'bg-white/10 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                    >
                        <PencilLine size={18} />
                        <span className="font-medium">By Topic</span>
                    </button>
                    <button
                        onClick={() => setMode('youtube')}
                        className={`flex items-center gap-2 px-6 py-2 rounded-lg transition-all ${mode === 'youtube' ? 'bg-white/10 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                    >
                        <Sparkles size={18} />
                        <span className="font-medium">By YouTube URL</span>
                    </button>
                </div>
            </div>

            {/* ── Input ── */}
            <div className="max-w-3xl mx-auto mb-16">
                <form onSubmit={handleGenerate} className="flex flex-col sm:flex-row gap-3 p-2 rounded-2xl glass-card">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={mode === 'topic' ? 'What should we write about today?' : 'Paste YouTube video URL here...'}
                        className="flex-1 bg-transparent px-6 py-4 text-white placeholder-slate-500 focus:outline-none text-lg"
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-gradient px-8 py-4 rounded-xl flex items-center justify-center gap-2 min-w-[160px]"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <Sparkles size={18} />
                                <span>Generate</span>
                            </>
                        )}
                    </button>
                </form>
            </div>

            {/* ── Result ── */}
            {loading ? (
                <Loader />
            ) : blog ? (
                <div className="animate-in fade-in slide-in-from-bottom-10 duration-1000 space-y-4">

                    {/* "Would you like to publish?" banner */}
                    {showPublishBanner && (
                        <div className="animate-in fade-in slide-in-from-top-4 duration-500 flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 rounded-2xl border border-fuchsia-500/30 bg-fuchsia-500/10 backdrop-blur-sm">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-fuchsia-500 to-purple-600 flex items-center justify-center shrink-0">
                                    <Rocket size={18} className="text-white" />
                                </div>
                                <div>
                                    <p className="text-white font-semibold text-sm">Would you like to publish this blog to DEV.IO?</p>
                                    <p className="text-slate-400 text-xs">Reach thousands of developers with one click.</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <button
                                    onClick={() => setShowPublishBanner(false)}
                                    className="px-4 py-2 rounded-xl text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 transition-all text-sm"
                                >
                                    Not now
                                </button>
                                <button
                                    onClick={() => { setShowPublishBanner(false); setShowDevToModal(true); }}
                                    className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 text-white text-sm font-semibold transition-all shadow-md shadow-purple-500/20"
                                >
                                    <ExternalLink size={15} />
                                    Yes, publish!
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Blog card */}
                    <div className="glass-card rounded-3xl overflow-hidden">
                        {/* Card header with actions */}
                        <div className="flex items-center justify-between p-5 border-b border-white/10 bg-white/5 flex-wrap gap-3">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400">
                                    <FileText size={20} />
                                </div>
                                <h2 className="font-semibold text-white truncate max-w-xs md:max-w-md">{blog.topic}</h2>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                                {/* Copy */}
                                <button
                                    onClick={copyToClipboard}
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-sm font-medium text-slate-300"
                                >
                                    {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                                    <span>{copied ? 'Copied!' : 'Copy Markdown'}</span>
                                </button>
                                {/* Download */}
                                <button
                                    onClick={handleDownload}
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-sm font-medium text-slate-300"
                                >
                                    <Download size={16} className="text-blue-400" />
                                    <span>Download .md</span>
                                </button>
                                {/* Publish to DEV.IO (opens modal) */}
                                <button
                                    onClick={() => setShowDevToModal(true)}
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 transition-all text-sm font-semibold text-white shadow-md shadow-purple-500/20"
                                >
                                    <ExternalLink size={16} />
                                    <span>Publish to DEV.IO</span>
                                </button>
                            </div>
                        </div>

                        {/* Blog content */}
                        <div className="p-8 lg:p-12 bg-slate-900/50">
                            <div className="prose prose-invert max-w-none">
                                <ReactMarkdown>{blog.content}</ReactMarkdown>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-center py-20 opacity-40">
                    <div className="w-20 h-20 border-2 border-dashed border-slate-700 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <PencilLine size={32} />
                    </div>
                    <p className="text-slate-500">Enter a topic above to begin</p>
                </div>
            )}
        </div>
    );
}
