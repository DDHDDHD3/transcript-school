import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

const Privacy = () => {
    const { t } = useTranslation();

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
                <h1 className="text-4xl md:text-5xl font-black mb-8 text-[var(--text-main)] font-cairo">Privacy Policy</h1>
                <p className="text-[var(--text-muted)] font-medium leading-relaxed mb-6">Last updated: {new Date().toLocaleDateString()}</p>
                <p>At Aqooni Digital, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our school management and certificate verification system.</p>
                
                <h2 className="text-2xl font-bold mt-8 mb-4">1. Information We Collect</h2>
                <p>We collect information that you provide directly to us when you register for an account, subscribe to our services, or contact us for support. We also collect necessary student data required for academic record management and certificate generation by authorized institutions.</p>

                <h2 className="text-2xl font-bold mt-8 mb-4">2. How We Use Your Information</h2>
                <p>We use the information we collect to operate, maintain, and provide the features of our services, to manage your account, to send you administrative communications, and to respond to your comments and questions.</p>

                <h2 className="text-2xl font-bold mt-8 mb-4">3. Data Security</h2>
                <p>We have implemented robust, industry-standard security measures designed to secure your personal information from accidental loss and from unauthorized access, use, alteration, and disclosure. All academic records are cryptographically secured to prevent tampering.</p>

                <h2 className="text-2xl font-bold mt-8 mb-4">4. Sharing of Information</h2>
                <p>We do not sell your personal information. We may share student records only as directed by the respective school administrations and for verification purposes through our public portal when a valid certificate ID is provided.</p>

                <h2 className="text-2xl font-bold mt-8 mb-4">5. Contact Us</h2>
                <p>If you have any questions about this Privacy Policy, please contact us at support@aqooni.digital.</p>
            </motion.div>
        </div>
    );
};

export default Privacy;
