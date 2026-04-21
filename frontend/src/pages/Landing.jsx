import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
    Sparkles, PenLine, Zap, Shield, BookOpen,
    Youtube, ArrowRight, Star, ChevronRight
} from 'lucide-react';

const features = [
    {
        icon: Zap,
        title: 'Lightning Fast',
        desc: 'Generate full-length, research-backed blogs in under 60 seconds using state-of-the-art LLMs.',
        color: 'from-yellow-500 to-orange-500',
        bg: 'bg-yellow-500/10',
    },
    {
        icon: BookOpen,
        title: 'Deep Research',
        desc: 'Powered by Tavily search — every blog is grounded in real, up-to-date web sources.',
        color: 'from-blue-500 to-cyan-500',
        bg: 'bg-blue-500/10',
    },
    {
        icon: Youtube,
        title: 'YouTube to Blog',
        desc: "Paste any YouTube URL and instantly transform a video's insights into a polished article.",
        color: 'from-red-500 to-pink-500',
        bg: 'bg-red-500/10',
    },
    {
        icon: Shield,
        title: 'Private & Secure',
        desc: 'Your blogs are tied to your account only. JWT auth + OTP verification keeps your data safe.',
        color: 'from-green-500 to-emerald-500',
        bg: 'bg-green-500/10',
    },
];

const steps = [
    { num: '01', title: 'Create your account', desc: 'Sign up in seconds with email + OTP verification.' },
    { num: '02', title: 'Enter a topic or URL', desc: 'Type any topic or paste a YouTube video link.' },
    { num: '03', title: 'AI does the work', desc: 'Our agent researches, outlines, and writes for you.' },
    { num: '04', title: 'Copy & publish', desc: 'Get beautifully formatted Markdown ready to publish.' },
];

const testimonials = [
    { name: 'Priya S.', role: 'Content Creator', text: 'I used to spend 4 hours per post. Now it takes 3 minutes. GhostWriterAI is unreal.', stars: 5 },
    { name: 'Rahul M.', role: 'Startup Founder', text: 'The YouTube-to-blog feature alone is worth it. Perfect for turning our podcasts into articles.', stars: 5 },
    { name: 'Ayesha K.', role: 'Digital Marketer', text: 'The research quality is insane. Every blog cites real sources and feels genuinely written by an expert.', stars: 5 },
];

export default function Landing() {
    const heroRef = useRef(null);

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!heroRef.current) return;
            const { clientX, clientY } = e;
            const { innerWidth, innerHeight } = window;
            const xPct = (clientX / innerWidth - 0.5) * 20;
            const yPct = (clientY / innerHeight - 0.5) * 20;
            heroRef.current.style.transform = `translate(${xPct}px, ${yPct}px)`;
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <div className="relative overflow-hidden">

            {/* ───── HERO ───── */}
            <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-24 pb-16">
                {/* Ambient blobs */}
                <div className="absolute top-[-15%] left-[10%] w-[500px] h-[500px] bg-purple-600/25 blur-[160px] rounded-full pointer-events-none" />
                <div className="absolute bottom-[-10%] right-[5%] w-[400px] h-[400px] bg-blue-600/25 blur-[140px] rounded-full pointer-events-none" />

                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-sm font-medium mb-8 animate-fade-in">
                    <Sparkles size={14} />
                    <span>AI-Powered Blog Generation — Free to try</span>
                </div>

                {/* Heading */}
                <div ref={heroRef} className="transition-transform duration-200 ease-out max-w-5xl mx-auto">
                    <h1 className="text-5xl sm:text-6xl lg:text-8xl font-extrabold tracking-tight text-white leading-tight mb-6">
                        Write{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-fuchsia-400 to-blue-400">
                            Expert Blogs
                        </span>
                        <br />in Seconds, Not Hours
                    </h1>
                    <p className="text-slate-400 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
                        GhostWriterAI researches the web, structures your ideas, and writes publish-ready blog posts — from a topic or a YouTube video.
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            to="/signup"
                            className="group flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold text-lg shadow-lg shadow-purple-500/30 transition-all duration-300 hover:scale-105"
                        >
                            Start Writing Free
                            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link
                            to="/login"
                            className="flex items-center gap-2 px-8 py-4 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 text-white font-semibold text-lg transition-all duration-300 hover:scale-105"
                        >
                            Sign In
                            <ChevronRight size={20} />
                        </Link>
                    </div>
                </div>

                {/* Hero preview card */}
                <div className="mt-20 w-full max-w-3xl mx-auto glass-card rounded-3xl p-6 border border-white/10 shadow-2xl shadow-purple-900/30">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-3 h-3 rounded-full bg-red-500/70" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                        <div className="w-3 h-3 rounded-full bg-green-500/70" />
                        <span className="ml-3 text-xs text-slate-500 font-mono">ghostwriter.ai/app</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                        <PenLine size={18} className="text-purple-400 shrink-0" />
                        <span className="text-slate-400 text-sm italic flex-1">The Future of Multimodal AI in 2026...</span>
                        <span className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs font-semibold">Generate</span>
                    </div>
                    <div className="mt-4 space-y-2">
                        <div className="h-3 bg-white/10 rounded-full w-full animate-pulse" />
                        <div className="h-3 bg-white/8 rounded-full w-5/6 animate-pulse delay-100" />
                        <div className="h-3 bg-white/6 rounded-full w-4/6 animate-pulse delay-200" />
                        <div className="h-3 bg-white/10 rounded-full w-full animate-pulse delay-300" />
                        <div className="h-3 bg-white/8 rounded-full w-3/4 animate-pulse delay-150" />
                    </div>
                </div>
            </section>

            {/* ───── FEATURES ───── */}
            <section className="py-28 px-6 relative">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <p className="text-purple-400 text-sm font-semibold uppercase tracking-widest mb-3">Why GhostWriterAI?</p>
                        <h2 className="text-4xl sm:text-5xl font-bold text-white tracking-tight">
                            Everything you need to{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
                                write smarter
                            </span>
                        </h2>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {features.map((f) => {
                            const Icon = f.icon;
                            return (
                                <div
                                    key={f.title}
                                    className="glass-card rounded-2xl p-6 group hover:border-purple-500/30 transition-all duration-300 hover:-translate-y-1"
                                >
                                    <div className={`w-12 h-12 ${f.bg} rounded-xl flex items-center justify-center mb-4`}>
                                        <Icon
                                            size={24}
                                            className={`text-transparent bg-clip-text bg-gradient-to-r ${f.color}`}
                                            style={{ stroke: 'url(#grad)' }}
                                        />
                                        <Icon size={24} className="text-white opacity-80" style={{ display: 'none' }} />
                                    </div>
                                    {/* fallback - just render icon in white */}
                                    <div className={`w-12 h-12 ${f.bg} rounded-xl items-center justify-center mb-4 hidden group-[&]:flex`}>
                                    </div>
                                    <h3 className="text-white font-semibold text-lg mb-2">{f.title}</h3>
                                    <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ───── HOW IT WORKS ───── */}
            <section className="py-24 px-6 relative">
                <div className="absolute inset-0 bg-gradient-to-b from-purple-900/5 to-blue-900/5 pointer-events-none" />
                <div className="max-w-5xl mx-auto relative">
                    <div className="text-center mb-16">
                        <p className="text-blue-400 text-sm font-semibold uppercase tracking-widest mb-3">Simple Process</p>
                        <h2 className="text-4xl sm:text-5xl font-bold text-white tracking-tight">
                            From idea to article{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                                in 4 steps
                            </span>
                        </h2>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {steps.map((s, i) => (
                            <div key={s.num} className="relative">
                                {i < steps.length - 1 && (
                                    <div className="hidden lg:block absolute top-8 left-full w-full h-px bg-gradient-to-r from-purple-500/40 to-transparent z-0" />
                                )}
                                <div className="relative z-10">
                                    <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-purple-500/40 to-blue-500/40 mb-3 leading-none">
                                        {s.num}
                                    </div>
                                    <h3 className="text-white font-semibold text-base mb-2">{s.title}</h3>
                                    <p className="text-slate-400 text-sm leading-relaxed">{s.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ───── TESTIMONIALS ───── */}
            <section className="py-24 px-6">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-14">
                        <p className="text-fuchsia-400 text-sm font-semibold uppercase tracking-widest mb-3">Loved by creators</p>
                        <h2 className="text-4xl sm:text-5xl font-bold text-white tracking-tight">What writers are saying</h2>
                    </div>
                    <div className="grid sm:grid-cols-3 gap-6">
                        {testimonials.map((t) => (
                            <div
                                key={t.name}
                                className="glass-card rounded-2xl p-6 hover:border-purple-500/30 transition-all duration-300 hover:-translate-y-1"
                            >
                                <div className="flex gap-1 mb-4">
                                    {Array.from({ length: t.stars }).map((_, i) => (
                                        <Star key={i} size={14} className="fill-yellow-400 text-yellow-400" />
                                    ))}
                                </div>
                                <p className="text-slate-300 text-sm leading-relaxed mb-6 italic">"{t.text}"</p>
                                <div>
                                    <p className="text-white font-semibold text-sm">{t.name}</p>
                                    <p className="text-slate-500 text-xs">{t.role}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ───── CTA BANNER ───── */}
            <section className="py-24 px-6">
                <div className="max-w-3xl mx-auto text-center">
                    <div className="glass-card rounded-3xl p-12 border border-purple-500/20 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-blue-600/10 pointer-events-none" />
                        <div className="relative z-10">
                            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
                                <Sparkles size={32} className="text-white" />
                            </div>
                            <h2 className="text-4xl font-bold text-white mb-4">Ready to write smarter?</h2>
                            <p className="text-slate-400 mb-8 text-lg">Join and start generating research-backed blogs in seconds.</p>
                            <Link
                                to="/signup"
                                className="inline-flex items-center gap-2 px-10 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold text-lg shadow-lg shadow-purple-500/30 transition-all duration-300 hover:scale-105"
                            >
                                Get Started — It's Free
                                <ArrowRight size={20} />
                            </Link>
                            <p className="text-slate-500 text-sm mt-4">No credit card required</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ───── FOOTER ───── */}
            <footer className="border-t border-white/5 py-10 px-6">
                <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-white font-bold text-lg">
                        <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg">
                            <Sparkles size={16} />
                        </div>
                        GhostWriter<span className="text-purple-400">AI</span>
                    </div>
                    <p className="text-slate-500 text-sm">© {new Date().getFullYear()} GhostWriterAI. All rights reserved.</p>
                    <div className="flex items-center gap-6 text-slate-400 text-sm">
                        <Link to="/login" className="hover:text-white transition-colors">Sign In</Link>
                        <Link to="/signup" className="hover:text-white transition-colors">Sign Up</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
