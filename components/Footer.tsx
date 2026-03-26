import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Facebook,
    Mail,
    Phone,
    MapPin,
    ExternalLink,
    Smartphone
} from 'lucide-react';
import { motion } from 'framer-motion';
import PWAInstallButton from './PWAInstallButton';

const Footer: React.FC = () => {
    const { t, i18n } = useTranslation();
    const currentYear = new Date().getFullYear();
    const navigate = useNavigate();
    const location = useLocation();

    const scrollToSection = (key: string) => {
        const el = document.getElementById(key);
        if (el) {
            const offset = 100;
            const top = el.getBoundingClientRect().top + window.scrollY - offset;
            window.scrollTo({ top, behavior: 'smooth' });
        }
    };

    const handleNavClick = (e: React.MouseEvent, key: string) => {
        e.preventDefault();
        if (key === 'home') {
            if (location.pathname !== '/' && location.pathname !== '/verify') {
                navigate('/');
            } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
            return;
        }

        if (location.pathname !== '/' && location.pathname !== '/verify') {
            navigate('/');
            setTimeout(() => scrollToSection(key), 300);
        } else {
            scrollToSection(key);
        }
    };

    const socialLinks = [
        { icon: <Facebook size={20} />, href: "https://www.facebook.com/profile.php?id=61583919522261", color: "hover:text-blue-500" },
    ];

    const quickLinks = [
        { label: t('Home'), key: 'home' },
        { label: t('Features'), key: 'features' },
        { label: t('Modules'), key: 'modules' },
        { label: t('Pricing'), key: 'pricing' },
        { label: t('Contact'), key: 'contact' },
        { label: t('FAQs'), key: 'faqs' },
    ];

    return (
        <footer className="relative mt-20 border-t border-[var(--border-color)] bg-[var(--bg-card)] transition-colors duration-300">
            {/* Decorative top gradient */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-qabas-purple/50 to-transparent" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-20">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">

                    {/* Brand Section */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 group">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-qabas-purple to-purple-900 flex items-center justify-center text-white shadow-2xl shadow-purple-200/50 group-hover:scale-110 transition-transform border border-white/20 overflow-hidden shrink-0">
                                <img src="/logo.jpg" alt="Aqooni Logo" className="w-full h-full object-cover" />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-extrabold text-xl tracking-tight text-[var(--text-main)] font-cairo leading-none">Aqooni</span>
                                <span className="text-[10px] text-qabas-orange font-bold uppercase tracking-widest leading-none mt-1">Digital</span>
                            </div>
                        </div>
                        <p className="text-sm text-[var(--text-muted)] leading-relaxed font-medium">
                            {t('footer.aboutDesc')}
                        </p>
                        <div className="space-y-4">
                            <p className="text-sm font-bold text-[var(--text-main)] flex items-center gap-2">
                                <span className="text-[var(--text-muted)]">─</span> Follow us on facebook page
                            </p>
                            <div className="flex items-center gap-4">
                                {socialLinks.map((social, index) => (
                                    <motion.a
                                        key={index}
                                        href={social.href}
                                        whileHover={{ y: -3, scale: 1.1 }}
                                        className={`p-2 rounded-lg bg-[var(--bg-secondary)] text-[var(--text-muted)] ${social.color} transition-all duration-300`}
                                    >
                                        {social.icon}
                                    </motion.a>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-6">
                        <h4 className="text-sm font-black uppercase tracking-[2px] text-[var(--text-main)] flex items-center gap-2">
                            <span className="w-6 h-1 bg-qabas-purple rounded-full" />
                            {t('footer.quickLinks')}
                        </h4>
                        <ul className="space-y-3">
                            {quickLinks.map((link, index) => (
                                <li key={index}>
                                    <button
                                        onClick={(e) => handleNavClick(e, link.key)}
                                        className="text-sm font-bold text-[var(--text-muted)] hover:text-qabas-purple transition-colors flex items-center gap-2 group w-full text-left cursor-pointer"
                                    >
                                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700 group-hover:bg-qabas-purple transition-all" />
                                        {link.label}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-6">
                        <h4 className="text-sm font-black uppercase tracking-[2px] text-[var(--text-main)] flex items-center gap-2">
                            <span className="w-6 h-1 bg-qabas-orange rounded-full" />
                            {t('footer.contact')}
                        </h4>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3">
                                <div className="mt-1 p-2 rounded-lg bg-qabas-purple/5 text-qabas-purple">
                                    <MapPin size={16} />
                                </div>
                                <span className="text-sm font-bold text-[var(--text-muted)] leading-relaxed">
                                    Mogadishu, Somalia
                                </span>
                            </li>
                            <li className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-qabas-purple/5 text-qabas-purple">
                                    <Phone size={16} />
                                </div>
                                <span className="text-sm font-bold text-[var(--text-muted)]" dir="ltr">
                                    +252 0614163362
                                </span>
                            </li>
                            <li className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-qabas-purple/5 text-qabas-purple">
                                    <Mail size={16} />
                                </div>
                                <span className="text-sm font-bold text-[var(--text-muted)]">
                                    support@aqooni.digital
                                </span>
                            </li>
                        </ul>
                    </div>

                    {/* Newsletter / Action */}
                    <div className="space-y-6">
                        <h4 className="text-sm font-black uppercase tracking-[2px] text-[var(--text-main)] flex items-center gap-2">
                            <span className="w-6 h-1 bg-[#fbbf24] rounded-full" />
                            {t('GetStarted')}
                        </h4>
                        <div className="p-6 rounded-2xl bg-gradient-to-br from-qabas-purple/10 via-transparent to-[#fbbf24]/5 border border-qabas-purple/10">
                            <p className="text-xs font-bold text-[var(--text-muted)] mb-4 leading-relaxed">
                                Experience the safest academic record management system.
                            </p>
                            <button onClick={() => navigate('/admin/login')} className="w-full py-3 px-4 bg-gradient-to-r from-amber-400 to-amber-600 text-slate-950 text-xs font-black uppercase tracking-widest rounded-xl hover:shadow-lg hover:shadow-amber-500/30 transition-all flex items-center justify-center gap-2 group mb-3">
                                {t('GetStarted')}
                                <ExternalLink size={14} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                            <PWAInstallButton variant="footer" />
                        </div>
                    </div>

                </div>

                {/* Bottom Bar */}
                <div className="mt-16 pt-8 border-t border-[var(--border-color)] flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden">
                    <p className="text-xs font-bold text-[var(--text-muted)] text-center md:text-left">
                        &copy; {currentYear} Aqooni Digital System. {t('footer.rights')}
                    </p>
                    <div className="flex items-center gap-8">
                        <button onClick={() => { window.scrollTo(0,0); navigate('/privacy'); }} className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)] hover:text-qabas-purple transition-colors bg-transparent border-none cursor-pointer">Privacy</button>
                        <button onClick={() => { window.scrollTo(0,0); navigate('/terms'); }} className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)] hover:text-qabas-purple transition-colors bg-transparent border-none cursor-pointer">Terms</button>
                        <button onClick={() => { window.scrollTo(0,0); navigate('/security'); }} className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)] hover:text-qabas-purple transition-colors bg-transparent border-none cursor-pointer">Security</button>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
