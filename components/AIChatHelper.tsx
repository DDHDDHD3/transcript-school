import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User as UserIcon, MessageSquare, ChevronDown, RotateCcw, XCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const WA_LINK = 'https://wa.me/252614163362';

type Message = {
  id: string;
  role: 'user' | 'model';
  text: string;
};

const AIChatHelper = ({ context = 'public' }: { context?: 'public' | 'dashboard' }) => {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Quick Reply Options
  const quickReplies = context === 'dashboard'
    ? [
      { text: i18n.language === 'ar' ? 'بدء محادثة جديدة' : (i18n.language === 'so' ? 'Bilow sheeko cusub' : 'Create New Conversation'), action: 'reset' },
      { text: i18n.language === 'ar' ? 'كيفية إدارة الطلاب؟' : 'How to manage students?', value: 'How do I manage student records?' },
      { text: i18n.language === 'ar' ? 'تقارير الحضور' : 'Attendance reports', value: 'Tell me about attendance reports.' },
      { text: i18n.language === 'ar' ? 'إعدادات النظام' : 'System settings', value: 'Help me with system settings.' }
    ]
    : [
      { text: i18n.language === 'ar' ? 'محادثة جديدة' : (i18n.language === 'so' ? 'Sheeko cusub' : 'New Conversation'), action: 'reset' },
      { text: i18n.language === 'ar' ? 'ما هي المميزات؟' : 'What are the features?', value: 'What are the key features of Aqooni Digital?' },
      { text: i18n.language === 'ar' ? 'خطط الأسعار' : 'Pricing plans', value: 'Tell me about pricing plans and subscriptions.' },
      { text: i18n.language === 'ar' ? 'كيفية التسجيل؟' : 'How to register?', value: 'How can I register my school?' }
    ];

  // Initial welcome message based on context
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMsg = context === 'dashboard'
        ? (i18n.language === 'ar' ? 'مرحباً بك في لوحة تحكم المدرسة! كيف يمكنني مساعدتك في إدارة نظامك اليوم؟' : (i18n.language === 'so' ? 'Ku soo dhawoow Xogta Maamulka Dugsiga! Sideen kaaga caawin karaa nidaamkaaga maanta?' : 'Welcome to the School Dashboard! How can I help you manage your system today?'))
        : (i18n.language === 'ar' ? 'مرحباً بك في أقوني ديجيتال! أنا مساعدك الذكي. كيف يمكنني إفادتك؟' : (i18n.language === 'so' ? 'Ku soo dhawoow Aqooni Digital! Waxaan ahay caawiyahaaga casriga ah. Sideen ku caawin karaa?' : 'Welcome to Aqooni Digital! I am your AI assistant. How can I help you?'));

      setMessages([{ id: 'welcome', role: 'model', text: welcomeMsg }]);
    }
  }, [context, i18n.language]);

  // Auto-scroll
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  const handleSend = async (overrideText?: string) => {
    const textToSend = overrideText || input;
    if (!textToSend.trim() || isTyping) return;

    const userText = textToSend.trim();
    const newUserMsg: Message = { id: Date.now().toString(), role: 'user', text: userText };
    setMessages(prev => [...prev, newUserMsg]);
    setInput('');
    setIsTyping(true);

    try {
      // Build conversation history for Gemini, explicitly ignoring the front-end local welcome message
      const geminiHistory = messages
        .filter(msg => msg.id !== 'welcome')
        .map(msg => ({
          role: msg.role === 'model' ? 'model' : 'user',
          parts: [{ text: msg.text }]
        }));

      // Add the current user message as the final entry
      geminiHistory.push({
        role: 'user',
        parts: [{ text: userText }]
      });

      // System prompt context
      const systemContext = context === 'dashboard'
        ? "You are a helpful IT support assistant for school administrators using the Aqooni Digital school management dashboard. Be concise, professional, and helpful."
        : "You are a friendly customer support AI for Aqooni Digital, an innovative school management platform. Answer questions politely and encourage users to use the WhatsApp link for human support if needed.";

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: geminiHistory,
          system_instruction: {
            parts: [{ text: systemContext }]
          }
        })
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Gemini API Error Detail:', data);
        throw new Error(data.error?.message || `API Error: ${response.status}`);
      }

      if (data.candidates && data.candidates[0].content.parts[0].text) {
        const aiText = data.candidates[0].content.parts[0].text;
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: aiText }]);
      } else {
        throw new Error('Invalid response structure from AI');
      }
    } catch (error: any) {
      console.error('Gemini API Error:', error);
      const errorMsg = i18n.language === 'ar' ? `عذراً، حدث خطأ: ${error.message}` : (i18n.language === 'so' ? `Waan ka xunnahay: ${error.message}` : `Support: ${error.message}`);
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: errorMsg }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleNewChat = () => {
    const welcomeMsg = context === 'dashboard' 
      ? (i18n.language === 'ar' ? 'مرحباً بك في لوحة تحكم المدرسة! كيف يمكنني مساعدتك في إدارة نظامك اليوم؟' : (i18n.language === 'so' ? 'Ku soo dhawoow Xogta Maamulka Dugsiga! Sideen kaaga caawin karaa nidaamkaaga maanta?' : 'Welcome to the School Dashboard! How can I help you manage your system today?'))
      : (i18n.language === 'ar' ? 'مرحباً بك في أقوني ديجيتال! أنا مساعدك الذكي. كيف يمكنني إفادتك؟' : (i18n.language === 'so' ? 'Ku soo dhawoow Aqooni Digital! Waxaan ahay caawiyahaaga casriga ah. Sideen ku caawin karaa?' : 'Welcome to Aqooni Digital! I am your AI assistant. How can I help you?'));
    setMessages([{ id: 'welcome', role: 'model', text: welcomeMsg }]);
  };

  const handleCancel = () => {
    setIsTyping(false);
    setMessages(prev => [...prev, { id: `cancel-${Date.now()}`, role: 'model', text: i18n.language === 'ar' ? 'تم إلغاء العملية.' : (i18n.language === 'so' ? 'Waa la joojiyay.' : 'Operation cancelled.') }]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end pointer-events-none">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="w-[380px] max-w-[calc(100vw-24px)] h-[580px] max-h-[calc(100vh-80px)] bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl sm:rounded-3xl mb-4 flex flex-col overflow-hidden pointer-events-auto border-b-4 border-b-yellow-500/50"
            dir={i18n.dir()}
          >
            {/* Header */}
            <div className="bg-gradient-to-br from-violet-900 via-purple-800 to-indigo-950 p-5 text-white flex justify-between items-center shadow-lg relative overflow-hidden shrink-0">
              {/* Decorative background glow */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 blur-3xl -mr-16 -mt-16 rounded-full" />

              <div className="flex items-center gap-3 z-10">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center border-2 border-white/20 shadow-xl overflow-hidden shrink-0">
                  <img src="/logo.jpg" alt="Logo" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="font-black text-xl tracking-tighter uppercase leading-tight text-yellow-400">Aqooni AI</h3>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.5)]" />
                    <p className="text-[10px] text-purple-200 uppercase tracking-widest font-bold">
                      {context === 'dashboard' ? 'System Expert' : 'Support Agent'}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={handleNewChat}
                  className="p-2.5 bg-white/10 hover:bg-white/20 rounded-2xl transition-all hover:scale-110 active:scale-90 z-10 border border-white/10 shadow-sm text-yellow-400"
                  title={i18n.language === 'ar' ? 'محادثة جديدة' : 'New Conversation'}
                >
                  <RotateCcw size={22} strokeWidth={2.5} />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2.5 bg-white/10 hover:bg-white/20 rounded-2xl transition-all hover:scale-110 active:scale-90 z-10 border border-white/10 shadow-sm text-yellow-400"
                  title={i18n.language === 'ar' ? 'تصغير' : 'Minimize'}
                >
                  <ChevronDown size={24} strokeWidth={3} />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950 custom-scrollbar">
              {messages.map((msg) => (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-3 max-w-[92%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border-2 shadow-sm overflow-hidden ${msg.role === 'user'
                        ? 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                        : 'bg-white border-purple-500/20'
                      }`}>
                      {msg.role === 'user' ? (
                        <UserIcon size={16} className="text-slate-600 dark:text-slate-400" />
                      ) : (
                        <img src="/logo.jpg" alt="AI" className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className={`p-4 rounded-3xl text-[16px] leading-relaxed relative ${msg.role === 'user'
                        ? 'bg-gradient-to-br from-purple-600 to-violet-700 text-white rounded-tr-none shadow-md'
                        : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-none shadow-sm border border-slate-100 dark:border-slate-700/50'
                      }`}>
                      <p className="whitespace-pre-wrap font-medium">{msg.text}</p>
                      {msg.role === 'model' && msg.id === 'welcome' && (
                        <div className="mt-4 flex flex-wrap gap-2 pt-2 border-t border-slate-100 dark:border-slate-700/50">
                          {quickReplies.map((reply, i) => (
                            <button
                              key={i}
                              onClick={() => reply.action === 'reset' ? handleNewChat() : handleSend(reply.value)}
                              className="text-[13px] font-black py-2.5 px-4 rounded-xl bg-yellow-500/5 hover:bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-2 border-yellow-500/20 transition-all hover:-translate-y-0.5"
                            >
                              {reply.text}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex gap-3 max-w-[85%]">
                    <div className="w-10 h-10 rounded-2xl bg-white border-2 border-purple-500/20 flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
                      <img src="/logo.jpg" alt="AI" className="w-full h-full object-cover" />
                    </div>
                    <div className="p-4 bg-white dark:bg-slate-800 rounded-3xl rounded-tl-none shadow-sm border border-slate-100 dark:border-slate-700/50 flex gap-2 items-center h-14">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce [animation-delay:0ms]" />
                      <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce [animation-delay:200ms]" />
                      <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce [animation-delay:400ms]" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Footer / Input Area */}
            <div className="p-5 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 shrink-0 pointer-events-auto shadow-[0_-4px_20px_rgba(0,0,0,0.02)]">
              <div className="flex gap-3">
                {isTyping && (
                  <button
                    onClick={handleCancel}
                    className="p-3 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-2xl transition-all border border-red-500/20 mr-2 group"
                    title={i18n.language === 'ar' ? 'إلغاء' : 'Cancel'}
                  >
                    <XCircle size={22} className="group-hover:rotate-90 transition-transform" />
                  </button>
                )}
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={i18n.language === 'ar' ? 'اكتب رسالتك...' : 'Ask me anything...'}
                  className="flex-1 bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-700/30 rounded-2xl px-5 py-4 text-base font-medium focus:ring-2 focus:ring-purple-500 focus:bg-white dark:focus:bg-slate-800 outline-none transition-all text-slate-900 dark:text-white"
                  disabled={isTyping}
                />
                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isTyping}
                  className="w-14 h-14 bg-gradient-to-br from-violet-600 to-indigo-900 text-yellow-400 rounded-2xl flex items-center justify-center hover:brightness-110 disabled:grayscale disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-lg active:scale-95 shrink-0 group border border-purple-500/20 font-black"
                >
                  <Send size={24} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </button>
              </div>

              {/* Action Links */}
              <div className="mt-4 flex justify-center gap-4">
                <a
                  href={WA_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-[11px] text-emerald-600 dark:text-emerald-400 font-black hover:opacity-80 transition-all uppercase tracking-tighter"
                >
                  <div className="w-5 h-5 bg-emerald-500 rounded-lg flex items-center justify-center text-white shadow-sm">
                    <MessageSquare size={12} />
                  </div>
                  {i18n.language === 'ar' ? 'واتساب' : 'WhatsApp Expert'}
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Buttons Area */}
      <div className="flex items-center gap-3 sm:gap-4 mt-4 pointer-events-auto pr-2">
        {/* Help Pulse */}
        {!isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/90 dark:bg-slate-900/90 backdrop-blur px-4 py-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl text-[11px] font-black uppercase text-purple-600 dark:text-purple-400 tracking-widest hidden md:block"
          >
            {i18n.language === 'ar' ? 'هل تحتاج مساعدة؟' : 'Need Help?'}
          </motion.div>
        )}

        {/* WhatsApp Icon */}
        <motion.a
          href={WA_LINK}
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.9 }}
          title={i18n.language === 'ar' ? 'واتساب' : 'WhatsApp'}
          className="w-12 h-12 sm:w-15 sm:h-15 bg-gradient-to-br from-emerald-400 to-emerald-600 text-white rounded-xl sm:rounded-3xl flex items-center justify-center shadow-xl shadow-emerald-500/20 border-2 sm:border-4 border-white dark:border-slate-900"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 sm:w-8 sm:h-8 drop-shadow-md">
            <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.099.824zm-3.423-14.416c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm.031 22.189c-1.85 0-3.626-.474-5.216-1.373l-5.797 1.522 1.545-5.655c-.99-1.637-1.514-3.535-1.514-5.467 0-5.631 4.583-10.214 10.214-10.214s10.214 4.583 10.214 10.214c0 5.632-4.583 10.214-10.214 10.214z" />
          </svg>
        </motion.a>

        {/* AI Chat Button */}
        <motion.button
          whileHover={{ scale: 1.1, rotate: -5 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsOpen(!isOpen)}
          className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-violet-600 via-purple-700 to-indigo-900 text-white rounded-xl sm:rounded-3xl flex items-center justify-center shadow-2xl shadow-purple-900/40 border-2 sm:border-4 border-white dark:border-slate-900 transition-all relative"
        >
          {isOpen ? <X size={24} className="sm:size-7" /> : (
            <>
              <MessageCircle size={28} className="sm:size-8" />
              <div className="absolute top-0 right-0 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-yellow-400 rounded-full border-2 border-white dark:border-slate-900 animate-bounce" />
            </>
          )}
        </motion.button>
      </div>
    </div>
  );
};

export default AIChatHelper;
