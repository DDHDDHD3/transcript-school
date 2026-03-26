import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Smartphone, Apple, Share, PlusSquare, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface PWAInstallButtonProps {
    variant?: 'sidebar' | 'nav' | 'banner' | 'footer';
    className?: string;
}

const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ variant = 'sidebar', className = '' }) => {
    const { t, i18n } = useTranslation();
    const isRTL = i18n.dir() === 'rtl';
    
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [isStandalone, setIsStandalone] = useState(false);
    const [isIOS, setIsIOS] = useState(false);
    const [showInstructions, setShowInstructions] = useState(false);

    useEffect(() => {
        // Detect standalone mode
        const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches
            || (window.navigator as any).standalone === true;
        setIsStandalone(isInStandaloneMode);

        // Detect iOS
        const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
        setIsIOS(isIOSDevice);

        // Check if event was already captured globally
        if ((window as any).deferredPrompt) {
            setDeferredPrompt((window as any).deferredPrompt);
        }

        // Listen for standard PWA install prompt
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            (window as any).deferredPrompt = e;
        };

        const handleAppInstalled = () => {
            setIsStandalone(true);
            setDeferredPrompt(null);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.addEventListener('appinstalled', handleAppInstalled);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.removeEventListener('appinstalled', handleAppInstalled);
        };
    }, []);

    const handleInstallClick = async () => {
        if (deferredPrompt) {
            await deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                setIsStandalone(true);
                setDeferredPrompt(null);
            }
        } else {
            setShowInstructions(true);
        }
    };

    if (isStandalone) return null;

    const renderButton = () => {
        const buttonLabel = t('pwa.installBtn');
        
        if (variant === 'nav') {
            return (
                <button
                    onClick={handleInstallClick}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] xl:text-xs font-black uppercase tracking-tighter transition-all bg-purple-600 hover:bg-purple-700 text-white shadow-lg active:scale-95 ${className}`}
                >
                    <Download size={14} className="shrink-0" />
                    <span className="hidden xl:inline">{buttonLabel}</span>
                    <span className="xl:hidden">App</span>
                </button>
            );
        }

        if (variant === 'footer') {
            return (
                <button
                    onClick={handleInstallClick}
                    className={`w-full py-4 px-6 font-black rounded-xl transition-all flex items-center justify-center gap-3 bg-white hover:bg-purple-50 text-purple-600 border-2 border-purple-100 shadow-xl active:scale-95 group ${className}`}
                >
                    <Download size={20} className="group-hover:scale-110 transition-transform" />
                    <span className="uppercase tracking-widest text-xs">{buttonLabel}</span>
                </button>
            );
        }

        if (variant === 'sidebar') {
            return (
                <button
                    onClick={handleInstallClick}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all bg-purple-50 dark:bg-purple-900/10 hover:bg-purple-100 dark:hover:bg-purple-900/20 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-900/20 active:scale-[0.98] ${className}`}
                >
                    <Smartphone size={20} />
                    <span className={`flex-1 ${isRTL ? 'text-right' : 'text-left'}`}>{buttonLabel}</span>
                    <ChevronRight size={16} className={`opacity-60 ${isRTL ? 'rotate-180' : ''}`} />
                </button>
            );
        }

        return null;
    };

    return (
        <div dir={isRTL ? 'rtl' : 'ltr'}>
            {renderButton()}

            {/* Installation Instructions Modal */}
            <AnimatePresence>
                {showInstructions && (
                    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl relative border border-slate-200 dark:border-slate-800"
                        >
                            <button onClick={() => setShowInstructions(false)} className={`absolute top-6 ${isRTL ? 'left-6' : 'right-6'} p-2 text-slate-400 hover:text-slate-600`}>
                                <X size={24} />
                            </button>
                            
                            <div className="text-center mb-8">
                                <div className="w-20 h-20 bg-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-4 p-2 shadow-xl overflow-hidden">
                                    <img src="/logo.jpg" alt="Logo" className="w-full h-full object-cover rounded-2xl" />
                                </div>
                                <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase transition-colors">
                                    {isIOS ? t('pwa.iosTitle') : t('pwa.title')}
                                </h3>
                                <p className="text-sm text-slate-500 font-bold mt-2">
                                    {isIOS ? t('pwa.iosInstructions') : t('pwa.subtitle')}
                                </p>
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800">
                                    <div className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center shrink-0 font-black">1</div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="text-sm font-bold text-slate-700 dark:text-slate-200 uppercase">
                                            {isIOS ? 'Tap Share' : 'Tap Browser Menu'}
                                        </span>
                                        {isIOS ? <Share size={18} className="text-blue-500" /> : <PlusSquare size={18} className="text-slate-500" />}
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800">
                                    <div className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center shrink-0 font-black">2</div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="text-sm font-bold text-slate-700 dark:text-slate-200 uppercase text-center">
                                            Select "Add to Home Screen"
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => setShowInstructions(false)}
                                className="w-full mt-8 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-lg active:scale-95"
                            >
                                {t('common.toggle') === 'Toggle' ? 'GOT IT!' : 'حسناً!'}
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PWAInstallButton;
