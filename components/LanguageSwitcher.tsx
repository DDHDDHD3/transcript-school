import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const languages = [
    { code: 'ar', name: 'العربية', dir: 'rtl' },
    { code: 'en', name: 'English', dir: 'ltr' },
    { code: 'so', name: 'Soomaali', dir: 'ltr' },
];

const LanguageSwitcher: React.FC = () => {
    const { i18n } = useTranslation();
    const [isOpen, setIsOpen] = React.useState(false);

    const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

    const changeLanguage = (code: string) => {
        i18n.changeLanguage(code);
        document.documentElement.dir = languages.find(l => l.code === code)?.dir || 'ltr';
        setIsOpen(false);
    };

    // Set initial direction
    React.useEffect(() => {
        document.documentElement.dir = currentLanguage.dir;
    }, [currentLanguage.dir]);

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-all border border-slate-200 bg-white shadow-sm"
            >
                <Globe size={18} className="text-qabas-purple" />
                <span>{currentLanguage.name}</span>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div
                            className="fixed inset-0 z-10"
                            onClick={() => setIsOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className={`absolute top-full mt-2 ${i18n.dir() === 'rtl' ? 'left-0' : 'right-0'} w-40 bg-white border border-slate-100 rounded-2xl shadow-xl z-20 overflow-hidden`}
                        >
                            <div className="py-1">
                                {languages.map((lang) => (
                                    <button
                                        key={lang.code}
                                        onClick={() => changeLanguage(lang.code)}
                                        className={`w-full text-right px-4 py-3 text-sm font-medium transition-colors hover:bg-slate-50 flex items-center justify-between ${i18n.language === lang.code ? 'text-qabas-purple bg-purple-50' : 'text-slate-600'
                                            }`}
                                        dir={lang.dir}
                                    >
                                        <span>{lang.name}</span>
                                        {i18n.language === lang.code && (
                                            <div className="w-1.5 h-1.5 rounded-full bg-qabas-purple" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default LanguageSwitcher;
