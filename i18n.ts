import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Custom backend to load translations from /locales/{{lng}}.json
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

// Supported languages — English is always the primary/default language
const SUPPORTED_LANGUAGES = ['en', 'ar', 'so'];

// Clear any stale saved language so the system always starts in English
if (typeof window !== 'undefined') {
    localStorage.removeItem('aqooni_lang');
}

i18n
    .use(customBackend)
    .use(initReactI18next)
    .init({
        fallbackLng: 'en',
        lng: 'en',                // Always start in English
        supportedLngs: SUPPORTED_LANGUAGES,
        interpolation: {
            escapeValue: false,
        },
    });

export default i18n;
