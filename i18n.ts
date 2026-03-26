import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Custom backend to load translations from /locales/{{lng}}.json
// This avoids the need for i18next-http-backend dependency
const customBackend = {
    type: 'backend' as const,
    read(language: string, namespace: string, callback: (err: Error | null, data: any) => void) {
        fetch(`/locales/${language}.json`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`Failed to load translations for ${language}`);
                }
                return response.json();
            })
            .then((data) => {
                callback(null, data);
            })
            .catch((err) => {
                console.error('i18n loading error:', err);
                callback(err, null);
            });
    },
};

i18n
    .use(customBackend)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        fallbackLng: 'ar',
        lng: localStorage.getItem('i18nextLng') || 'ar',
        interpolation: {
            escapeValue: false,
        },
        detection: {
            order: ['querystring', 'cookie', 'localStorage', 'navigator', 'htmlTag', 'path', 'subdomain'],
            caches: ['localStorage', 'cookie'],
        },
    });

export default i18n;
