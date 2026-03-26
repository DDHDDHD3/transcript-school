/** @type {import('tailwindcss').Config} */
export default {
    // ⚡ CRITICAL: This makes dark: classes respond to the .dark class on <html>
    // instead of the OS media query. Our ThemeContext adds/removes .dark on <html>.
    darkMode: 'class',
    content: [
        "./index.html",
        "./**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'qabas-purple': '#5b21b6',
                'qabas-purple-light': '#7c3aed',
                'qabas-orange': '#fbbf24',
                'accent-gold': '#fbbf24',
            },
            fontFamily: {
                cairo: ['Cairo', 'sans-serif'],
                almarai: ['Almarai', 'sans-serif'],
            },
        },
    },
    plugins: [],
};
