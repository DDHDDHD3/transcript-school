import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Smartphone, Apple } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const PWAInstallPrompt: React.FC = () => {
    const { t } = useTranslation();
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [showPrompt, setShowPrompt] = useState(false);
    const [isIOS, setIsIOS] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);

    // Check if user is on admin/dashboard pages - don't show PWA prompt there
    const isAdminRoute = window.location.hash.includes('/admin') || window.location.hash.includes('/super');

    useEffect(() => {
        // Don't show on admin routes
        if (isAdminRoute) return;

        // Check if already installed (standalone mode)
        const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches
            || (window.navigator as any).standalone === true;
        setIsStandalone(isInStandaloneMode);

        // Don't show if already installed
        if (isInStandaloneMode) return;

        // Check if iOS
        const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
        setIsIOS(isIOSDevice);

        // Check if user has dismissed the prompt before
        const dismissed = localStorage.getItem('pwa-prompt-dismissed');
        const dismissedTime = dismissed ? parseInt(dismissed, 10) : 0;
        const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);

        // Show prompt again after 7 days
        if (dismissed && daysSinceDismissed < 7) {
            return;
        }

        // Listen for beforeinstallprompt (for native install capability)
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        // Always show prompt after 2 seconds on public pages
        const timer = setTimeout(() => {
            setShowPrompt(true);
        }, 2000);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            clearTimeout(timer);
        };
    }, [isAdminRoute]);

    const handleInstall = async () => {
        if (deferredPrompt) {
            try {
                await deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;

                if (outcome === 'accepted') {
                    setShowPrompt(false);
                }
                setDeferredPrompt(null);
            } catch (error) {
                console.error('Install prompt error:', error);
                handleDismiss();
            }
        } else {
            // If no native prompt available, just dismiss (don't show alert)
            handleDismiss();
        }
    };

    const handleDismiss = () => {
        setShowPrompt(false);
        localStorage.setItem('pwa-prompt-dismissed', Date.now().toString());
    };

    // Don't show if already installed or on admin routes
    if (isStandalone || isAdminRoute) return null;

    return (
        <AnimatePresence>
            {showPrompt && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-sm z-40"
                >
                    <div className="bg-gradient-to-br from-purple-700 via-purple-600 to-violet-700 rounded-2xl shadow-2xl overflow-hidden border border-purple-400/20">
                        {/* Header with close button */}
                        <div className="flex items-center justify-between p-3 pb-1">
                            <div className="flex items-center gap-2">
                                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                                    <Download className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-white font-bold text-sm leading-tight">
                                        {t('pwa.title')}
                                    </h3>
                                    <p className="text-purple-200 text-xs">
                                        {t('pwa.subtitle')}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={handleDismiss}
                                className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
                                aria-label="Dismiss"
                            >
                                <X className="w-4 h-4 text-white/70" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="px-3 pb-3">
                            <p className="text-purple-100 text-xs mb-3">
                                {t('pwa.description')}
                            </p>

                            {/* Platform buttons */}
                            <div className="flex flex-col gap-3">
                                {isIOS ? (
                                    // iOS Instructions - More prominent
                                    <div className="bg-white/15 backdrop-blur-md rounded-2xl p-4 border border-white/20 shadow-inner">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                                                <Apple className="w-5 h-5 text-white" />
                                            </div>
                                            <span className="text-white font-bold text-sm">{t('pwa.iosTitle')}</span>
                                        </div>
                                        <p className="text-purple-100 text-xs leading-relaxed">
                                            {t('pwa.iosInstructions')}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-2">
                                        {/* Android/Chrome Install Button */}
                                        <button
                                            onClick={handleInstall}
                                            className="w-full bg-white text-purple-700 font-bold rounded-xl py-3 px-4 flex items-center justify-center gap-2 hover:bg-purple-50 transition-all shadow-xl active:scale-[0.98] text-sm"
                                        >
                                            <Smartphone className="w-5 h-5" />
                                            <span>{t('pwa.installBtn')}</span>
                                        </button>

                                        {/* Show iOS info even on Android occasionally for "all platforms" feeling, or just a clear dismiss */}
                                        <button
                                            onClick={handleDismiss}
                                            className="w-full py-2.5 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-colors text-xs font-medium"
                                        >
                                            {t('pwa.notNow')}
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* App features preview */}
                            <div className="mt-2 flex items-center justify-center gap-3 text-purple-200 text-xs">
                                <span className="flex items-center gap-1">
                                    <span className="w-1 h-1 bg-green-400 rounded-full"></span>
                                    {t('pwa.offlineAccess')}
                                </span>
                                <span className="flex items-center gap-1">
                                    <span className="w-1 h-1 bg-blue-400 rounded-full"></span>
                                    {t('pwa.fastSecure')}
                                </span>
                                <span className="flex items-center gap-1">
                                    <span className="w-1 h-1 bg-amber-400 rounded-full"></span>
                                    {t('pwa.freeDownload')}
                                </span>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default PWAInstallPrompt;
