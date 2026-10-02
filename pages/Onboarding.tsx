import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser, useClerk } from '@clerk/clerk-react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { School, MapPin, FileText, Phone, CheckCircle2, Loader2, Building2, Upload, Plus, AlertCircle } from 'lucide-react';
import { getUserSession, completeOnboarding, getConfig } from '../services/api';

const Onboarding = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { user } = useUser();
    const { signOut } = useClerk();
    const session = getUserSession();

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        location: '',
        description: '',
        phone: '',
        logo: ''
    });
    const [error, setError] = useState<string | null>(null);

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, logo: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    useEffect(() => {
        // Pre-fill school name if available
        const init = async () => {
            if (session.schoolId) {
                const config = await getConfig(session.schoolId);
                setFormData(prev => ({ ...prev, name: config.schoolName !== 'New School Name' ? config.schoolName : '' }));
            }
        };
        init();
    }, [session.schoolId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim() || formData.name.includes('New School') || formData.name.includes('Pending Onboarding')) {
            setError('Please enter a valid School Name.');
            return;
        }
        if (!formData.location.trim() || formData.location === 'Not Set') {
            setError('Please enter your School Location.');
            return;
        }
        if (!formData.phone.trim() || formData.phone === 'Not Set') {
            setError('Please enter a valid Phone Number.');
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const result = await completeOnboarding(
                session.schoolId,
                user?.primaryEmailAddress?.emailAddress || '',
                formData
            );

            if (result.success) {
                // Short delay for visual feedback
                setTimeout(() => {
                    navigate('/admin/dashboard', { replace: true });
                    window.location.reload();
                }, 1000);
            } else {
                setError('Failed to save details. Please try again.');
            }
        } catch (err) {
            console.error('Onboarding error:', err);
            setError('An error occurred while saving your details.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] dark:bg-[#020617] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-[#0f172a] rounded-[40px] shadow-2xl overflow-hidden max-w-2xl w-full flex flex-col md:flex-row min-h-[500px]"
            >
                {/* Sidebar / Visual */}
                <div className="bg-slate-50 p-10 flex flex-col justify-between text-slate-900 md:w-2/5 relative overflow-hidden border-r border-slate-100">
                    <div className="absolute top-0 left-0 w-full h-full opacity-30">
                        <div className="absolute top-10 right-10 w-40 h-40 rounded-full bg-violet-100 blur-3xl"></div>
                        <div className="absolute bottom-10 left-10 w-40 h-40 rounded-full bg-amber-50 blur-3xl"></div>
                    </div>

                    <div className="relative z-10">
                        <div className="relative group mb-6">
                            <label className="cursor-pointer">
                                <div className="w-20 h-20 bg-white shadow-sm rounded-2xl flex items-center justify-center overflow-hidden border-2 border-dashed border-slate-200 group-hover:border-violet-400 transition-all">
                                    {formData.logo ? (
                                        <img src={formData.logo} alt="Logo Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <Upload size={28} className="text-black" />
                                    )}
                                </div>
                                <input type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
                                <div className="absolute -bottom-1 -right-1 bg-violet-600 text-white p-1.5 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100">
                                    <Plus size={12} strokeWidth={3} />
                                </div>
                            </label>
                        </div>
                        <h2 className="text-3xl font-black mb-2 text-slate-900">{t('onboarding.title') || 'Setup School'}</h2>
                        <p className="text-slate-500 font-medium text-sm leading-relaxed">
                            {t('onboarding.subtitle') || 'Please complete your school profile to access the dashboard.'}
                        </p>
                    </div>

                    <div className="relative z-10 space-y-4">
                        <div className="flex items-center gap-3 text-sm font-medium text-slate-500">
                            <CheckCircle2 size={16} className="text-emerald-500" />
                            <span>{t('onboarding.step1') || 'Create Account'}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm font-bold text-slate-900">
                            <div className="w-4 h-4 rounded-full border-2 border-violet-600 flex items-center justify-center">
                                <div className="w-2 h-2 bg-violet-600 rounded-full"></div>
                            </div>
                            <span>{t('onboarding.step2') || 'School Details'}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm font-medium text-slate-400">
                            <div className="w-4 h-4 rounded-full border-2 border-slate-200"></div>
                            <span>{t('onboarding.step3') || 'Dashboard Access'}</span>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <div className="p-10 md:w-3/5 dark:bg-[#0f172a]">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                                {t('onboarding.schoolName') || 'School Name'}
                            </label>
                            <div className="relative">
                                <School className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="text"
                                    required
                                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-white/5 rounded-xl border-none font-bold text-black dark:text-black focus:ring-2 focus:ring-purple-100 transition-all"
                                    placeholder="e.g. Al-Huda Islamic School"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                                {t('onboarding.location') || 'Location / Address'}
                            </label>
                            <div className="relative">
                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="text"
                                    required
                                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-white/5 rounded-xl border-none font-bold text-black dark:text-black focus:ring-2 focus:ring-purple-100 transition-all"
                                    placeholder="e.g. Mogadishu, Hodan District"
                                    value={formData.location}
                                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                                {t('onboarding.description') || 'School Description'}
                            </label>
                            <div className="relative">
                                <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="text"
                                    required
                                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-white/5 rounded-xl border-none font-bold text-black dark:text-black focus:ring-2 focus:ring-purple-100 transition-all"
                                    placeholder="e.g. A primary school focused on Islamic education"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                                {t('onboarding.phone') || 'Phone Number'}
                            </label>
                            <div className="relative">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="tel"
                                    required
                                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-white/5 rounded-xl border-none font-bold text-black dark:text-black focus:ring-2 focus:ring-purple-100 transition-all"
                                    placeholder="e.g. +252 61 5000000"
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="pt-4 space-y-4">
                            <AnimatePresence>
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-center gap-3 text-red-600 dark:text-red-400 text-sm font-bold"
                                    >
                                        <AlertCircle size={18} className="shrink-0" />
                                        <p>{error}</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="flex items-center gap-4">
                                <button
                                    type="button"
                                    onClick={() => signOut(() => navigate('/'))}
                                    className="px-6 py-4 rounded-2xl font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                                >
                                    {t('common.cancel') || 'Logout'}
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 h-14 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black rounded-2xl shadow-xl shadow-indigo-900/20 transition-all active:scale-[0.98] flex items-center justify-center gap-3 group relative overflow-hidden"
                                >
                                    {loading ? (
                                        <div className="flex items-center gap-2">
                                            <Loader2 size={20} className="animate-spin" />
                                            <span className="tracking-wide uppercase text-xs">Saving Profile...</span>
                                        </div>
                                    ) : (
                                        <>
                                            <span className="tracking-wide uppercase text-xs">Complete Setup</span>
                                            <CheckCircle2 size={20} className="group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shine_1.5s_infinite] pointer-events-none" />
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </motion.div>
        </div>
    );
};

export default Onboarding;
