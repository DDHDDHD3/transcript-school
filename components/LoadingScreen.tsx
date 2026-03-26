import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

interface LoadingScreenProps {
    onFinished: () => void;
    duration?: number; // ms to show, default 2800
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ onFinished, duration = 2800 }) => {
    const { t, i18n } = useTranslation();
    const [show, setShow] = useState(true);
    const [progress, setProgress] = useState(0);
    const [phase, setPhase] = useState<'enter' | 'loading' | 'exit'>('enter');

    useEffect(() => {
        // Phase 1: enter animation
        const enterTimer = setTimeout(() => setPhase('loading'), 400);

        // Progress bar animation
        const start = performance.now();
        let raf: number;
        const animate = (now: number) => {
            const elapsed = now - start;
            const pct = Math.min((elapsed / (duration - 600)) * 100, 100);
            setProgress(pct);
            if (pct < 100) {
                raf = requestAnimationFrame(animate);
            }
        };
        raf = requestAnimationFrame(animate);

        // Phase 3: exit, then call onFinished
        const exitTimer = setTimeout(() => setPhase('exit'), duration - 400);
        const doneTimer = setTimeout(onFinished, duration);

        return () => {
            clearTimeout(enterTimer);
            clearTimeout(exitTimer);
            clearTimeout(doneTimer);
            cancelAnimationFrame(raf);
        };
    }, [duration, onFinished]);

    return (
        <div
            className="loading-screen-root"
            dir={i18n.dir()}
            style={{
                opacity: phase === 'exit' ? 0 : 1,
                transform: phase === 'exit' ? 'scale(1.04)' : phase === 'enter' ? 'scale(0.97)' : 'scale(1)',
                transition: 'opacity 0.42s ease, transform 0.42s ease',
            }}
        >
            {/* Animated background orbs */}
            <div className="ls-orb ls-orb-1" />
            <div className="ls-orb ls-orb-2" />
            <div className="ls-orb ls-orb-3" />

            {/* Grid overlay */}
            <div className="ls-grid" />

            {/* Center card */}
            <div className="ls-card" style={{
                opacity: phase === 'enter' ? 0 : 1,
                transform: phase === 'enter' ? 'translateY(24px)' : 'translateY(0)',
                transition: 'opacity 0.5s ease 0.1s, transform 0.5s ease 0.1s',
            }}>

                {/* Logo icon */}
                <div className="ls-logo-wrap">
                    <div className="ls-logo-ring ls-ring-1" />
                    <div className="ls-logo-ring ls-ring-2" />
                    <div className="ls-logo-core">
                        <img
                            src="/logo.jpg"
                            alt="System Logo"
                            className="ls-logo-img"
                        />
                    </div>
                </div>

                {/* Brand name */}
                <h1 className="ls-title">
                    <span className="ls-title-aqooni">Aqooni</span>
                    <span className="ls-title-digital"> Digital</span>
                </h1>
                <p className="ls-subtitle">{t('loadingSubtitle')}</p>

                {/* Animated dots row */}
                <div className="ls-dots">
                    {[0, 1, 2].map(i => (
                        <span key={i} className="ls-dot" style={{ animationDelay: `${i * 0.18}s` }} />
                    ))}
                </div>

                {/* Progress bar */}
                <div className="ls-progress-track">
                    <div
                        className="ls-progress-fill"
                        style={{ width: `${progress}%` }}
                    />
                    <div className="ls-progress-glow" style={{ left: `${progress}%` }} />
                </div>

                <p className="ls-hint">{t('loading')}</p>
            </div>

            {/* Bottom tagline */}
            <div className="ls-footer" style={{
                opacity: phase === 'enter' ? 0 : 0.55,
                transition: 'opacity 0.5s ease 0.3s',
            }}>
                Powered by Aqooni Digital • © 2026
            </div>
        </div>
    );
};

export default LoadingScreen;
