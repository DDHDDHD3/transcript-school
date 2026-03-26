import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ArrowRight, ArrowLeft, X, CheckCircle2 } from 'lucide-react';
import { markTourComplete } from '../services/api';

interface Step {
    id: string;
    targetId: string;
    title: string;
    content: string;
    position: 'top' | 'bottom' | 'left' | 'right';
}

interface OnboardingTourProps {
    userEmail: string;
    onComplete: () => void;
}

const OnboardingTour: React.FC<OnboardingTourProps> = ({ userEmail, onComplete }) => {
    const { t } = useTranslation();
    const [currentStep, setCurrentStep] = useState(0);
    const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
    const requestRef = useRef<number>();

    const steps: Step[] = [
        {
            id: 'welcome',
            targetId: '', // Center welcome
            title: 'Welcome to Aqooni Digital',
            content: 'Let us show you how to manage your school efficiently. Since you are new, your dashboard is currently empty.',
            position: 'bottom'
        },
        {
            id: 'dashboard',
            targetId: 'tour-dashboard',
            title: 'Grades & Analytics',
            content: 'Click here to see your student performance and school statistics at a glance.',
            position: 'right'
        },
        {
            id: 'students',
            targetId: 'tour-students',
            title: 'Student Management',
            content: 'This is where you add new students and manage their academic results.',
            position: 'right'
        },
        {
            id: 'attendance',
            targetId: 'tour-attendance',
            title: 'Daily Attendance',
            content: 'Record daily presence and generate professional reports for your students here.',
            position: 'right'
        },
        {
            id: 'settings',
            targetId: 'tour-settings',
            title: 'System Settings',
            content: 'Customize your school branding, logos, and system preferences here.',
            position: 'right'
        },
        {
            id: 'finish',
            targetId: '', // Center finish
            title: 'Ready to Start?',
            content: 'First, go to the Students section to add your first student and start filling your dashboard!',
            position: 'bottom'
        }
    ];

    const updateTargetRect = () => {
        const targetId = steps[currentStep].targetId;
        if (targetId) {
            const el = document.getElementById(targetId);
            if (el) {
                setTargetRect(el.getBoundingClientRect());
            } else {
                setTargetRect(null);
            }
        } else {
            setTargetRect(null);
        }
        requestRef.current = requestAnimationFrame(updateTargetRect);
    };

    useEffect(() => {
        requestRef.current = requestAnimationFrame(updateTargetRect);
        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [currentStep]);

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            handleComplete();
        }
    };

    const handlePrev = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleComplete = async () => {
        await markTourComplete(userEmail);
        onComplete();
    };

    const getTooltipPosition = () => {
        if (!targetRect) return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };

        const { top, left, width, height } = targetRect;
        const padding = 40; // Increased padding to avoid spotlight ring

        let t, l, tr;

        switch (steps[currentStep].position) {
            case 'bottom':
                t = top + height + padding;
                l = left + width / 2;
                tr = 'translateX(-50%)';
                break;
            case 'top':
                t = top - padding;
                l = left + width / 2;
                tr = 'translate(-50%, -100%)';
                break;
            case 'left':
                t = top + height / 2;
                l = left - padding;
                tr = 'translate(-100%, -50%)';
                break;
            case 'right':
                t = top + height / 2;
                l = left + width + padding;
                tr = 'translate(0, -50%)';
                break;
            default:
                return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
        }

        // Clamp to screen bounds
        const safeMargin = 20;
        const windowHeight = window.innerHeight;
        const windowWidth = window.innerWidth;

        if (t < safeMargin) t = safeMargin;
        if (t > windowHeight - 300) t = windowHeight - 300; // Assuming max tooltip height
        if (l < safeMargin) l = safeMargin;
        if (l > windowWidth - safeMargin) l = windowWidth - safeMargin;

        return { top: t, left: l, transform: tr };
    };

    const getArrowRotation = () => {
        switch (steps[currentStep].position) {
            case 'bottom': return 'rotate-180';
            case 'top': return 'rotate-0';
            case 'left': return 'rotate-[-90deg]';
            case 'right': return 'rotate-[90deg]';
            default: return '';
        }
    };

    return (
        <div className="fixed inset-0 z-[9999] pointer-events-none overflow-hidden">
            {/* Subtle Backdrop providing focus without hiding the system */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-slate-950/10 backdrop-blur-[2px]"
            />

            {/* Always-Visible Skip Button */}
            <button
                onClick={handleComplete}
                className="absolute top-6 right-6 pointer-events-auto bg-white/10 hover:bg-white/20 text-white/50 hover:text-white px-4 py-2 rounded-full text-xs font-bold border border-white/10 transition-all z-[10001]"
            >
                Skip Tour
            </button>

            <AnimatePresence mode="wait">
                <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="absolute pointer-events-auto bg-white rounded-[32px] shadow-2xl p-8 max-w-sm w-full border border-slate-100 flex flex-col gap-6 z-[10005]"
                    style={getTooltipPosition()}
                >
                    {/* Coordinated Animated Arrow */}
                    {targetRect && (
                        <motion.div
                            animate={{
                                y: steps[currentStep].position === 'bottom' ? [-20, 0, -20] : 0,
                                x: steps[currentStep].position === 'right' ? [-20, 0, -20] : 0,
                                scale: [1, 1.2, 1],
                                rotate:
                                    steps[currentStep].position === 'bottom' ? 0 :
                                        steps[currentStep].position === 'top' ? 180 :
                                            steps[currentStep].position === 'right' ? -90 : 90
                            }}
                            transition={{ repeat: Infinity, duration: 0.8, ease: "easeInOut" }}
                            className="absolute z-[10006] text-white"
                            style={{
                                top: steps[currentStep].position === 'bottom' ? '-50px' : 'auto',
                                bottom: steps[currentStep].position === 'top' ? '-50px' : 'auto',
                                left: steps[currentStep].position === 'right' ? '-50px' : 'auto',
                                right: steps[currentStep].position === 'left' ? '-50px' : 'auto',
                                transform: steps[currentStep].position === 'bottom' || steps[currentStep].position === 'top' ? 'translateX(-50%)' : 'translateY(-50%)'
                            }}
                        >
                            <div className="relative">
                                {/* Glow Effect synchronized with step */}
                                <div className={`absolute inset-0 blur-2xl opacity-40 animate-pulse rounded-full ${currentStep % 2 === 0 ? 'bg-qabas-purple' : 'bg-qabas-orange'}`}></div>
                                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"
                                    className={`drop-shadow-[0_0_15px_rgba(255,255,255,0.8)] relative z-10 ${currentStep % 2 === 0 ? 'text-qabas-purple' : 'text-qabas-orange'}`}>
                                    <path d="M12 19V5" />
                                    <path d="M5 12l7-7 7 7" />
                                </svg>
                            </div>
                        </motion.div>
                    )}

                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-qabas-purple/10 rounded-2xl flex items-center justify-center text-qabas-purple">
                                {currentStep === steps.length - 1 ? <CheckCircle2 size={24} /> : <div className="text-xl font-black">{currentStep + 1}</div>}
                            </div>
                            <h4 className="text-xl font-black text-slate-800 leading-tight">{steps[currentStep].title}</h4>
                        </div>
                        <button
                            onClick={handleComplete}
                            className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <p className="text-slate-600 font-medium leading-relaxed">
                        {steps[currentStep].content}
                    </p>

                    <div className="flex items-center justify-between pt-2">
                        <div className="flex gap-1">
                            {steps.map((_, i) => (
                                <div
                                    key={i}
                                    className={`h-1.5 rounded-full transition-all duration-300 ${i === currentStep ? 'w-6 bg-qabas-purple' : 'w-2 bg-slate-200'}`}
                                />
                            ))}
                        </div>

                        <div className="flex gap-3">
                            {currentStep > 0 && (
                                <button
                                    onClick={handlePrev}
                                    className="p-3 text-slate-400 hover:text-qabas-purple transition-all"
                                >
                                    <ArrowLeft size={20} />
                                </button>
                            )}
                            <button
                                onClick={handleNext}
                                className="flex items-center gap-2 bg-qabas-purple hover:bg-qabas-purple/90 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-purple-100 transition-all active:scale-95"
                            >
                                <span>{currentStep === steps.length - 1 ? 'Finish' : 'Next'}</span>
                                <ArrowRight size={18} />
                            </button>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* "Spotlight" Occlusion Effect */}
            {targetRect && (
                <motion.div
                    initial={false}
                    animate={{
                        top: targetRect.top - 10,
                        left: targetRect.left - 10,
                        width: targetRect.width + 20,
                        height: targetRect.height + 20,
                        opacity: 1
                    }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    className={`absolute border-2 rounded-2xl shadow-[0_0_30px_rgba(255,255,255,0.3)] z-[10000] transition-colors duration-500 ${currentStep % 2 === 0 ? 'border-qabas-purple/50 shadow-purple-500/20' : 'border-qabas-orange/50 shadow-orange-500/20'}`}
                >
                    <div className={`absolute inset-0 rounded-2xl ring-4 animate-pulse ${currentStep % 2 === 0 ? 'ring-qabas-purple/20' : 'ring-qabas-orange/20'}`} />
                </motion.div>
            )}
        </div>
    );
};

export default OnboardingTour;
