import React from 'react';
import { Facebook, Download, Share2, Copy, CheckCircle2, Image as ImageIcon, Type, Layout as LayoutIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface MarketingHubProps {
    postImagePath: string;
    coverImagePath: string;
    category: string;
    bio: string;
}

const MarketingHub: React.FC<MarketingHubProps> = ({ postImagePath, coverImagePath, category, bio }) => {
    const [copied, setCopied] = React.useState<string | null>(null);

    const handleCopy = (text: string, type: string) => {
        navigator.clipboard.writeText(text);
        setCopied(type);
        setTimeout(() => setCopied(null), 2000);
    };

    const handleShare = () => {
        const url = 'https://aqoonidigital.edu'; // Placeholder platform URL
        const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        window.open(facebookUrl, '_blank', 'width=600,height=400');
    };

    return (
        <div className="space-y-10 py-6">
            <div className="flex items-center justify-between mb-2">
                <div>
                    <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-100">
                            <Facebook size={24} />
                        </div>
                        Social Marketing Hub
                    </h3>
                    <p className="text-slate-500 text-sm mt-1">Manage and push your platform's presence to social media.</p>
                </div>
                <button
                    onClick={handleShare}
                    className="flex items-center gap-2 bg-[#1877F2] hover:bg-[#166fe5] text-white px-6 py-3 rounded-2xl font-black shadow-lg shadow-blue-100 transition-all active:scale-[0.98]"
                >
                    <Share2 size={20} />
                    <span>Push to Facebook</span>
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Visual Assets */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-[#0f172a] rounded-[32px] p-6 shadow-sm border border-slate-100 dark:border-white/10">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
                                <ImageIcon size={18} className="text-qabas-purple" />
                                Announcement Post
                            </h4>
                            <a href={postImagePath} download className="p-2 text-slate-400 hover:text-qabas-purple transition-colors">
                                <Download size={20} />
                            </a>
                        </div>
                        <div className="bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 aspect-square flex items-center justify-center relative group">
                            <img src={postImagePath} alt="Facebook Post" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                <button className="bg-white text-slate-900 px-4 py-2 rounded-xl font-bold flex items-center gap-2">
                                    <Download size={16} /> Download High-Res
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-[#0f172a] rounded-[32px] p-6 shadow-sm border border-slate-100 dark:border-white/10">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
                                <LayoutIcon size={18} className="text-qabas-orange" />
                                Facebook Cover Page
                            </h4>
                            <a href={coverImagePath} download className="p-2 text-slate-400 hover:text-qabas-orange transition-colors">
                                <Download size={20} />
                            </a>
                        </div>
                        <div className="bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 aspect-[851/315] flex items-center justify-center relative group">
                            <img src={coverImagePath} alt="Facebook Cover" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                <button className="bg-white text-slate-900 px-4 py-2 rounded-xl font-bold flex items-center gap-2">
                                    <Download size={16} /> Download Cover
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Text Assets */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-[#0f172a] rounded-[32px] p-8 shadow-sm border border-slate-100 dark:border-white/10 h-full flex flex-col">
                        <div className="space-y-8 flex-1">
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <Type size={14} /> Recommended Category
                                    </label>
                                    <button 
                                        onClick={() => handleCopy(category, 'cat')}
                                        className="text-qabas-purple hover:bg-purple-50 p-1 rounded-lg transition-colors"
                                    >
                                        {copied === 'cat' ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                                    </button>
                                </div>
                                <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5 text-slate-800 dark:text-slate-100 font-bold">
                                    {category}
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <Type size={14} /> Optimized Bio
                                    </label>
                                    <button 
                                        onClick={() => handleCopy(bio, 'bio')}
                                        className="text-qabas-purple hover:bg-purple-50 p-1 rounded-lg transition-colors"
                                    >
                                        {copied === 'bio' ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                                    </button>
                                </div>
                                <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5 text-slate-700 dark:text-slate-300 font-medium leading-relaxed italic">
                                    "{bio}"
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-8 border-t border-slate-100 dark:border-white/5">
                            <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 p-4 rounded-2xl flex items-start gap-3">
                                <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 shrink-0">
                                    <ImageIcon size={16} />
                                </div>
                                <p className="text-xs text-amber-800 dark:text-amber-200 font-medium leading-relaxed">
                                    <strong>Pro Tip:</strong> Use the Cover Page to build authority and the Announcement Post to drive your first wave of platform registrations.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MarketingHub;
