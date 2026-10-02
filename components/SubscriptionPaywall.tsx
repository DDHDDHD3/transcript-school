import React, { useState } from 'react';
import { CreditCard, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck, Zap, RefreshCw, UserPlus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useClerk } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { paySchoolSubscription, logout } from '../services/api';

interface SubscriptionPaywallProps {
    schoolId: string;
    billingInfo?: any;
    logoUrl?: string | null;
    onPaymentSuccess: () => void;
    onRefresh?: () => void;
    onProceed: () => void;
}

const SubscriptionPaywall: React.FC<SubscriptionPaywallProps> = ({ schoolId, billingInfo, logoUrl, onPaymentSuccess, onRefresh, onProceed }) => {
    const { t } = useTranslation();
    const { signOut } = useClerk();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [switchingAccount, setSwitchingAccount] = useState(false);
    const [showDocument, setShowDocument] = useState(false);
    const [plan, setPlan] = useState<'monthly' | 'yearly'>('monthly');

    const handleSwitchAccount = async () => {
        setSwitchingAccount(true);
        try {
            await logout();
            await signOut();
            navigate('/admin/login');
        } catch {
            navigate('/admin/login');
        }
    };

    const isPending = billingInfo?.subStatus === 'pending';

    const handleAction = async () => {
        if (billingInfo?.billingMessage && !showDocument) {
            setShowDocument(true);
            return;
        }

        if (isPending) {
            return;
        }

        setLoading(true);
        const success = await paySchoolSubscription(schoolId, plan);
        if (success) {
            onPaymentSuccess();
        } else {
            alert(t('settings.security.error'));
        }
        setLoading(false);
    };

    if (showDocument) {
        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/90 backdrop-blur-2xl p-4 overflow-hidden">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    className="max-w-md w-full bg-[#fdfbf7] rounded-[32px] shadow-2xl overflow-hidden border border-amber-200/50 flex flex-col max-h-[90vh]"
                >
                    <div className="bg-amber-100/50 p-6 border-b border-amber-200/50 text-center relative overflow-hidden shrink-0">
                        <AlertCircle className="text-amber-500 mx-auto mb-3" size={32} />
                        <h2 className="text-xl font-black text-amber-900 uppercase tracking-widest">Message from Super Admin</h2>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-6">
                        <div className="bg-white p-6 rounded-2xl border border-amber-100 shadow-sm whitespace-pre-wrap font-mono text-slate-700 text-sm leading-relaxed min-h-[150px]">
                            {billingInfo?.billingMessage}
                        </div>
                    </div>
                    <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3">
                        <button
                            onClick={() => setShowDocument(false)}
                            disabled={loading}
                            className="flex-1 py-4 bg-white hover:bg-slate-100 text-slate-700 font-bold rounded-2xl border border-slate-200 transition-colors"
                        >
                            Back
                        </button>
                        {!isPending && (
                            <button
                                onClick={handleAction}
                                disabled={loading}
                                className="flex-[2] py-4 bg-gradient-to-r from-royal-900 to-qabas-purple hover:to-royal-800 text-white font-black rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    "Request Activation"
                                )}
                            </button>
                        )}
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/90 backdrop-blur-2xl p-4 overflow-hidden">
            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                className="max-w-xl w-full bg-white rounded-[48px] shadow-2xl overflow-hidden border border-white/20 flex flex-col max-h-[95vh]"
            >
                {/* Header Section - Fixed at top */}
                <div className="bg-gradient-to-br from-indigo-950 via-qabas-purple to-slate-950 p-8 text-center relative overflow-hidden shrink-0">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-qabas-orange opacity-20 blur-3xl -mr-20 -mt-20 animate-pulse" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500 opacity-20 blur-3xl -ml-20 -mb-20" />

                    <div className="relative z-10 flex flex-col items-center">
                        <div className="w-28 h-28 bg-white/10 backdrop-blur-xl rounded-[40px] flex items-center justify-center mb-6 shadow-2xl border border-white/20 overflow-hidden group hover:scale-105 transition-transform duration-500">
                            {logoUrl ? (
                                <img src={logoUrl} alt="School Logo" className="w-full h-full object-contain p-2" />
                            ) : (
                                <Zap size={56} className="text-qabas-orange fill-qabas-orange/20 animate-pulse" />
                            )}
                        </div>
                        <h2 className="text-4xl font-black text-white mb-2 tracking-tight">
                            {isPending ? "Activation Pending" : t('subscription.expiredTitle')}
                        </h2>
                        <div className="w-12 h-1 bg-qabas-orange rounded-full mb-4 opacity-80" />
                        <p className="text-indigo-100 text-base font-medium opacity-80 max-w-sm">
                            {isPending
                                ? "Your account is pending Super Admin approval. You will be able to access the dashboard once activated."
                                : t('subscription.expiredSubtitle')}
                        </p>
                    </div>
                </div>

                {/* Body Content - Scrollable */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-8 pt-6 space-y-8">
                    {/* School Info Section */}
                    {billingInfo && (
                        <div className="p-6 rounded-[32px] bg-indigo-50/50 border border-indigo-100/50 space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">School Identity</span>
                                <span className="text-sm font-black text-slate-800">{billingInfo.name}</span>
                            </div>
                            <div className="h-px bg-indigo-100/50" />
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">Contact Line</span>
                                <span className="text-sm font-black text-slate-800 font-mono tracking-wider">{billingInfo.phoneNumber || 'Not Set'}</span>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-5 rounded-[32px] bg-slate-50 border border-slate-100 flex items-start gap-4 transition-all hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 group">
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-qabas-purple shadow-sm group-hover:scale-110 transition-transform">
                                <ShieldCheck size={24} />
                            </div>
                            <div>
                                <h4 className="font-black text-slate-800 text-[11px] mb-1 uppercase tracking-widest">Full Access</h4>
                                <p className="text-[11px] text-slate-500 leading-relaxed font-bold">Manage unlimited students, attendance & results.</p>
                            </div>
                        </div>
                        <div className="p-5 rounded-[32px] bg-slate-50 border border-slate-100 flex items-start gap-4 transition-all hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 group">
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-qabas-orange shadow-sm group-hover:scale-110 transition-transform">
                                <CreditCard size={24} />
                            </div>
                            <div>
                                <h4 className="font-black text-slate-800 text-[11px] mb-1 uppercase tracking-widest">Cloud Sync</h4>
                                <p className="text-[11px] text-slate-500 leading-relaxed font-bold">Automatic backups & global verification security.</p>
                            </div>
                        </div>
                    </div>

                    {/* Support Contact */}
                    <div className="bg-slate-950 text-white p-6 rounded-[32px] flex items-center justify-between gap-4 border border-white/5 shadow-2xl">
                        <div>
                            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 mb-1">Activation Center</p>
                            <p className="text-2xl font-black font-mono tracking-tighter text-qabas-orange">+2520614163362</p>
                        </div>
                        <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center border border-white/5 group hover:border-qabas-orange/30 transition-colors">
                            <Zap size={28} className="text-qabas-orange opacity-80 group-hover:opacity-100 animate-pulse" />
                        </div>
                    </div>

                    {!isPending && (
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => setPlan('monthly')}
                                className={`relative p-5 rounded-3xl border-2 text-left transition-all ${plan === 'monthly'
                                    ? 'border-qabas-purple bg-purple-50/50 shadow-md'
                                    : 'border-slate-100 bg-white hover:border-slate-200'
                                    }`}
                            >
                                {plan === 'monthly' && (
                                    <div className="absolute top-4 right-4 text-qabas-purple">
                                        <CheckCircle2 size={20} />
                                    </div>
                                )}
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Monthly</p>
                                <p className="text-2xl font-black text-slate-800">$5<span className="text-sm text-slate-500 font-bold">/mo</span></p>
                            </button>
                            <button
                                onClick={() => setPlan('yearly')}
                                className={`relative p-5 rounded-3xl border-2 text-left transition-all ${plan === 'yearly'
                                    ? 'border-qabas-purple bg-purple-50/50 shadow-md'
                                    : 'border-slate-100 bg-white hover:border-slate-200'
                                    }`}
                            >
                                {plan === 'yearly' && (
                                    <div className="absolute top-4 right-4 text-qabas-purple">
                                        <CheckCircle2 size={20} />
                                    </div>
                                )}
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-500 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full whitespace-nowrap shadow-sm">
                                    Save $10
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Yearly</p>
                                <p className="text-2xl font-black text-slate-800">$50<span className="text-sm text-slate-500 font-bold">/yr</span></p>
                            </button>
                        </div>
                    )}

                    <div>
                        <button
                            onClick={handleAction}
                            disabled={loading || (isPending && !billingInfo?.billingMessage)}
                            className="w-full py-6 bg-gradient-to-r from-royal-900 to-qabas-purple hover:to-royal-800 text-white font-black rounded-[32px] shadow-[0_20px_50px_-15px_rgba(91,33,182,0.5)] transition-all active:scale-[0.98] flex items-center justify-center gap-3 text-xl group disabled:opacity-70 disabled:active:scale-100 mb-4"
                        >
                            {loading ? (
                                <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <span>{isPending ? "Pending Super Admin Approval" : "Activate Full Access"}</span>
                                    {!isPending && <ArrowRight className="group-hover:translate-x-2 transition-transform" />}
                                </>
                            )}
                        </button>

                        <p className="text-center text-[10px] text-slate-400 font-black uppercase tracking-[0.3em] opacity-60">
                            * {isPending ? "Please contact the Super Admin for activation" : `Activation fee: $${plan === 'monthly' ? '5' : '50'} invoice`}
                        </p>

                        {isPending && onRefresh && (
                            <button
                                onClick={onRefresh}
                                className="w-full mt-4 flex items-center justify-center gap-2 py-3 text-slate-500 hover:text-qabas-purple text-xs font-bold uppercase tracking-widest transition-colors"
                            >
                                <RefreshCw size={14} className="animate-spin-slow" />
                                Check Activation Status
                            </button>
                        )}

                        {/* Add Another Account */}
                        <button
                            onClick={handleSwitchAccount}
                            disabled={switchingAccount}
                            className="w-full mt-3 flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-slate-200 hover:border-qabas-purple/40 text-slate-500 hover:text-qabas-purple bg-slate-50 hover:bg-purple-50/50 text-xs font-bold uppercase tracking-widest transition-all group"
                        >
                            {switchingAccount ? (
                                <div className="w-4 h-4 border-2 border-slate-400/40 border-t-qabas-purple rounded-full animate-spin" />
                            ) : (
                                <UserPlus size={14} className="group-hover:scale-110 transition-transform" />
                            )}
                            Add Another Account
                        </button>
                    </div>

                    <div className="pt-2 flex justify-center gap-8">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 size={16} className="text-green-500" />
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Verified Security</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 size={16} className="text-green-500" />
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Instant Provisioning</span>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default SubscriptionPaywall;
