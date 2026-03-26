import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

const Terms = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen bg-[var(--bg-main)] py-32 px-4 flex justify-center">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl w-full bg-[var(--bg-card)] p-12 md:p-16 rounded-[3rem] shadow-2xl border border-[var(--border-color)] prose dark:prose-invert prose-slate prose-lg"
            >
                <h1 className="text-4xl md:text-5xl font-black mb-8 text-[var(--text-main)] font-cairo">Terms of Service</h1>
                <p className="text-[var(--text-muted)] font-medium leading-relaxed mb-6">Last updated: {new Date().toLocaleDateString()}</p>
                
                <h2 className="text-2xl font-bold mt-8 mb-4">1. Acceptance of Terms</h2>
                <p>By accessing and using Aqooni Digital, you accept and agree to be bound by the terms and provision of this agreement. In addition, when using these particular services, you shall be subject to any posted guidelines or rules applicable to such services.</p>

                <h2 className="text-2xl font-bold mt-8 mb-4">2. Description of Service</h2>
                <p>Aqooni Digital provides schools and academic institutions with software for student management, attendance tracking, and digital certificate generation. We guarantee the authenticity of certificates generated through our platform but are not responsible for the accuracy of raw data entered by institutions.</p>

                <h2 className="text-2xl font-bold mt-8 mb-4">3. User Account Responsibilities</h2>
                <p>You are responsible for maintaining the confidentiality of your account and password and for restricting access to your computer or device. You agree to accept responsibility for all activities that occur under your account or password.</p>

                <h2 className="text-2xl font-bold mt-8 mb-4">4. Intellectual Property</h2>
                <p>The Service and its original content, features, and functionality are and will remain the exclusive property of Aqooni Digital and its licensors. The Service is protected by copyright, trademark, and other laws.</p>

                <h2 className="text-2xl font-bold mt-8 mb-4">5. Termination</h2>
                <p>We may terminate or suspend access to our Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.</p>
            </motion.div>
        </div>
    );
};

export default Terms;
