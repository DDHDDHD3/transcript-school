import React, { useEffect, useState } from 'react';
import {
    getSchools,
    toggleSubscription,
    saveSchool,
    generateUUID,
    logout,
    getAllAdmins,
    updateAdminCredentials,
    getConfig,
    saveConfig,
    changeAdminPassword,
    recordPayment,
    createSchoolAdmin,
    updateBillingDetails,
    getSchoolActivity,
    getSystemSettings,
    saveSystemSettings,
    getGlobalActivity,
    getPendingRegistrations,
    toggleSchoolStatus,
    addCredits,
    updateSchoolProfile,
    getCreditRequests,
    processCreditRequest,
    getContactInquiries,
    updateContactInquiryStatus,
    deleteContactInquiry,
    sendReplyEmail
} from '../services/api';
import { ContactInquiry } from '../types';
import {
    Plus,
    Shield,
    School as SchoolIcon,
    CheckCircle2,
    XCircle,
    Calendar,
    Search,
    LogOut,
    CreditCard,
    Key,
    User,
    Lock,
    Unlock,
    Settings as SettingsIcon,
    RefreshCw,
    Mail,
    Save,
    AlertCircle,
    Activity,
    Image as ImageIcon,
    Type,
    Upload,
    Zap,
    Send,
    Database,
    Hash,
    MapPin,
    Phone
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';
import LanguageSwitcher from '../components/LanguageSwitcher';

const formatTimeAgo = (date: string | Date | null) => {
    if (!date) return 'Never';
    const now = new Date();
    const past = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return past.toLocaleDateString();
};

const SuperDashboard = () => {
    const [schools, setSchools] = useState<any[]>([]);
    const [admins, setAdmins] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const { t } = useTranslation();

    // Direct Edit States
    const [editPlanType, setEditPlanType] = useState('monthly');
    const [editExpiry, setEditExpiry] = useState('');
    const [editTotalPaid, setEditTotalPaid] = useState('');

    const [searchTerm, setSearchTerm] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isManageModalOpen, setIsManageModalOpen] = useState(false);
    const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
    const [selectedSchool, setSelectedSchool] = useState<any>(null);
    const [schoolConfig, setSchoolConfig] = useState<any>(null);
    const [newPass, setNewPass] = useState('');
    const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });
    const [newSchool, setNewSchool] = useState({ name: '', location: '', phoneNumber: '' });
    const [superPass, setSuperPass] = useState('');
    const [monthFilter, setMonthFilter] = useState('all'); // 'all', 'active', 'expired'
    const [paymentAmount, setPaymentAmount] = useState(5);
    const [paymentMonths, setPaymentMonths] = useState(1);
    const [adminEmail, setAdminEmail] = useState('');
    const [adminPass, setAdminPass] = useState('');
    const [feeType, setFeeType] = useState('paid');
    const [editStatus, setEditStatus] = useState('active');
    const [addCreditAmount, setAddCreditAmount] = useState(0);
    const [balance, setBalance] = useState(0);
    const [billingMessage, setBillingMessage] = useState('');
    const [platformLogo, setPlatformLogo] = useState<string | null>(null);
    const [platformName, setPlatformName] = useState('Aqooni Digital');
    const [globalActivity, setGlobalActivity] = useState<any[]>([]);
    const [pendingRegistrations, setPendingRegistrations] = useState<any[]>([]);
    const [creditRequests, setCreditRequests] = useState<any[]>([]);
    const [contactInquiries, setContactInquiries] = useState<ContactInquiry[]>([]);
    const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
    const [selectedInquiry, setSelectedInquiry] = useState<ContactInquiry | null>(null);
    const [replyText, setReplyText] = useState('');
    const [isSendingReply, setIsSendingReply] = useState(false);
    const [schoolCredits, setSchoolCredits] = useState(10);
    const [schoolActivity, setSchoolActivity] = useState<any[]>([]);
    const [editLocation, setEditLocation] = useState('');
    const [editPhone, setEditPhone] = useState('');

    // Platform Settings States
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [logoFile, setLogoFile] = useState<File | null>(null);

    const navigate = useNavigate();

    useEffect(() => {
        fetchInitialData();
        fetchSystemSettingsData();

        // Poll for updates every 15 seconds to keep online status fresh
        const pollInterval = setInterval(() => {
            fetchAdmins();
        }, 15000);

        return () => clearInterval(pollInterval);
    }, []);

    const fetchSystemSettingsData = async () => {
        const settings = await getSystemSettings();
        setPlatformName(settings.name);
        setPlatformLogo(settings.logo);
    };

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const [s, a, gs, pr, cr, ci, ga] = await Promise.all([
                getSchools(),
                getAllAdmins(),
                getSystemSettings(),
                getPendingRegistrations(),
                getCreditRequests(),
                getContactInquiries(),
                getGlobalActivity()
            ]);
            setSchools(s);
            setAdmins(a);
            setPlatformLogo(gs.logo || null);
            setPlatformName(gs.name);
            setPendingRegistrations(pr);
            setCreditRequests(cr);
            setContactInquiries(ci);
            setGlobalActivity(ga);
        } catch (error) {
            console.error("Failed to fetch initial data:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchGlobalActivity = async () => {
        const data = await getGlobalActivity();
        setGlobalActivity(data);
    };

    const fetchPendingRegistrations = async () => {
        const data = await getPendingRegistrations();
        setPendingRegistrations(data);
    };

    const fetchSchools = async () => {
        const data = await getSchools();
        setSchools(data);
    };

    const fetchAdmins = async () => {
        const data = await getAllAdmins();
        setAdmins(data);
    };

    const fetchCreditRequests = async () => {
        const data = await getCreditRequests();
        setCreditRequests(data);
    };

    const handleToggleSub = async (id: string, current: string) => {
        const next = current === 'active' ? 'expired' : 'active';
        await toggleSubscription(id, next);
        fetchSchools();
    };

    const handleCreateSchool = async () => {
        if (!newSchool.name) return;
        const schoolId = generateUUID();
        const success = await saveSchool({
            id: schoolId,
            name: newSchool.name,
            location: newSchool.location,
            phone_number: newSchool.phoneNumber,
            sub_status: 'active',
            sub_expiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        });

        if (success && adminEmail) {
            // Automatically link the pending admin
            await updateAdminCredentials(adminEmail, { schoolId: schoolId });
            setAdminEmail(''); // Reset after use
        }

        setNewSchool({ name: '', location: '', phoneNumber: '' });
        setIsAddModalOpen(false);
        fetchSchools();
        fetchAdmins();
        fetchPendingRegistrations();
    };

    const handleManageSchool = async (school: any) => {
        setSelectedSchool(school);
        const config = await getConfig(school.id);
        setSchoolConfig(config);

        // Initialize Edit States
        setEditPlanType(school.sub_type || 'monthly');
        setEditExpiry(school.sub_expiry ? new Date(school.sub_expiry).toISOString().split('T')[0] : '');
        setEditTotalPaid(school.total_paid || '0');
        setSchoolCredits(school.credits || 0);
        setFeeType(school.fee_type || 'paid');
        setBalance(school.balance || 0);
        setBillingMessage(school.billing_note || '');
        setEditStatus(school.status || 'active');
        setEditLocation(school.location || '');
        setEditPhone(school.phone_number || '');
        setAddCreditAmount(0);

        setIsManageModalOpen(true);
        setStatusMsg({ type: '', text: '' });
        setNewPass('');
        setAdminEmail('');
        setAdminPass('');

        // Fetch activity
        const activity = await getSchoolActivity(school.id);
        setSchoolActivity(activity);
    };

    const handleResetAdminPass = async () => {
        const admin = admins.find(a => a.school_id === selectedSchool.id);
        if (!admin || !newPass) return;

        const success = await updateAdminCredentials(admin.email, { password: newPass });
        if (success) {
            setStatusMsg({ type: 'success', text: t('super.messages.passUpdateSuccess') });
            setNewPass('');
        } else {
            setStatusMsg({ type: 'error', text: t('super.messages.passUpdateError') });
        }
    };

    const handleSaveSchoolConfig = async () => {
        try {
            await saveConfig(schoolConfig, selectedSchool.id);
            setStatusMsg({ type: 'success', text: t('super.messages.configSaveSuccess') });
        } catch (e) {
            setStatusMsg({ type: 'error', text: t('super.messages.configSaveError') });
        }
    };

    const handleSaveChanges = async () => {
        if (!selectedSchool) return;

        if (window.confirm('Are you sure you want to update the subscription details?')) {
            setProcessing(true);

            // Explicitly sync status and sub_status so the school guard picks it up
            await toggleSchoolStatus(selectedSchool.id, editStatus as 'active' | 'pending');

            await updateBillingDetails(selectedSchool.id, {
                plan_type: editPlanType,
                sub_expiry: editExpiry,
                total_paid: Number(editTotalPaid),
            });

            await updateSchoolProfile(selectedSchool.id, {
                location: editLocation,
                phoneNumber: editPhone
            });

            await fetchSchools();
            const schoolsList = await getSchools();
            const freshSchool = schoolsList.find(s => s.id === selectedSchool.id);
            if (freshSchool) setSelectedSchool(freshSchool);

            setStatusMsg({ type: 'success', text: 'Subscription details updated successfully!' });
            setIsManageModalOpen(false);
            setProcessing(false);
        }
    };

    const handleUpdateSuperPass = async () => {
        if (!superPass) return;
        const success = await changeAdminPassword(superPass, 'super@control.com');
        if (success) {
            alert('Super Admin password updated successfully!');
            setSuperPass('');
            setIsSecurityModalOpen(false);
        }
    };

    const handleProcessPayment = async () => {
        if (!selectedSchool || !paymentAmount) return;
        const success = await recordPayment(selectedSchool.id, paymentAmount, paymentMonths);
        if (success) {
            setStatusMsg({ type: 'success', text: t('super.messages.paymentSuccess', { amount: paymentAmount, months: paymentMonths }) });
            fetchSchools();
            // Update selected school local state to reflect changes in modal
            const updated = await getSchools();
            const fresh = updated.find(s => s.id === selectedSchool.id);
            if (fresh) setSelectedSchool(fresh);
        } else {
            setStatusMsg({ type: 'error', text: t('super.messages.paymentError') });
        }
    };

    const handleCreateAdmin = async () => {
        if (!selectedSchool || !adminEmail || !adminPass) return;
        const result = await createSchoolAdmin(adminEmail, adminPass, selectedSchool.id);
        if (result.success) {
            setStatusMsg({ type: 'success', text: t('super.messages.adminCreateSuccess') });
            fetchAdmins();
        } else {
            setStatusMsg({ type: 'error', text: result.error || t('super.messages.adminCreateError') });
        }
    };

    const handleUpdateBilling = async () => {
        if (!selectedSchool) return;
        const success = await updateBillingDetails(selectedSchool.id, {
            fee_type: feeType,
            balance: balance,
            billing_message: billingMessage,
            credits: schoolCredits
        });

        if (addCreditAmount !== 0) {
            await addCredits(selectedSchool.id, addCreditAmount);
        }

        if (success) {
            setStatusMsg({ type: 'success', text: t('super.messages.billingUpdateSuccess') });
            fetchSchools();
            setIsManageModalOpen(false);
        } else {
            setStatusMsg({ type: 'error', text: t('super.messages.billingUpdateError') });
        }
    };

    const handleProcessCreditRequest = async (id: string, status: 'approved' | 'rejected') => {
        setProcessing(true);
        const success = await processCreditRequest(id, status);
        if (success) {
            setCreditRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
            setStatusMsg({ type: 'success', text: `Request ${status} successfully!` });
        } else {
            setStatusMsg({ type: 'error', text: 'Failed to process request.' });
        }
        setProcessing(false);
    };

    const handleUpdateInquiryStatus = async (id: string, status: ContactInquiry['status']) => {
        const success = await updateContactInquiryStatus(id, status);
        if (success) {
            setContactInquiries(prev => prev.map(i => i.id === id ? { ...i, status } : i));
        }
    };

    const handleDeleteInquiry = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this inquiry?')) return;
        const success = await deleteContactInquiry(id);
        if (success) {
            setContactInquiries(prev => prev.filter(i => i.id !== id));
        }
    };

    const handleSendReply = async () => {
        if (!selectedInquiry || !replyText.trim()) return;

        setIsSendingReply(true);
        try {
            const result = await sendReplyEmail(selectedInquiry.id, replyText);
            if (result.success) {
                // Refresh inquiries to show updated status/message
                const updated = await getContactInquiries();
                setContactInquiries(updated);
                setIsReplyModalOpen(false);
                setReplyText('');
                setSelectedInquiry(null);
                alert('Reply sent successfully!');
            } else {
                alert(`Failed to send email: ${result.error}`);
            }
        } catch (error) {
            alert('An error occurred while sending the reply.');
        } finally {
            setIsSendingReply(false);
        }
    };

    const handleActivateSchool = async (schoolId: string) => {
        if (!schoolId) return;
        setProcessing(true);
        const success = await toggleSchoolStatus(schoolId, 'active');
        if (success) {
            setStatusMsg({ type: 'success', text: 'School activated successfully!' });
            fetchInitialData();
        } else {
            setStatusMsg({ type: 'error', text: 'Failed to activate school.' });
        }
        setProcessing(false);
    };

    const isExpiringThisMonth = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    };

    const filteredSchools = schools.filter(s => {
        const matchesSearch =
            s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.phone_number?.toLowerCase().includes(searchTerm.toLowerCase());

        if (monthFilter === 'active') return matchesSearch && s.sub_status === 'active';
        if (monthFilter === 'expired') return matchesSearch && s.sub_status === 'expired';
        return matchesSearch;
    });

    const totalRevenue = schools.reduce((acc, s) => acc + Number(s.total_paid || 0), 0);

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPlatformLogo(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSavePlatformSettings = async () => {
        setProcessing(true);
        const success = await saveSystemSettings({ name: platformName, logo: platformLogo });
        if (success) {
            setStatusMsg({ type: 'success', text: 'Platform settings updated successfully!' });
            setIsSettingsModalOpen(false);
            window.location.reload(); // Reload to apply changes everywhere (simple way for now)
        } else {
            setStatusMsg({ type: 'error', text: 'Failed to save platform settings.' });
        }
        setProcessing(false);
    };

    return (
        <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] flex flex-col font-cairo">
            <div className="p-6 md:p-10 max-w-7xl mx-auto w-full">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white mb-2">{t('super.title')}</h2>
                        <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">{t('super.subtitle')}</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link
                            to="/super/explorer"
                            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3.5 rounded-2xl font-bold shadow-lg shadow-indigo-200 transition-all active:scale-[0.98] text-sm"
                        >
                            <Database size={18} />
                            <span>School Data Explorer</span>
                        </Link>
                        <button
                            onClick={() => {
                                setAdminEmail(''); // Clear any pending selections
                                setIsAddModalOpen(true);
                            }}
                            className="flex items-center gap-2 bg-qabas-purple hover:bg-purple-800 text-white px-6 py-3.5 rounded-2xl font-bold shadow-lg shadow-purple-200 transition-all active:scale-[0.98]"
                        >
                            <Plus size={20} />
                            <span>{t('super.createSchool')}</span>
                        </button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    {[
                        { label: t('super.totalSchools') || 'Total Schools', value: schools.length, color: 'text-purple-700 dark:text-purple-300', bg: 'bg-purple-50 dark:bg-purple-900/40' },
                        { label: t('super.activeSubscriptions') || 'Active Subscriptions', value: schools.filter(s => s.sub_status === 'active').length, color: 'text-emerald-700 dark:text-emerald-300', bg: 'bg-green-50 dark:bg-emerald-900/40' },
                        { label: t('super.pendingOnboarding') || 'Pending Onboarding', value: pendingRegistrations.length, color: 'text-blue-700 dark:text-blue-300', bg: 'bg-blue-50 dark:bg-blue-900/40' },
                    ].map((stat, i) => (
                        <div key={i} className={`${stat.bg} p-6 rounded-3xl border border-slate-100 dark:border-white/10 shadow-sm transition-transform md:hover:scale-[1.02]`}>
                            <p className="text-slate-700 dark:text-slate-300 text-sm font-bold mb-1">{stat.label}</p>
                            <h3 className={`text-2xl md:text-3xl font-black ${stat.color}`}>{stat.value}</h3>
                        </div>
                    ))}
                </div>

                {/* School Data Explorer Banner */}
                <Link
                    to="/super/explorer"
                    className="block mb-10 bg-gradient-to-br from-indigo-600 to-indigo-900 rounded-[32px] p-8 shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all group active:scale-[0.99] overflow-hidden relative"
                >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />
                    <div className="relative z-10 flex items-center justify-between gap-6">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center group-hover:bg-white/20 transition-all">
                                <Database className="text-white" size={32} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest mb-1">Super Admin Tool</p>
                                <h3 className="text-xl font-black text-white">School Data Explorer</h3>
                                <p className="text-indigo-100/90 text-sm font-medium mt-1">
                                    Search any school by name and access its complete data — students, academic records, issued transcripts, and activity logs.
                                </p>
                            </div>
                        </div>
                        <div className="shrink-0 flex items-center gap-2 px-6 py-3 bg-white/20 hover:bg-white/30 rounded-2xl text-white text-xs font-black uppercase tracking-widest transition-all">
                            Open Explorer →
                        </div>
                    </div>
                </Link>

                {/* Platform Branding Section (Direct Access) */}
                <div className="bg-white dark:bg-slate-800 rounded-[32px] p-8 shadow-sm border border-slate-100 dark:border-slate-700/60 mb-10 overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-2 h-full bg-qabas-purple"></div>
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-10">
                        <div className="flex-1 space-y-6 w-full">
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2 mb-2">
                                    <ImageIcon className="text-qabas-purple dark:text-purple-400" size={24} />
                                    {t('super.systemBranding')}
                                </h3>
                                <p className="text-slate-600 dark:text-slate-300 text-sm">{t('super.systemBrandingDesc')}</p>
                            </div>

                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 items-end">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider ml-1">{t('System Name')}</label>
                                    <div className="relative">
                                        <Type className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-400" size={18} />
                                        <input
                                            type="text"
                                            className="w-full pl-12 pr-5 py-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-purple-200 transition-all text-sm"
                                            value={platformName}
                                            onChange={(e) => setPlatformName(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider ml-1">{t('super.updateLogo')}</label>
                                    <label className="cursor-pointer px-6 py-4 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-bold rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-qabas-purple hover:text-qabas-purple transition-all flex items-center justify-center gap-2 h-[60px]">
                                        <Upload className="shrink-0 text-slate-500 dark:text-slate-400" size={18} />
                                        <span className="text-sm truncate">{t('super.uploadLogo')}</span>
                                        <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                                    </label>
                                </div>

                                <div className="md:col-span-2 lg:col-span-1">
                                    <button
                                        onClick={handleSavePlatformSettings}
                                        disabled={processing}
                                        className="w-full py-4 bg-qabas-purple text-white font-bold rounded-2xl shadow-lg shadow-purple-200 hover:bg-purple-800 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 h-[60px]"
                                    >
                                        {processing ? <RefreshCw className="animate-spin" size={20} /> : <Save size={20} />}
                                        <span>{t('super.saveBranding')}</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="shrink-0">
                            <div className="relative group">
                                <div className="absolute inset-0 bg-qabas-purple/10 blur-2xl rounded-full scale-125"></div>
                                <div className="w-24 h-24 bg-white dark:bg-slate-900 rounded-3xl p-4 shadow-xl border border-slate-100 dark:border-slate-700 flex items-center justify-center relative z-10 transition-transform group-hover:scale-105">
                                    {platformLogo ? (
                                        <img src={platformLogo} alt="Preview" className="w-full h-full object-contain" />
                                    ) : (
                                        <ImageIcon className="text-slate-400 dark:text-slate-500" size={40} />
                                    )}
                                </div>
                                <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1.5 rounded-lg shadow-lg z-20">
                                    <CheckCircle2 size={14} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Pending Registrations & Global Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-10">
                    {/* Pending Registrations */}
                    <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-[32px] p-8 shadow-sm border border-slate-100 dark:border-slate-700/60 flex flex-col h-full">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                                <User className="text-blue-500" size={24} />
                                {t('super.pendingRegistrations')}
                            </h3>
                            <span className="bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
                                {pendingRegistrations.length} {t('super.new') || 'New'}
                            </span>
                        </div>

                        <div className="flex-1 overflow-x-auto">
                            {pendingRegistrations.length > 0 ? (
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-slate-100 dark:border-slate-700">
                                            <th className="pb-3 text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('super.table.email')}</th>
                                            <th className="pb-3 text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('super.table.joined')}</th>
                                            <th className="pb-3 text-xs font-black text-slate-500 dark:text-slate-400 uppercase text-center">{t('super.statusHeader') || 'Status'}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                                        {pendingRegistrations.map((reg, i) => (
                                            <tr key={i} className="group">
                                                <td className="py-4">
                                                    <p className="font-bold text-slate-900 dark:text-white text-sm">{reg.email}</p>
                                                    <div className="flex items-center gap-1.5 mt-0.5">
                                                        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                                            New Registration
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="py-4 text-xs font-bold text-slate-600 dark:text-slate-300">
                                                    {formatTimeAgo(reg.created_at)}
                                                </td>
                                                <td className="py-4">
                                                    {reg.school_id && reg.school_status === 'pending' ? (
                                                        <button
                                                            onClick={() => handleActivateSchool(reg.school_id)}
                                                            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-xs font-black rounded-xl shadow-md hover:bg-emerald-700 transition-all"
                                                        >
                                                            <CheckCircle2 size={14} />
                                                            {t('super.activate') || 'Activate'} {reg.school_name ? `(${reg.school_name})` : ''}
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => {
                                                                setAdminEmail(reg.email);
                                                                setIsAddModalOpen(true);
                                                            }}
                                                            className="text-xs font-black text-purple-700 dark:text-purple-400 uppercase tracking-wider hover:underline text-right block w-full"
                                                        >
                                                            {reg.school_id ? (t('super.completeSetup') || 'Complete Setup') : (t('super.setupSchool') || 'Setup School')}
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center py-10 opacity-60">
                                    <User size={40} className="text-slate-400 dark:text-slate-500 mb-2" />
                                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">{t('super.noPendingSignups')}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Global Activity Feed */}
                    <div className="bg-white dark:bg-slate-800 rounded-[32px] p-8 shadow-sm border border-slate-100 dark:border-slate-700/60 flex flex-col h-full">
                        <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2 mb-6">
                            <Activity className="text-qabas-orange" size={24} />
                            {t('super.platformActivity')}
                        </h3>
                        <div className="flex-1 space-y-4 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
                            {globalActivity.length > 0 ? (
                                globalActivity.map((act, i) => (
                                    <div key={i} className="flex gap-4 p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all border border-transparent hover:border-slate-100 dark:hover:border-slate-700">
                                        <div className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center ${act.type === 'Login' ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300' : 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300'
                                            }`}>
                                            {act.type === 'Login' ? <Lock size={18} /> : (act.type === 'Student' ? <Plus size={18} /> : <Activity size={18} />)}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center justify-between gap-2 mb-0.5">
                                                <p className="text-xs font-black text-slate-900 dark:text-white truncate">{act.user.split('@')[0]}</p>
                                                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-tight whitespace-nowrap">{formatTimeAgo(act.timestamp)}</p>
                                            </div>
                                            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-tight mb-1">{act.action}</p>
                                            {act.school_name && (
                                                <p className="text-[10px] px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded font-bold inline-block">{act.school_name}</p>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center py-10 opacity-60">
                                    <Activity size={40} className="text-slate-400 dark:text-slate-500 mb-2" />
                                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">{t('super.noRecentActivity')}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Credit Requests Section */}
                {creditRequests.length > 0 && (
                    <div className="bg-white dark:bg-slate-800 rounded-[32px] p-8 shadow-sm border border-slate-100 dark:border-slate-700/60 mb-10 overflow-hidden">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                                <CreditCard className="text-purple-600 dark:text-purple-400" size={24} />
                                {t('super.rechargeRequests')}
                            </h3>
                            <div className="flex items-center gap-2">
                                <span className="bg-purple-50 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
                                    {creditRequests.filter(r => r.status === 'pending').length} Pending
                                </span>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-slate-100 dark:border-slate-700">
                                        <th className="pb-4 text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('super.table.school')}</th>
                                        <th className="pb-4 text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">Amount</th>
                                        <th className="pb-4 text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">Requested</th>
                                        <th className="pb-4 text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">Notes</th>
                                        <th className="pb-4 text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                                    {creditRequests.map((req, i) => (
                                        <tr key={i} className={`group ${req.status !== 'pending' ? 'opacity-50' : ''}`}>
                                            <td className="py-5">
                                                <p className="font-bold text-slate-900 dark:text-white text-sm">{req.schoolName}</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{req.school_id}</p>
                                            </td>
                                            <td className="py-5 text-center">
                                                <span className="inline-flex items-center px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg font-black text-sm">
                                                    {req.amount}
                                                </span>
                                            </td>
                                            <td className="py-5 text-xs text-slate-600 dark:text-slate-300 font-bold">
                                                {formatTimeAgo(req.createdAt)}
                                            </td>
                                            <td className="py-5">
                                                <p className="text-xs text-slate-600 dark:text-slate-300 max-w-xs truncate font-medium italic">
                                                    "{req.notes || 'No notes provided'}"
                                                </p>
                                            </td>
                                            <td className="py-5 text-right">
                                                {req.status === 'pending' ? (
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => handleProcessCreditRequest(req.id, 'rejected')}
                                                            className="p-2 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all"
                                                            title="Reject"
                                                        >
                                                            <XCircle size={20} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleProcessCreditRequest(req.id, 'approved')}
                                                            className="px-4 py-2 bg-qabas-purple text-white text-xs font-black rounded-xl shadow-md hover:bg-purple-800 transition-all flex items-center gap-2"
                                                        >
                                                            <CheckCircle2 size={14} />
                                                            {t('super.approve')}
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className={`text-xs font-black uppercase tracking-wider px-3 py-1 rounded-lg ${req.status === 'approved' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400'}`}>
                                                        {req.status}
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Contact Inquiries Section */}
                {contactInquiries.length > 0 && (
                    <div className="bg-white dark:bg-slate-800 rounded-[32px] p-8 shadow-sm border border-slate-100 dark:border-slate-700/60 mb-10 overflow-hidden">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                                <Activity className="text-blue-500" size={24} />
                                {t('super.contactInquiries') || 'Contact Inquiries'}
                            </h3>
                            <div className="flex items-center gap-2">
                                <span className="bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
                                    {contactInquiries.filter(i => i.status === 'pending').length} New
                                </span>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-slate-100 dark:border-slate-700">
                                        <th className="pb-4 text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">Date</th>
                                        <th className="pb-4 text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">Name</th>
                                        <th className="pb-4 text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">School/Location</th>
                                        <th className="pb-4 text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">Message</th>
                                        <th className="pb-4 text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                                    {contactInquiries.map((inquiry, i) => (
                                        <tr key={i} className={`group ${inquiry.status === 'read' ? 'opacity-60' : ''}`}>
                                            <td className="py-5 text-xs text-slate-600 dark:text-slate-300 font-bold whitespace-nowrap">
                                                {formatTimeAgo(inquiry.createdAt)}
                                            </td>
                                            <td className="py-5">
                                                <p className="font-bold text-slate-900 dark:text-white text-sm">{inquiry.fullName}</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{inquiry.email}</p>
                                                {inquiry.phone && <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{inquiry.phone}</p>}
                                            </td>
                                            <td className="py-5">
                                                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{inquiry.schoolName}</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">{inquiry.location}</p>
                                            </td>
                                            <td className="py-5 max-w-[220px]">
                                                <p className="text-xs text-slate-600 dark:text-slate-300 italic line-clamp-2 break-words overflow-hidden">
                                                    "{inquiry.message}"
                                                </p>
                                            </td>
                                            <td className="py-5 text-right">
                                                <div className="flex items-center justify-end gap-2 text-right">
                                                    {inquiry.status !== 'replied' && (
                                                        <button
                                                            onClick={() => {
                                                                setSelectedInquiry(inquiry);
                                                                setIsReplyModalOpen(true);
                                                                setReplyText(`Hello ${inquiry.fullName},\n\nThank you for reaching out regarding ${inquiry.schoolName || 'your interest'}. \n\n`);
                                                            }}
                                                            className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-xs font-black rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-all uppercase tracking-wider flex items-center gap-2"
                                                        >
                                                            <Send size={12} />
                                                            Reply
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleDeleteInquiry(inquiry.id)}
                                                        className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all"
                                                        title="Delete"
                                                    >
                                                        <XCircle size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Reply Modal */}
                <AnimatePresence>
                    {isReplyModalOpen && selectedInquiry && (
                        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/70 dark:bg-black/80 backdrop-blur-md">
                            <motion.div
                                initial={{ scale: 0.95, opacity: 0, y: 16 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.95, opacity: 0, y: 16 }}
                                transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                                className="bg-white dark:bg-slate-800 rounded-[28px] w-full max-w-xl shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden flex flex-col max-h-[90vh]"
                            >
                                {/* Modal Header */}
                                <div className="flex items-center justify-between px-7 pt-6 pb-5 border-b border-slate-100 dark:border-slate-700">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/40 rounded-2xl flex items-center justify-center">
                                            <Mail className="text-blue-500" size={20} />
                                        </div>
                                        <div>
                                            <h3 className="text-base font-black text-slate-900 dark:text-white leading-none">Reply to {selectedInquiry.fullName}</h3>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">{selectedInquiry.email}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setIsReplyModalOpen(false)}
                                        className="w-9 h-9 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
                                    >
                                        <XCircle size={20} />
                                    </button>
                                </div>

                                <div className="px-7 py-5 space-y-5 overflow-y-auto flex-1 custom-scrollbar">
                                    {/* Sender Info Row */}
                                    <div className="flex items-center gap-3 flex-wrap">
                                        {selectedInquiry.schoolName && (
                                            <span className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold px-3 py-1.5 rounded-lg">
                                                🏫 {selectedInquiry.schoolName}
                                            </span>
                                        )}
                                        {selectedInquiry.location && (
                                            <span className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold px-3 py-1.5 rounded-lg">
                                                📍 {selectedInquiry.location}
                                            </span>
                                        )}
                                        {selectedInquiry.phone && (
                                            <span className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold px-3 py-1.5 rounded-lg">
                                                📞 {selectedInquiry.phone}
                                            </span>
                                        )}
                                    </div>

                                    {/* Inquiry Message Box */}
                                    <div className="bg-blue-50/60 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/40 rounded-2xl p-4">
                                        <p className="text-xs font-black text-blue-500 dark:text-blue-400 uppercase tracking-wider mb-2">Their Message</p>
                                        <div className="max-h-28 overflow-y-auto custom-scrollbar">
                                            <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed break-words whitespace-pre-wrap">
                                                {selectedInquiry.message}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Reply Textarea */}
                                    <div>
                                        <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Your Response</label>
                                        <textarea
                                            value={replyText}
                                            onChange={(e) => setReplyText(e.target.value)}
                                            rows={5}
                                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all text-slate-900 dark:text-white resize-none leading-relaxed"
                                            placeholder="Write your reply here..."
                                        />
                                    </div>
                                </div>

                                {/* Modal Footer */}
                                <div className="flex items-center gap-3 px-7 py-4 border-t border-slate-100 dark:border-slate-700 shrink-0">
                                    <button
                                        onClick={() => setIsReplyModalOpen(false)}
                                        className="px-6 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-all text-sm"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSendReply}
                                        disabled={isSendingReply || !replyText.trim()}
                                        className="flex-1 py-3 bg-blue-600 text-white font-black rounded-xl shadow-lg hover:bg-blue-700 active:scale-[0.98] transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {isSendingReply ? (
                                            <><RefreshCw className="animate-spin" size={16} /> Sending...</>
                                        ) : (
                                            <><Send size={16} /> Send Reply</>
                                        )}
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* Schools List */}
                <div className="bg-white dark:bg-slate-800 rounded-[32px] shadow-sm border border-slate-100 dark:border-slate-700/60 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search by name, ID, or admin email..."
                                className="w-full pl-12 pr-6 py-3.5 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-purple-200 transition-all text-slate-900 dark:text-white"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700">
                            {['all', 'active', 'expired'].map(mode => (
                                <button
                                    key={mode}
                                    onClick={() => setMonthFilter(mode)}
                                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${monthFilter === mode ? 'bg-white dark:bg-slate-800 text-purple-700 dark:text-purple-300 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                                >
                                    {mode.toUpperCase()}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50/70 dark:bg-slate-900/50">
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('super.schoolBranch')}</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('super.table.progress')}</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('super.schoolStatus')}</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('super.status')}</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('super.expiry')}</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('super.table.students')}</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('super.table.credits')}</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('super.table.phone')}</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('super.table.location')}</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">{t('super.settings')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                                {filteredSchools.map((school) => {
                                    const schoolAdmin = admins.find(a => a.school_id === school.id);
                                    return (
                                        <tr key={school.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-700/30 transition-colors group">
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-2xl flex items-center justify-center text-slate-700 dark:text-slate-200 group-hover:bg-white dark:group-hover:bg-slate-600 transition-all shadow-sm">
                                                        <SchoolIcon size={24} />
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-slate-900 dark:text-white text-sm leading-tight mb-1">{school.name}</p>
                                                        <div className="flex flex-col gap-0.5">
                                                            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                                <Hash size={10} /> {school.id.slice(0, 8)}
                                                            </div>
                                                            <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                                                                <MapPin size={10} /> {school.location || 'Location Not Set'}
                                                            </div>
                                                            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                                                                <Phone size={10} /> {school.phone_number || 'No Phone'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1.5 mb-1">
                                                    <div className="bg-qabas-purple h-1.5 rounded-full" style={{ width: `${school.name && school.location && school.license_number && school.phone_number ? '100%' : '50%'}` }}></div>
                                                </div>
                                                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{school.name && school.location && school.license_number && school.phone_number ? 'Completed' : 'In Progress'}</span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex flex-col gap-2">
                                                    {schoolAdmin ? (
                                                        <>
                                                            <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-black uppercase tracking-wider ${schoolAdmin.has_onboarded ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400'}`}>
                                                                {schoolAdmin.has_onboarded ? 'Ready' : 'In Setup'}
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                {(() => {
                                                                    const lastActive = new Date(schoolAdmin.last_active_at).getTime();
                                                                    const now = new Date().getTime();
                                                                    const isOnline = schoolAdmin.is_online && (now - lastActive < 60000);
                                                                    return (
                                                                        <>
                                                                            <div className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300 dark:bg-slate-600'}`} />
                                                                            <span className={`text-xs font-bold ${isOnline ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}`}>
                                                                                {isOnline ? 'Online' : formatTimeAgo(schoolAdmin.last_active_at)}
                                                                            </span>
                                                                        </>
                                                                    );
                                                                })()}
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <span className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">{t('super.status.noAdmin')}</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <button
                                                    onClick={() => handleToggleSub(school.id, school.sub_status)}
                                                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider transition-all active:scale-[0.98] ${school.sub_status === 'active'
                                                        ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/20'
                                                        : school.sub_status === 'pending'
                                                            ? 'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-500/20 animate-pulse'
                                                            : 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20'
                                                        }`}
                                                >
                                                    {school.sub_status === 'active' ? <CheckCircle2 size={12} /> : school.sub_status === 'pending' ? <RefreshCw size={12} className="animate-spin" /> : <XCircle size={12} />}
                                                    {school.sub_status}
                                                </button>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex flex-col">
                                                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200 mb-1">
                                                        <Calendar size={14} className="text-slate-400 dark:text-slate-400" />
                                                        <span className="text-xs font-bold">{new Date(school.sub_expiry).toLocaleDateString()}</span>
                                                    </div>
                                                    {isExpiringThisMonth(school.sub_expiry) && school.sub_status === 'active' && (
                                                        <span className="text-xs font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider animate-pulse">{t('super.status.expiresSoon')}</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-black text-slate-900 dark:text-white">{school.student_count || 0}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-xs font-black px-2 py-1 rounded-lg ${school.credits > 0 ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400' : 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400'}`}>
                                                        {school.credits} CR
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{school.phone_number || '-'}</p>
                                            </td>
                                            <td className="px-6 py-5">
                                                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{school.location || '-'}</p>
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <button
                                                    onClick={() => handleManageSchool(school)}
                                                    className="p-2 text-slate-500 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-500/10 rounded-xl transition-all"
                                                >
                                                    <SettingsIcon size={20} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div >
            </div >

            {/* School Management Modal */}
            <AnimatePresence>
                {
                    isManageModalOpen && selectedSchool && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsManageModalOpen(false)}
                                className="absolute inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm"
                            />
                            <motion.div
                                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                                className="relative w-full max-w-4xl bg-white dark:bg-slate-800 rounded-[40px] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col border border-slate-100 dark:border-slate-700"
                            >
                                <div className="p-10 overflow-y-auto space-y-10 custom-scrollbar">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 bg-purple-50 dark:bg-purple-900/40 rounded-2xl flex items-center justify-center text-purple-600 dark:text-purple-400">
                                                <SchoolIcon size={30} />
                                            </div>
                                            <div>
                                                <h3 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">{selectedSchool.name}</h3>
                                                <p className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mt-1">
                                                    <Hash size={12} /> {selectedSchool.id}
                                                </p>
                                            </div>
                                        </div>
                                        <button onClick={() => setIsManageModalOpen(false)} className="p-3 bg-slate-100 dark:bg-slate-700 rounded-2xl text-slate-500 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all">
                                            <XCircle size={24} />
                                        </button>
                                    </div>

                                    {/* Quick Identity Bar */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-700 flex items-center gap-4">
                                            <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center text-indigo-500 shadow-sm">
                                                <MapPin size={24} />
                                            </div>
                                            <div>
                                                <p className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Location</p>
                                                <p className="text-sm font-black text-slate-900 dark:text-white">{selectedSchool.location || 'Not Set'}</p>
                                            </div>
                                        </div>
                                        <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-700 flex items-center gap-4">
                                            <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center text-emerald-500 shadow-sm">
                                                <Phone size={24} />
                                            </div>
                                            <div>
                                                <p className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Phone Number</p>
                                                <p className="text-sm font-black text-slate-900 dark:text-white">{selectedSchool.phone_number || 'Not Set'}</p>
                                            </div>
                                        </div>
                                        <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-700 flex items-center gap-4">
                                            <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center text-amber-500 shadow-sm">
                                                <Zap size={24} />
                                            </div>
                                            <div>
                                                <p className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Status</p>
                                                <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{selectedSchool.sub_status}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Tabs Area */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                                        {/* Admin Security */}
                                        <div className="space-y-6">
                                            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 pb-2">
                                                <Key size={18} className="text-amber-500" />
                                                <h4 className="font-bold text-slate-900 dark:text-white">{t('super.manage.adminSecurity')}</h4>
                                            </div>

                                            <div className="space-y-4">
                                                {admins.find(a => a.school_id === selectedSchool.id) ? (
                                                    <>
                                                        <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 relative space-y-3">
                                                            <div>
                                                                <p className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">{t('super.manage.currentAdmin')}</p>
                                                                <p className="text-sm font-bold text-slate-900 dark:text-white">{admins.find(a => a.school_id === selectedSchool.id)?.email || 'None'}</p>
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <label className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider ml-1">{t('super.manage.newPass')}</label>
                                                            <div className="flex gap-2 mt-1">
                                                                <input
                                                                    type="text"
                                                                    value={newPass}
                                                                    onChange={(e) => setNewPass(e.target.value)}
                                                                    className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-900 dark:text-white"
                                                                    placeholder="••••••••"
                                                                />
                                                                <button
                                                                    onClick={handleResetAdminPass}
                                                                    className="px-4 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl shadow-md transition-all active:scale-[0.98]"
                                                                >
                                                                    <RefreshCw size={18} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div className="bg-amber-50/60 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 p-6 rounded-[32px] space-y-4">
                                                        <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 mb-2">
                                                            <AlertCircle size={18} />
                                                            <h5 className="text-xs font-black uppercase tracking-wider">{t('super.status.noAdminAssigned')}</h5>
                                                        </div>
                                                        <div className="space-y-3">
                                                            <div>
                                                                <label className="text-xs font-bold text-amber-700 dark:text-amber-300 pl-1 uppercase">{t('super.label.adminEmail')}</label>
                                                                <input
                                                                    type="email"
                                                                    value={adminEmail}
                                                                    onChange={(e) => setAdminEmail(e.target.value)}
                                                                    placeholder="admin@school.com"
                                                                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-300"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="text-xs font-bold text-amber-700 dark:text-amber-300 pl-1 uppercase">{t('super.manage.initialPassword')}</label>
                                                                <input
                                                                    type="text"
                                                                    value={adminPass}
                                                                    onChange={(e) => setAdminPass(e.target.value)}
                                                                    placeholder="••••••••"
                                                                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-300"
                                                                />
                                                            </div>
                                                            <button
                                                                onClick={handleCreateAdmin}
                                                                className="w-full py-4 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                                                            >
                                                                <Plus size={16} />
                                                                {t('super.manage.createAdminAccount')}
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Activity Log */}
                                        <div className="space-y-6">
                                            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 pb-2">
                                                <Activity size={18} className="text-blue-500" />
                                                <h4 className="font-bold text-slate-900 dark:text-white">{t('super.manage.recentActivity')}</h4>
                                            </div>
                                            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                                {schoolActivity.length > 0 ? (
                                                    schoolActivity.map((act, i) => (
                                                        <div key={i} className="flex flex-col border-b border-slate-100 dark:border-slate-700/50 pb-3 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-700/40 p-2 rounded-xl transition-all">
                                                            <div className="flex justify-between items-center mb-1">
                                                                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${act.type === 'Student Added' ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400' : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'}`}>
                                                                    {act.type}
                                                                </span>
                                                                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">{formatTimeAgo(act.timestamp)}</span>
                                                            </div>
                                                            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{act.action}</p>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="text-center py-10">
                                                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">{t('super.manage.noRecentActivity')}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Financial & Subscription status */}
                                        <div className="space-y-6">
                                            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 pb-2">
                                                <CreditCard size={18} className="text-emerald-500" />
                                                <h4 className="font-bold text-slate-900 dark:text-white">{t('super.manage.activationPayment')}</h4>
                                            </div>

                                            {selectedSchool.sub_status === 'pending' && (
                                                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 p-6 rounded-[32px] space-y-4">
                                                    <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                                                        <Zap size={20} className="animate-pulse" />
                                                        <h5 className="text-sm font-black uppercase tracking-wider">{t('super.manage.manualActivationRequired')}</h5>
                                                    </div>
                                                    <p className="text-xs text-amber-700 dark:text-amber-300 font-medium">{t('super.manage.activationRequestDesc')}</p>
                                                    <button
                                                        onClick={() => {
                                                            setPaymentAmount(5);
                                                            setPaymentMonths(1);
                                                            handleProcessPayment();
                                                        }}
                                                        disabled={processing}
                                                        className="w-full py-4 bg-amber-500 hover:bg-amber-600 text-white font-black rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
                                                    >
                                                        {processing ? <RefreshCw className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
                                                        {t('super.manage.confirmActivateNow', { amount: '$5' })}
                                                    </button>
                                                </div>
                                            )}

                                            <div className="space-y-4">
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                                                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">{t('super.label.phoneNumber')}</p>
                                                        <input
                                                            type="tel"
                                                            value={editPhone}
                                                            onChange={(e) => setEditPhone(e.target.value)}
                                                            className="w-full bg-transparent border-none p-0 text-sm font-black text-slate-900 dark:text-white focus:ring-0"
                                                        />
                                                    </div>
                                                    <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                                                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">{t('super.table.location')}</p>
                                                        <input
                                                            type="text"
                                                            value={editLocation}
                                                            onChange={(e) => setEditLocation(e.target.value)}
                                                            className="w-full bg-transparent border-none p-0 text-sm font-black text-slate-900 dark:text-white focus:ring-0"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                                                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">{t('super.manage.planType')}</p>
                                                        <select
                                                            value={editPlanType}
                                                            onChange={(e) => setEditPlanType(e.target.value)}
                                                            className="w-full bg-transparent border-none p-0 text-sm font-black text-slate-900 dark:text-white focus:ring-0 uppercase cursor-pointer"
                                                        >
                                                            <option value="monthly">{t('MonthlyPlan').split(' ')[0]}</option>
                                                            <option value="yearly">{t('super.plan.yearly')}</option>
                                                            <option value="lifetime">Lifetime</option>
                                                            <option value="custom">Custom</option>
                                                        </select>
                                                    </div>
                                                    <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                                                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">{t('super.statusHeader') || 'Status'}</p>
                                                        <select
                                                            value={editStatus}
                                                            onChange={(e) => setEditStatus(e.target.value)}
                                                            className={`w-full bg-transparent border-none p-0 text-sm font-black focus:ring-0 uppercase cursor-pointer ${editStatus === 'active' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}
                                                        >
                                                            <option value="active">{t('settings.billing.active')}</option>
                                                            <option value="suspended">{t('super.plan.suspended')}</option>
                                                            <option value="pending">{t('super.plan.pending')}</option>
                                                        </select>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                                                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">{t('super.manage.totalEarned')}</p>
                                                        <div className="flex items-center gap-1">
                                                            <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">$</span>
                                                            <input
                                                                type="number"
                                                                value={editTotalPaid}
                                                                onChange={(e) => setEditTotalPaid(e.target.value)}
                                                                className="w-full bg-transparent border-none p-0 text-sm font-black text-emerald-600 dark:text-emerald-400 focus:ring-0"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                                                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">{t('super.manage.expiresOn')}</p>
                                                        <input
                                                            type="date"
                                                            value={editExpiry}
                                                            onChange={(e) => setEditExpiry(e.target.value)}
                                                            className="w-full bg-transparent border-none p-0 text-sm font-black text-slate-900 dark:text-white focus:ring-0"
                                                        />
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={handleSaveChanges}
                                                    className="w-full py-4 bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 text-white font-bold rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
                                                >
                                                    <CheckCircle2 size={18} />
                                                    {t('super.manage.updateSub')}
                                                </button>

                                                {/* Credit Management */}
                                                <div className="bg-amber-50/80 dark:bg-amber-900/20 p-4 rounded-2xl border border-amber-200 dark:border-amber-800/40 flex items-center justify-between">
                                                    <div>
                                                        <p className="text-xs font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider">Add Credits</p>
                                                        <p className="text-xs text-amber-700 dark:text-amber-300 font-bold mt-1">{t('super.topUpBalance')}</p>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => setAddCreditAmount(prev => Math.max(0, prev - 10))}
                                                            className="w-8 h-8 rounded-lg bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-100 flex items-center justify-center font-bold hover:bg-amber-300 transition-colors"
                                                        >-</button>
                                                        <input
                                                            type="number"
                                                            value={addCreditAmount}
                                                            onChange={e => setAddCreditAmount(Number(e.target.value))}
                                                            className="w-16 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-black text-amber-600 dark:text-amber-400 focus:ring-0"
                                                        />
                                                        <button
                                                            onClick={() => setAddCreditAmount(prev => prev + 10)}
                                                            className="w-8 h-8 rounded-lg bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-100 flex items-center justify-center font-bold hover:bg-amber-300 transition-colors"
                                                        >+</button>
                                                    </div>
                                                </div>

                                                {/* Advanced Billing Controls */}
                                                <div className="pt-6 border-t border-slate-100 dark:border-slate-700 space-y-6">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <p className="text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-wider">{t('super.manage.feeCategory')}</p>
                                                            <div className="flex gap-2 mt-2">
                                                                {['paid', 'free'].map(type => (
                                                                    <button
                                                                        key={type}
                                                                        onClick={() => setFeeType(type)}
                                                                        className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${feeType === type ? 'bg-slate-900 dark:bg-slate-700 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400'}`}
                                                                    >
                                                                        {type}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <div className="space-y-4">
                                                            <div className="text-right">
                                                                <p className="text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-wider">Available Credits</p>
                                                                <input
                                                                    type="number"
                                                                    value={schoolCredits}
                                                                    onChange={(e) => setSchoolCredits(Number(e.target.value))}
                                                                    className="w-full mt-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm font-black text-right text-amber-600 dark:text-amber-400 focus:ring-2 focus:ring-amber-200 transition-all"
                                                                />
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-wider">{t('super.manage.balance')}</p>
                                                                <input
                                                                    type="number"
                                                                    value={balance}
                                                                    onChange={(e) => setBalance(Number(e.target.value))}
                                                                    className="w-full mt-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm font-black text-right text-red-600 dark:text-red-400 focus:ring-2 focus:ring-red-200 transition-all"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <label className="text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-wider ml-1 flex items-center gap-1">
                                                            <AlertCircle size={12} />
                                                            {t('super.manage.paymentNote')}
                                                        </label>
                                                        <textarea
                                                            value={billingMessage}
                                                            onChange={(e) => setBillingMessage(e.target.value)}
                                                            placeholder="e.g. Please settle your outstanding balance of $50 by Monday."
                                                            className="w-full mt-2 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 text-sm font-medium h-24 resize-none focus:ring-2 focus:ring-purple-200 text-slate-900 dark:text-white"
                                                        />
                                                    </div>

                                                    <button
                                                        onClick={handleUpdateBilling}
                                                        className="w-full py-4 bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 text-white font-bold rounded-2xl shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                                                    >
                                                        <Save size={18} />
                                                        {t('super.manage.updateBilling')}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {statusMsg.text && (
                                        <div className={`p-4 rounded-2xl flex items-center gap-3 font-bold text-sm ${statusMsg.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400'}`}>
                                            <AlertCircle size={18} />
                                            {statusMsg.text}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        </div>
                    )
                }
            </AnimatePresence>

            {/* Platform Security Modal */}
            <AnimatePresence>
                {
                    isSecurityModalOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 text-right" dir="rtl">
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsSecurityModalOpen(false)} className="absolute inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm" />
                            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative w-full max-w-md bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-[32px] p-8 shadow-2xl">
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                                    <Lock className="text-purple-600 dark:text-purple-400" />
                                    {t('super.security.title')}
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">{t('super.security.changePass')}</label>
                                        <input
                                            type="password"
                                            value={superPass}
                                            onChange={(e) => setSuperPass(e.target.value)}
                                            className="w-full mt-2 px-5 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold text-slate-900 dark:text-white"
                                            placeholder={t('super.security.newPass')}
                                        />
                                    </div>
                                    <button
                                        onClick={handleUpdateSuperPass}
                                        className="w-full py-4 bg-qabas-purple hover:bg-purple-800 text-white font-bold rounded-2xl shadow-md transition-all"
                                    >
                                        {t('super.security.updateBtn')}
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )
                }
            </AnimatePresence>

            {/* Create School Modal */}
            <AnimatePresence>
                {
                    isAddModalOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsAddModalOpen(false)} className="absolute inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm" />
                            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="relative w-full max-w-md bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-[32px] p-8 shadow-2xl">
                                <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/40 rounded-2xl flex items-center justify-center text-purple-600 dark:text-purple-400 mb-6">
                                    <Plus size={24} />
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">{t('super.createSchool')}</h3>
                                <p className="text-slate-600 dark:text-slate-300 text-sm mb-8 leading-relaxed">{t('super.subtitle')}</p>
                                <div className="space-y-4">
                                    <input
                                        type="text"
                                        className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-purple-200 transition-all outline-none"
                                        placeholder="School Name (e.g. Al-Noor Primary)"
                                        value={newSchool.name}
                                        onChange={(e) => setNewSchool({ ...newSchool, name: e.target.value })}
                                    />
                                    <input
                                        type="tel"
                                        className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-purple-200 transition-all outline-none"
                                        placeholder="Phone Number"
                                        value={newSchool.phoneNumber}
                                        onChange={(e) => setNewSchool({ ...newSchool, phoneNumber: e.target.value })}
                                    />
                                    <input
                                        type="text"
                                        className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-purple-200 transition-all outline-none"
                                        placeholder="District / Location"
                                        value={newSchool.location}
                                        onChange={(e) => setNewSchool({ ...newSchool, location: e.target.value })}
                                    />
                                    <button onClick={handleCreateSchool} className="w-full mt-4 py-4 bg-qabas-purple hover:bg-purple-800 text-white font-bold rounded-2xl shadow-md transition-all">
                                        {t('common.confirm')}
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )
                }
            </AnimatePresence>

            {/* Platform Settings Modal */}
            <AnimatePresence>
                {
                    isSettingsModalOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsSettingsModalOpen(false)} className="absolute inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm" />
                            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="relative w-full max-w-md bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-[32px] p-8 shadow-2xl">
                                <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/40 rounded-2xl flex items-center justify-center text-purple-600 dark:text-purple-400 mb-6">
                                    <SettingsIcon size={24} />
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Platform Settings</h3>
                                <p className="text-slate-600 dark:text-slate-300 text-sm mb-8 leading-relaxed">Manage your system name and brand logo across the platform.</p>

                                <div className="space-y-6">
                                    <div>
                                        <label className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider ml-1 mb-2 block">System Name</label>
                                        <div className="relative">
                                            <Type className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-400" size={18} />
                                            <input
                                                type="text"
                                                className="w-full pl-12 pr-5 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-purple-200 transition-all outline-none"
                                                value={platformName}
                                                onChange={(e) => setPlatformName(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider ml-1 mb-2 block">System Logo</label>
                                        <div className="flex flex-col items-center gap-4 p-6 bg-slate-50 dark:bg-slate-900 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                                            {platformLogo ? (
                                                <div className="relative group">
                                                    <img src={platformLogo} alt="Preview" className="w-24 h-24 object-contain rounded-xl bg-white dark:bg-slate-800 p-2 shadow-sm" />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                                                        <ImageIcon className="text-white" size={24} />
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="w-24 h-24 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400">
                                                    <ImageIcon size={32} />
                                                </div>
                                            )}

                                            <label className="cursor-pointer px-4 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm">
                                                <span>{t('super.uploadLogo')}</span>
                                                <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                                            </label>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleSavePlatformSettings}
                                        disabled={processing}
                                        className="w-full mt-4 py-4 bg-qabas-purple hover:bg-purple-800 text-white font-bold rounded-2xl shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                                    >
                                        {processing ? 'Saving...' : <><Save size={20} /> Save Platform Settings</>}
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )
                }
            </AnimatePresence>
        </div>
    );
};

export default SuperDashboard;
