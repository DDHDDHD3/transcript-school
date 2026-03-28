import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

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

// Supported languages — English is the default
const SUPPORTED_LANGUAGES = ['en', 'ar', 'so'];
const savedLang = localStorage.getItem('aqooni_lang');
const defaultLang = savedLang && SUPPORTED_LANGUAGES.includes(savedLang) ? savedLang : 'en';

i18n
    .use(customBackend)
    .use(initReactI18next)
    .init({
        fallbackLng: 'en',
        lng: defaultLang,
        supportedLngs: SUPPORTED_LANGUAGES,
        interpolation: {
            escapeValue: false,
        },
    });

export default i18n;
