import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSchoolSubscription, getUserSession, getSchoolBilling } from '../services/api';
import { AlertCircle, CreditCard, Mail } from 'lucide-react';
import SubscriptionPaywall from './SubscriptionPaywall';
import { useTranslation } from 'react-i18next';

interface SubscriptionGuardProps {
    children: React.ReactNode;
}

const SubscriptionGuard: React.FC<SubscriptionGuardProps> = ({ children }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [status, setStatus] = useState<'loading' | 'active' | 'expired' | 'credits_exhausted'>('loading');
    const [billing, setBilling] = useState<any>(null);
    const session = getUserSession();

    const checkSubscription = async () => {
        if (!session.schoolId) {
            setStatus('active'); // Super admin or unknown
            return;
        }
        const b = await getSchoolBilling();
        setBilling(b);

        if (b && b.credits <= 0 && b.subStatus !== 'active') {
            setStatus('credits_exhausted');
        } else {
            setStatus(b?.subStatus as any || 'expired');
        }
    };

    useEffect(() => {
        checkSubscription();

        // Auto-refresh subscription status every 30 seconds
        const interval = setInterval(checkSubscription, 30000);
        return () => clearInterval(interval);
    }, [session.schoolId]);

    if (status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="w-12 h-12 border-4 border-qabas-purple border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (status === 'credits_exhausted' && session.role !== 'super_admin') {
        return (
            <SubscriptionPaywall
                schoolId={session.schoolId || ''}
                onPaymentSuccess={() => {
                    checkSubscription(); // Reload status
                }}
            />
        );
    }

    if (status === 'expired' && session.role !== 'super_admin') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
                <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
                    <div className="bg-qabas-purple p-8 text-center text-white">
                        <div className="mx-auto w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-4">
                            <AlertCircle size={32} />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">{t('subscription.expiredTitle')}</h2>
                        <p className="text-purple-100 text-sm">{t('subscription.expiredSubtitle')}</p>
                    </div>

                    <div className="p-8">
                        <div className="space-y-6">
                            <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                <div className="p-2 rounded-xl bg-white shadow-sm text-qabas-purple">
                                    <CreditCard size={20} />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-slate-800 mb-1">{t('subscription.howToRenew')}</h4>
                                    <p className="text-xs text-slate-500 leading-relaxed">
                                        {t('subscription.renewInstructions')}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                <div className="p-2 rounded-xl bg-white shadow-sm text-qabas-orange">
                                    <Mail size={20} />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-slate-800 mb-1">{t('subscription.contactSupport')}</h4>
                                    <p className="text-xs text-slate-500 font-mono">support@aqoonidigital.edu</p>
                                </div>
                            </div>

                            <button
                                onClick={() => navigate('/')}
                                className="w-full py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl transition-all"
                            >
                                {t('nav.backToHome')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return <>{children}</>;
};

export default SubscriptionGuard;
