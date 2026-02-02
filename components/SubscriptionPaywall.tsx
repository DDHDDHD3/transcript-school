import React, { useState } from 'react';
import { CreditCard, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { paySchoolSubscription } from '../services/mockBackend';

interface SubscriptionPaywallProps {
    schoolId: string;
    onPaymentSuccess: () => void;
}

const SubscriptionPaywall: React.FC<SubscriptionPaywallProps> = ({ schoolId, onPaymentSuccess }) => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);

    const handlePay = async () => {
        setLoading(true);
        const success = await paySchoolSubscription(schoolId);
        if (success) {
            onPaymentSuccess();
        } else {
            alert(t('settings.security.error'));
        }
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-xl p-4">
            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                className="max-w-xl w-full bg-white rounded-[40px] shadow-2xl overflow-hidden border border-white/20"
            >
                {/* Header Section */}
                <div className="bg-gradient-to-br from-qabas-purple via-royal-900 to-slate-900 p-10 text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-qabas-orange opacity-10 blur-3xl -mr-20 -mt-20 animate-pulse" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500 opacity-10 blur-3xl -ml-20 -mb-20" />

                    <div className="relative z-10">
                        <div className="mx-auto w-24 h-24 bg-white/10 backdrop-blur-md rounded-[32px] flex items-center justify-center mb-6 shadow-2xl border border-white/20">
                            <Zap size={48} className="text-qabas-orange fill-qabas-orange/20" />
                        </div>
                        <h2 className="text-4xl font-black text-white mb-3 tracking-tight">
                            {t('subscription.expiredTitle')}
                        </h2>
                        <p className="text-purple-100 text-lg font-medium opacity-90 px-4">
                            {t('subscription.expiredSubtitle')}
                        </p>
                    </div>
                </div>

                {/* Body Content */}
                <div className="p-10 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-5 rounded-3xl bg-slate-50 border border-slate-100 flex items-start gap-4 transition-all hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 group">
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-qabas-purple shadow-sm group-hover:scale-110 transition-transform">
                                <ShieldCheck size={24} />
                            </div>
                            <div>
                                <h4 className="font-black text-slate-800 text-sm mb-1 uppercase tracking-wide">Unlimited Access</h4>
                                <p className="text-xs text-slate-500 leading-relaxed font-medium">Continue managing students and grades without limits.</p>
                            </div>
                        </div>
                        <div className="p-5 rounded-3xl bg-slate-50 border border-slate-100 flex items-start gap-4 transition-all hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 group">
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-qabas-orange shadow-sm group-hover:scale-110 transition-transform">
                                <CreditCard size={24} />
                            </div>
                            <div>
                                <h4 className="font-black text-slate-800 text-sm mb-1 uppercase tracking-wide">Best Value</h4>
                                <p className="text-xs text-slate-500 leading-relaxed font-medium">Only $5 per month for full professional features.</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 pt-2">
                        <button
                            onClick={handlePay}
                            disabled={loading}
                            className="w-full py-6 bg-gradient-to-r from-royal-900 to-qabas-purple hover:to-royal-800 text-white font-black rounded-[28px] shadow-[0_20px_40px_-15px_rgba(91,33,182,0.4)] transition-all active:scale-95 flex items-center justify-center gap-3 text-xl group disabled:opacity-70 disabled:active:scale-100"
                        >
                            {loading ? (
                                <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <span>Pay $5 Now</span>
                                    <ArrowRight className="group-hover:translate-x-2 transition-transform" />
                                </>
                            )}
                        </button>

                        <p className="text-center text-[11px] text-slate-400 font-bold uppercase tracking-[0.2em]">
                            * Payment is for 1 month starting from today
                        </p>
                    </div>

                    <div className="pt-6 border-t border-slate-100 flex justify-center gap-8">
                        <div className="flex items-center gap-2 text-slate-400">
                            <CheckCircle2 size={16} className="text-green-500" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Secure Payment</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-400">
                            <CheckCircle2 size={16} className="text-green-500" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Instant Activation</span>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default SubscriptionPaywall;
