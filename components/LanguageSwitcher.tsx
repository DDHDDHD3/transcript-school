import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const languages = [
    { code: 'en', name: 'English', flagSrc: 'https://flagcdn.com/w40/gb.png', dir: 'ltr' },
    { code: 'ar', name: 'العربية', flagSrc: 'https://flagcdn.com/w40/sa.png', dir: 'rtl' },
    { code: 'so', name: 'Soomaali', flagSrc: 'https://flagcdn.com/w40/so.png', dir: 'ltr' },
];

const LanguageSwitcher: React.FC = () => {
    const { t, i18n } = useTranslation();
    const [isOpen, setIsOpen] = React.useState(false);

    const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

    const changeLanguage = (code: string) => {
        i18n.changeLanguage(code);
        document.documentElement.dir = languages.find(l => l.code === code)?.dir || 'ltr';
        setIsOpen(false);
    };

    React.useEffect(() => {
        document.documentElement.dir = currentLanguage.dir;
    }, [currentLanguage.dir]);

    return (
        <div className="relative">
            <button
                id="lang-switcher"
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl font-bold text-sm transition-all
                           bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/20 
                           text-slate-700 dark:text-white
                           hover:bg-slate-200 dark:hover:bg-white/20 hover:border-amber-400/50
                           active:scale-95"
            >
                <Globe size={18} className="text-amber-400 shrink-0" />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <div
                            className="fixed inset-0 z-10"
                            onClick={() => setIsOpen(false)}
                        />
                        {/* Dropdown */}
                        <motion.div
                            initial={{ opacity: 0, y: 8, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 8, scale: 0.95 }}
                            transition={{ duration: 0.15, ease: 'easeOut' }}
                            className={`absolute top-full mt-3 ${i18n.dir() === 'rtl' ? 'left-0' : 'right-0'} 
                                        w-52 z-20 overflow-hidden
                                        bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-white/20 rounded-2xl
                                        shadow-[0_20px_60px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.6)] backdrop-blur-xl`}
                        >
                            {/* Header */}
                            <div className="px-4 py-3 border-b border-slate-200 dark:border-white/10">
                                <p className="text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400">
                                    {t('common.selectLanguage')}
                                </p>
                            </div>

                            {/* Options */}
                            <div className="p-2">
                                {languages.map((lang) => {
                                    const isActive = i18n.language === lang.code;
                                    return (
                                        <button
                                            key={lang.code}
                                            onClick={() => changeLanguage(lang.code)}
                                            dir={lang.dir}
                                            className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all
                                                ${isActive
                                                    ? 'bg-amber-400/15 text-amber-600 dark:text-amber-300 border border-amber-400/30'
                                                    : 'text-slate-600 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white border border-transparent'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={lang.flagSrc}
                                                    alt={lang.name}
                                                    className="w-6 h-4 object-cover rounded-sm shadow-sm shrink-0"
                                                />
                                                <span className="font-bold text-slate-800 dark:text-white text-sm tracking-wide">
                                                    {lang.name}
                                                </span>
                                            </div>
                                            {isActive && (
                                                <Check size={14} className="text-amber-400 shrink-0" />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default LanguageSwitcher;
