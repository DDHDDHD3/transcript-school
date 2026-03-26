import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  School, 
  MapPin, 
  Mail, 
  Phone, 
  MessageSquare, 
  Send, 
  CheckCircle2, 
  Loader2 
} from 'lucide-react';

import { saveContactInquiry } from '../services/api';

const ContactForm: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    schoolName: '',
    location: '',
    email: '',
    phone: '',
    message: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await saveContactInquiry({
        fullName: formData.fullName,
        schoolName: formData.schoolName,
        location: formData.location,
        email: formData.email,
        phone: formData.phone,
        message: formData.message
      });

      if (result.success) {
        setIsSuccess(true);
        setFormData({
          fullName: '',
          schoolName: '',
          location: '',
          email: '',
          phone: '',
          message: ''
        });
      } else {
        setError(t('SendError'));
      }
    } catch (err) {
      console.error("Submission error:", err);
      setError(err instanceof Error ? err.message : t('SendError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClasses = "w-full bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-800 rounded-[2rem] px-14 py-5 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:bg-white dark:focus:bg-slate-800 focus:border-amber-500/50 transition-all font-bold text-xl tracking-tight shadow-sm";
  const labelClasses = "block text-sm font-black uppercase tracking-[3px] text-purple-900 dark:text-amber-500 mb-3 ml-2";
  const iconClasses = "absolute left-5 top-[60px] text-slate-400 dark:text-slate-500 group-focus-within:text-amber-500 transition-colors";

  return (
    <div className="w-full max-w-4xl mx-auto relative">
      <AnimatePresence>
        {isSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md"
          >
             <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-[3rem] p-12 max-w-2xl w-full text-center shadow-2xl relative overflow-hidden border border-slate-100 dark:border-slate-800"
            >
              {/* Decorative Background Elements */}
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-500 via-purple-600 to-amber-500" />
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-100 dark:bg-amber-900/20 rounded-full blur-3xl opacity-50" />
              <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-100 dark:bg-purple-900/20 rounded-full blur-3xl opacity-50" />

              <div className="w-24 h-24 bg-amber-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl shadow-amber-200 dark:shadow-amber-900/40">
                <CheckCircle2 size={48} className="text-white" />
              </div>

              <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-6 font-cairo">
                {i18n.language === 'ar' ? 'تم الإرسال بنجاح!' : 'Successfully Submitted!'}
              </h2>
              
              <div className="space-y-6 mb-10">
                <p className="text-xl text-slate-600 dark:text-slate-400 font-bold leading-relaxed">
                  {i18n.language === 'ar' 
                    ? 'لقد قمت بإرسال رسالتك بنجاح. يرجى الاتصال بنا إذا كان الأمر عاجلاً.'
                    : 'You have successfully submitted your message. Please contact us if urgent at:'}
                </p>
                <div className="inline-block px-8 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border-2 border-slate-100 dark:border-slate-800">
                  <span className="text-2xl font-black text-purple-900 dark:text-amber-500 tracking-wider">
                    {i18n.language === 'ar' ? '٢٥٢٠٦١٤١٦٣٣٦٢+' : '+2520614163362'}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsSuccess(false)}
                className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black text-xl hover:bg-slate-800 transition-all active:scale-[0.98] shadow-lg shadow-slate-200 uppercase tracking-widest"
              >
                {i18n.language === 'ar' ? 'إغلاق' : 'Close'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="space-y-8"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
          {/* Full Name */}
          <div className="relative group">
            <label className={labelClasses}>{t('FullName')}</label>
            <User size={20} className={iconClasses} />
            <input
              type="text"
              name="fullName"
              required
              placeholder={i18n.language === 'ar' ? 'أدخل اسمك الكامل' : 'Enter your full name'}
              value={formData.fullName}
              onChange={handleChange}
              className={inputClasses}
            />
          </div>

          {/* School Name */}
          <div className="relative group">
            <label className={labelClasses}>{t('SchoolName')}</label>
            <School size={20} className={iconClasses} />
            <input
              type="text"
              name="schoolName"
              required
              placeholder={i18n.language === 'ar' ? 'أدخل اسم المدرسة' : 'Enter school name'}
              value={formData.schoolName}
              onChange={handleChange}
              className={inputClasses}
            />
          </div>

          {/* Location */}
          <div className="relative group">
            <label className={labelClasses}>{t('Location')}</label>
            <MapPin size={20} className={iconClasses} />
            <input
              type="text"
              name="location"
              required
              placeholder={i18n.language === 'ar' ? 'أدخل الموقع' : 'Enter location'}
              value={formData.location}
              onChange={handleChange}
              className={inputClasses}
            />
          </div>

          {/* Email */}
          <div className="relative group">
            <label className={labelClasses}>{t('Email')}</label>
            <Mail size={20} className={iconClasses} />
            <input
              type="email"
              name="email"
              required
              placeholder="example@aqooni.com"
              value={formData.email}
              onChange={handleChange}
              className={inputClasses}
            />
          </div>
        </div>

        {/* Phone Number */}
        <div className="relative group text-left">
          <label className={labelClasses}>{t('PhoneNumber')}</label>
          <Phone size={20} className={iconClasses} />
          <input
            type="tel"
            name="phone"
            required
            dir="ltr"
            placeholder="+252 ..."
            value={formData.phone}
            onChange={handleChange}
            className={inputClasses}
          />
        </div>

        {/* Message */}
        <div className="relative group text-left">
          <label className={labelClasses}>{t('Message')}</label>
          <MessageSquare size={20} className="absolute left-5 top-[60px] text-slate-400 group-focus-within:text-amber-500 transition-colors" />
          <textarea
            name="message"
            required
            rows={5}
            placeholder={i18n.language === 'ar' ? 'كيف يمكننا مساعدتك؟' : 'How can we help you?'}
            value={formData.message}
            onChange={handleChange}
            className={`${inputClasses} resize-none min-h-[150px]`}
          />
        </div>

        {/* Submit Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={isSubmitting}
          type="submit"
          className="w-full py-6 bg-gradient-to-r from-amber-400 to-amber-600 text-slate-950 font-black rounded-2xl shadow-2xl shadow-amber-500/20 hover:shadow-amber-500/40 transition-all flex items-center justify-center gap-3 uppercase tracking-[3px] disabled:opacity-70 group"
        >
          {isSubmitting ? (
            <Loader2 size={24} className="animate-spin" />
          ) : (
            <>
              {t('SendMessage')}
              <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </>
          )}
        </motion.button>

        {error && (
          <p className="text-red-500 font-bold text-center mt-4">
            {error}
          </p>
        )}
      </motion.form>
    </div>
  );
};

export default ContactForm;
