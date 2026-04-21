import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { blogService } from '../services/api';
import ReactMarkdown from 'react-markdown';
import { ChevronLeft, Calendar, Copy, Check, Download, ExternalLink } from 'lucide-react';
import Loader from '../components/Loader';
import DevToModal from '../components/DevToModal';
import toast, { Toaster } from 'react-hot-toast';

export default function BlogView() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [blog, setBlog] = useState(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);
    const [showDevToModal, setShowDevToModal] = useState(false);

    useEffect(() => {
        fetchBlog();
    }, [id]);

    const fetchBlog = async () => {
        try {
            const data = await blogService.getBlogById(id);
            setBlog(data);
        } catch (err) {
            console.error(err);
            toast.error('Failed to load blog');
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
    };

    if (loading) return <div className="pt-40"><Loader message="Loading your blog..." /></div>;
    if (!blog) return <div className="pt-40 text-center text-white">Blog not found</div>;

    return (
        <div className="max-w-4xl mx-auto pt-32 px-6 pb-20 animate-in fade-in duration-700">
            <Toaster position="bottom-right" />

            {/* DevTo modal */}
            {showDevToModal && (
                <DevToModal
                    blog={blog}
                    onClose={() => setShowDevToModal(false)}
                    onPublish={handlePublish}
                />
            )}

            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 group"
            >
                <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                <span>Back to History</span>
            </button>

            <div className="mb-12">
                <div className="flex items-center gap-3 text-purple-400 text-sm font-medium mb-4">
                    <Calendar size={16} />
                    <span>{new Date(blog.created_at).toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
                </div>
                <h1 className="text-4xl lg:text-6xl font-bold text-white mb-8 tracking-tight capitalize">
                    {blog.topic}
                </h1>

                {/* Action buttons */}
                <div className="flex flex-wrap gap-3">
                    {/* Copy Markdown */}
                    <button
                        onClick={copyToClipboard}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl glass-card hover:bg-white/10 transition-all text-sm font-medium text-white"
                    >
                        {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                        <span>{copied ? 'Copied' : 'Copy Markdown'}</span>
                    </button>

                    {/* Download .md */}
                    <button
                        onClick={handleDownload}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl glass-card hover:bg-white/10 transition-all text-sm font-medium text-white"
                    >
                        <Download size={16} className="text-blue-400" />
                        <span>Download .md</span>
                    </button>

                    {/* Publish to DEV.IO → opens modal */}
                    <button
                        onClick={() => setShowDevToModal(true)}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 transition-all text-sm font-semibold text-white shadow-md shadow-purple-500/20"
                    >
                        <ExternalLink size={16} />
                        <span>Publish to DEV.IO</span>
                    </button>
                </div>
            </div>

            <div className="glass-card rounded-3xl p-8 lg:p-12 bg-slate-900/50">
                <div className="prose prose-invert max-w-none">
                    <ReactMarkdown>{blog.content}</ReactMarkdown>
                </div>
            </div>
        </div>
    );
}
