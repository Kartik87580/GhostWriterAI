import React, { useState } from 'react';
import { Sparkles, Send, Copy, Check, FileText, PencilLine } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { blogService } from '../services/api';
import Loader from '../components/Loader';
import toast, { Toaster } from 'react-hot-toast';

export default function Home() {
    const [topic, setTopic] = useState('');
    const [loading, setLoading] = useState(false);
    const [blog, setBlog] = useState(null);
    const [copied, setCopied] = useState(false);

    const handleGenerate = async (e) => {
        e.preventDefault();
        if (!topic.trim()) {
            toast.error('Please enter a topic');
            return;
        }

        setLoading(true);
        setBlog(null);
        try {
            const data = await blogService.generateBlog(topic);
            setBlog(data);
            toast.success('Blog generated successfully!');
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

    return (
        <div className="max-w-5xl mx-auto pt-32 px-6 pb-20">
            <Toaster position="bottom-right" />

            {/* Header Section */}
            <div className="text-center mb-16 space-y-4">
                <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-white mb-6">
                    Write <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500">Brilliant</span> Blogs <br /> in Seconds
                </h1>
                <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                    Expert-level research and writing, powered by advanced AI. Enter a topic and watch the magic happen.
                </p>
            </div>

            {/* Input Section */}
            <div className="max-w-3xl mx-auto mb-16">
                <form onSubmit={handleGenerate} className="flex flex-col sm:flex-row gap-3 p-2 rounded-2xl glass-card">
                    <input
                        type="text"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="What should we write about today?"
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

            {/* Result Section */}
            {loading ? (
                <Loader />
            ) : blog ? (
                <div className="animate-in fade-in slide-in-from-bottom-10 duration-1000">
                    <div className="glass-card rounded-3xl overflow-hidden">
                        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/5">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400">
                                    <FileText size={20} />
                                </div>
                                <h2 className="font-semibold text-white truncate max-w-md">{blog.topic}</h2>
                            </div>
                            <button
                                onClick={copyToClipboard}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-sm font-medium text-slate-300"
                            >
                                {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                                <span>{copied ? 'Copied!' : 'Copy Markdown'}</span>
                            </button>
                        </div>
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
