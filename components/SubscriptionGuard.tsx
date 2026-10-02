'use client';

import React, { useEffect, useState } from 'react';
import { getUserSession, getSchoolBilling, getConfig } from '../services/api';
import SubscriptionPaywall from './SubscriptionPaywall';

interface SubscriptionGuardProps {
    children: React.ReactNode;
}

const SubscriptionGuard: React.FC<SubscriptionGuardProps> = ({ children }) => {
    const [status, setStatus] = useState<'loading' | 'active' | 'expired' | 'credits_exhausted' | 'pending'>('loading');
    const [billing, setBilling] = useState<any>(null);
    const [logoUrl, setLogoUrl] = useState<string | null>(null);
    const [isProceeded, setIsProceeded] = useState(false);
    const session = getUserSession();

    const checkSubscription = async () => {
        if (!session.schoolId) {
            setStatus('active'); // Super admin or unknown
            return;
        }

        // Parallel fetch for speed
        const [b, config] = await Promise.all([
            getSchoolBilling(),
            getConfig(session.schoolId)
        ]);

        setBilling(b);
        if (config?.logoUrl) setLogoUrl(config.logoUrl);

        if (b?.subStatus === 'active') {
            setStatus('active');
        } else if (b && b.credits <= 0) {
            setStatus('credits_exhausted');
        } else {
            setStatus(b?.subStatus as any || 'expired');
        }
    };

    useEffect(() => {
        checkSubscription();

        // Auto-refresh subscription status every 5 seconds so activation by Super Admin is near-instant
        const interval = setInterval(checkSubscription, 5000);
        return () => clearInterval(interval);
    }, [session.schoolId]);

    if (status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="w-12 h-12 border-4 border-qabas-purple border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if ((status === 'credits_exhausted' || status === 'expired' || status === 'pending') && session.role !== 'super_admin') {
        return (
            <SubscriptionPaywall
                schoolId={session.schoolId || ''}
                billingInfo={billing}
                logoUrl={logoUrl}
                onPaymentSuccess={() => {
                    checkSubscription(); // Reload status
                }}
                onRefresh={checkSubscription}
                onProceed={() => setIsProceeded(true)}
            />
        );
    }

    return <>{children}</>;
};

export default SubscriptionGuard;
