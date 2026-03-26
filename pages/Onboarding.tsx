import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser, useClerk } from '@clerk/clerk-react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { School, MapPin, FileText, Phone, CheckCircle2, Loader2, Building2 } from 'lucide-react';
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
        licenseNumber: '',
        phoneNumber: ''
    });

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
        if (!formData.name.trim() || formData.name.includes('New School') || formData.name.includes('Pending Onboarding')) {
            alert('Please enter a valid School Name.');
            return;
        }
        if (!formData.location.trim() || formData.location === 'Not Set') {
            alert('Please enter your School Location.');
            return;
        }
        if (!formData.phoneNumber.trim() || formData.phoneNumber === 'Not Set') {
            alert('Please enter a valid Phone Number.');
            return;
        }

        setLoading(true);
        try {
            const result = await completeOnboarding(
                session.schoolId,
                user.primaryEmailAddress.emailAddress,
                formData
            );

            if (result.success) {
                // Update local storage to reflect onboarding status immediately
                localStorage.setItem('cv_has_onboarded', 'true');

                // Short delay for visual success
                setTimeout(() => {
                    navigate('/admin/dashboard');
                    window.location.reload(); // Force reload to update Layout state
                }, 1000);
            } else {
                alert('Failed to save details. Please try again.');
            }
        } catch (error) {
            console.error('Onboarding error:', error);
            alert('An error occurred: ' + (error instanceof Error ? error.message : 'Unknown error'));
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
                <div className="bg-qabas-purple p-10 flex flex-col justify-between text-white md:w-2/5 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full opacity-10">
                        <div className="absolute top-10 right-10 w-40 h-40 rounded-full bg-white blur-3xl"></div>
                        <div className="absolute bottom-10 left-10 w-40 h-40 rounded-full bg-qabas-orange blur-3xl"></div>
                    </div>

                    <div className="relative z-10">
                        <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6 overflow-hidden p-2">
                            {session.schoolId === 'super' ? (
                                <Building2 size={28} />
                            ) : (
                                <img src="/logo.jpg" alt="Logo" className="w-full h-full object-contain brightness-0 invert" />
                            )}
                        </div>
                        <h2 className="text-3xl font-black mb-2">{t('onboarding.title') || 'Setup School'}</h2>
                        <p className="text-purple-200 font-medium text-sm leading-relaxed">
                            {t('onboarding.subtitle') || 'Please complete your school profile to access the dashboard.'}
                        </p>
                    </div>

                    <div className="relative z-10 space-y-4">
                        <div className="flex items-center gap-3 text-sm font-medium text-purple-100">
                            <CheckCircle2 size={16} className="text-green-400" />
                            <span>{t('onboarding.step1') || 'Create Account'}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm font-bold text-white">
                            <div className="w-4 h-4 rounded-full border-2 border-white flex items-center justify-center">
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                            </div>
                            <span>{t('onboarding.step2') || 'School Details'}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm font-medium text-purple-100 opacity-50">
                            <div className="w-4 h-4 rounded-full border-2 border-purple-300"></div>
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
                                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-white/5 rounded-xl border-none font-bold text-slate-700 dark:text-slate-100 focus:ring-2 focus:ring-purple-100 transition-all"
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
                                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-white/5 rounded-xl border-none font-bold text-slate-700 dark:text-slate-100 focus:ring-2 focus:ring-purple-100 transition-all"
                                    placeholder="e.g. Mogadishu, Hodan District"
                                    value={formData.location}
                                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                                {t('onboarding.license') || 'License Number'}
                            </label>
                            <div className="relative">
                                <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="text"
                                    required
                                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-white/5 rounded-xl border-none font-bold text-slate-700 dark:text-slate-100 focus:ring-2 focus:ring-purple-100 transition-all"
                                    placeholder="e.g. LIC-2024-001"
                                    value={formData.licenseNumber}
                                    onChange={e => setFormData({ ...formData, licenseNumber: e.target.value })}
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
                                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-white/5 rounded-xl border-none font-bold text-slate-700 dark:text-slate-100 focus:ring-2 focus:ring-purple-100 transition-all"
                                    placeholder="e.g. +252 61 5000000"
                                    value={formData.phoneNumber}
                                    onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="pt-4 flex items-center gap-4">
                            <button
                                type="button"
                                onClick={() => signOut()}
                                className="px-6 py-3.5 rounded-xl font-bold text-slate-500 hover:bg-slate-50 transition-colors"
                            >
                                {t('common.cancel') || 'Logout'}
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 bg-qabas-purple text-white py-3.5 rounded-xl font-black shadow-lg shadow-purple-200 hover:bg-purple-800 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : (t('onboarding.submit') || 'Complete Setup')}
                            </button>
                        </div>
                    </form>
                </div>
            </motion.div>
        </div>
    );
};

export default Onboarding;
