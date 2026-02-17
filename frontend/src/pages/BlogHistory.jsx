import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { blogService } from '../services/api';
import { Calendar, ChevronRight, Search, Inbox } from 'lucide-react';

export default function BlogHistory() {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchBlogs();
    }, []);

    const fetchBlogs = async () => {
        try {
            const data = await blogService.getBlogs();
            setBlogs(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const filteredBlogs = blogs.filter(blog =>
        blog.topic.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="max-w-6xl mx-auto pt-32 px-6 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <h1 className="text-4xl font-bold text-white">Generation History</h1>

                <div className="relative max-w-sm w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input
                        type="text"
                        placeholder="Search blogs..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-purple-500/50 transition-all"
                    />
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="h-64 glass-card rounded-2xl animate-pulse" />
                    ))}
                </div>
            ) : filteredBlogs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredBlogs.map((blog) => (
                        <Link
                            key={blog.id}
                            to={`/blog/${blog.id}`}
                            className="group glass-card rounded-2xl p-6 hover:border-purple-500/30 transition-all duration-500 flex flex-col h-full"
                        >
                            <div className="flex items-center gap-2 text-slate-500 text-xs font-medium uppercase tracking-wider mb-4">
                                <Calendar size={14} />
                                <span>{new Date(blog.created_at).toLocaleDateString()}</span>
                            </div>

                            <h3 className="text-xl font-bold text-white mb-4 line-clamp-2 group-hover:text-purple-400 transition-colors">
                                {blog.topic}
                            </h3>

                            <p className="text-slate-400 text-sm line-clamp-3 mb-6 flex-1">
                                {blog.content.replace(/[#*]/g, '').substring(0, 150)}...
                            </p>

                            <div className="flex items-center gap-2 text-purple-400 font-medium text-sm">
                                <span>View Full Blog</span>
                                <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-32 glass-card rounded-3xl opacity-50">
                    <Inbox size={48} className="text-slate-600 mb-4" />
                    <p className="text-slate-400 font-medium text-lg">No blogs found</p>
                    <p className="text-slate-500 text-sm">Start generating to see your history here.</p>
                </div>
            )}
        </div>
    );
}
