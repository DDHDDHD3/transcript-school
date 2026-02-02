
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login, getConfig, recoverPassword } from '../services/mockBackend';
import { Loader2, Lock, Home, HelpCircle, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';

const AdminLogin = () => {
  // Credentials state initialized to empty
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    getConfig().then(config => setLogoUrl(config.logoUrl));
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(email, password);
    if (result.success) {
      localStorage.setItem('cv_user_email', email);
      if (result.role === 'super_admin') {
        navigate('/super');
      } else {
        navigate('/admin/dashboard');
      }
    } else {
      setError(result.error || t('login.errors.invalid'));
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    alert(t('login.errors.contactAdmin') || 'Please contact the system administrator to reset your password.');
  };

  return (
    <div dir={i18n.dir()} className="min-h-screen bg-gradient-to-br from-[#2e1065] via-[#5b21b6] to-[#7c3aed] flex items-center justify-center p-4">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -right-[10%] w-[600px] h-[600px] rounded-full bg-qabas-orange/20 blur-3xl"></div>
        <div className="absolute -bottom-[20%] -left-[10%] w-[600px] h-[600px] rounded-full bg-purple-500/20 blur-3xl"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative z-10"
      >
        <div className="absolute top-0 w-full h-2 bg-gradient-to-r from-qabas-orange via-qabas-purple to-qabas-orange"></div>

        <div className="pt-10 pb-6 px-8 text-center relative">
          <div className="flex justify-center mb-6">
            {logoUrl ? (
              <div className="relative">
                <div className="absolute inset-0 bg-purple-500 blur-2xl opacity-20 rounded-full"></div>
                <img src={logoUrl} alt="Aqooni Logo" className="w-36 h-36 object-contain relative z-10" />
              </div>
            ) : (
              <div className="w-24 h-24 bg-qabas-purple rounded-full flex items-center justify-center text-white font-bold text-2xl">Aqooni Digital</div>
            )}
          </div>
          <h1 className="text-3xl font-black font-cairo text-qabas-purple">{t('common.instituteName')}</h1>
          <p className="text-qabas-orange mt-1 font-bold font-almarai text-sm tracking-wide">{t('login.subtitle')}</p>
        </div>

        <div className="p-8 pt-0">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">{t('login.email')}</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:border-qabas-purple focus:ring-4 focus:ring-purple-50 outline-none transition-all text-left font-medium"
                  dir="ltr"
                  placeholder="admin@aqoonidigital.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">{t('login.password')}</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  className="w-full px-4 py-3.5 pl-12 rounded-xl border border-slate-200 focus:border-qabas-purple focus:ring-4 focus:ring-purple-50 outline-none transition-all text-left font-medium"
                  dir="ltr"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-red-500 text-sm font-bold bg-red-50 p-4 rounded-xl text-center flex items-center justify-center gap-2 border border-red-100">
                <Lock size={16} /> {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-qabas-purple to-[#4c1d95] hover:to-[#5b21b6] text-white font-bold py-4 rounded-xl shadow-xl shadow-purple-200 transition-all active:scale-95 flex justify-center items-center gap-2 text-lg"
            >
              {loading ? <Loader2 className="animate-spin" /> : t('login.loginBtn')}
            </button>

            <div className="flex flex-col items-center gap-3 mt-6">
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-slate-500 hover:text-qabas-purple text-sm font-bold transition-colors flex items-center gap-1"
              >
                <HelpCircle size={16} />
                {t('login.forgotPass')}
              </button>

              <button
                type="button"
                onClick={() => navigate('/')}
                className="w-full bg-white border-2 border-slate-100 hover:border-qabas-orange hover:text-qabas-orange text-slate-600 font-bold py-3.5 rounded-xl transition-all flex justify-center items-center gap-2"
              >
                <Home size={18} />
                {t('login.backHome')}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;