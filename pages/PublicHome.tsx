
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Download, Search, XCircle } from 'lucide-react';
import { getStudentByRegId, getConfig } from '../services/mockBackend';
import { Student, CertificateConfig } from '../types';
import { generateCertificatePDF } from '../utils/pdfGenerator';
import { useLocation } from 'react-router-dom';

const PublicHome = () => {
  const [searchId, setSearchId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Student | null>(null);
  const [error, setError] = useState('');
  const [config, setConfig] = useState<CertificateConfig | null>(null);
  const [previewScale, setPreviewScale] = useState(0.25);
  
  const certificateRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  useEffect(() => {
    getConfig().then(setConfig);
    const params = new URLSearchParams(location.search);
    const idParam = params.get('id');
    if (idParam) {
      setSearchId(idParam);
      handleVerify(idParam);
    }
    
    // Calculate initial scale based on screen width
    const handleResize = () => {
      const width = window.innerWidth;
      const availableWidth = width - 40; 
      let scale = availableWidth / 2480;
      
      // Cap the scale
      if (scale > 0.45) scale = 0.45;
      if (scale < 0.13) scale = 0.13;
      
      setPreviewScale(scale);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [location.search]);

  const handleVerify = async (idToVerify = searchId) => {
    if (!idToVerify.trim()) return;
    
    setLoading(true);
    setResult(null);
    setError('');

    try {
      const student = await getStudentByRegId(idToVerify);
      if (student) {
        setResult(student);
      } else {
        setError('لم يتم العثور على رقم الطالب. يرجى التحقق والمحاولة مرة أخرى.');
      }
    } catch (err) {
      setError('خطأ في النظام. حاول مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async () => {
    if (result && config) {
      setLoading(true);
      await new Promise(r => setTimeout(r, 100)); 
      await generateCertificatePDF(result, 'certificate-view');
      setLoading(false);
    }
  };

  return (
    <div dir="rtl" className="flex flex-col items-center min-h-[calc(100vh-64px)] bg-slate-50 font-sans">
      
      {/* Search Section */}
      {!result && (
        <>
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="w-full max-w-lg mt-10 md:mt-20 px-4 mb-10"
          >
            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-5xl font-black text-qabas-purple mb-4 font-cairo">التحقق من الشهادات</h1>
              <p className="text-slate-500 font-almarai text-lg">أدخل رقم الطالب للتحقق من صحة الشهادة وعرضها</p>
            </div>

            <div className="flex flex-col md:flex-row shadow-2xl shadow-purple-200/50 rounded-2xl bg-white overflow-hidden p-2 border border-purple-100 gap-2">
              <input 
                type="text" 
                placeholder="أدخل رقم الطالب" 
                className="flex-1 px-4 md:px-6 py-3 md:py-4 outline-none text-slate-800 placeholder:text-slate-300 font-bold text-lg md:text-xl text-center md:text-right font-cairo tracking-wide rounded-xl md:rounded-none"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
              />
              <button 
                onClick={() => handleVerify()}
                disabled={loading}
                className="bg-gradient-to-r from-qabas-purple to-purple-800 text-white px-8 py-3 rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70 font-cairo w-full md:w-auto"
              >
                {loading ? <Loader2 className="animate-spin" /> : 'عرض الشهادة'}
              </button>
            </div>
            
             {error && (
               <motion.div 
                 initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                 className="mt-6 p-4 bg-red-50 text-red-700 rounded-xl flex items-center justify-center gap-2 border border-red-100 font-bold font-almarai"
               >
                 <XCircle size={20} /> {error}
               </motion.div>
            )}
          </motion.div>
        </>
      )}

      {/* Certificate Display Area */}
      <AnimatePresence>
        {result && config && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full flex flex-col items-center"
          >
            {/* Action Bar */}
            <div className="sticky top-0 md:top-20 z-40 bg-white/95 backdrop-blur-md w-full border-b border-purple-100 p-4 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4 px-4 md:px-12 rounded-b-2xl">
               <button 
                 onClick={() => { setResult(null); setSearchId(''); }}
                 className="text-slate-500 hover:text-qabas-orange font-bold text-sm font-cairo transition-colors order-2 md:order-1"
               >
                 بحث جديد
               </button>
               <button 
                 onClick={downloadPDF}
                 disabled={loading}
                 className="w-full md:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-qabas-orange to-orange-600 hover:to-orange-700 text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-orange-200 transition-transform hover:scale-105 active:scale-95 font-cairo order-1 md:order-2"
               >
                 {loading ? <Loader2 className="animate-spin" size={20}/> : <Download size={20} />}
                 تحميل الشهادة PDF
               </button>
            </div>

            {/* Scrollable Preview Container */}
            <div className="w-full overflow-auto bg-slate-100 p-4 md:p-8 flex justify-center items-start min-h-screen">
              
              <div 
                className="bg-white shadow-[0_20px_50px_rgba(0,0,0,0.15)] relative"
                style={{ 
                  width: `${2480 * previewScale}px`,
                  height: `${3508 * previewScale}px`,
                }}
              >
                {/* 
                  ACTUAL CERTIFICATE ELEMENT 
                  Dimensions: A4 @ 300 DPI (2480px x 3508px)
                */}
                <div 
                  id="certificate-view" 
                  ref={certificateRef}
                  className="bg-white relative overflow-visible text-slate-900 origin-top-right leading-relaxed font-amiri"
                  dir="rtl"
                  lang="ar"
                  style={{
                    width: '2480px',
                    height: '3508px',
                    transform: `scale(${previewScale})`,
                    fontVariantLigatures: 'common-ligatures',
                    fontFeatureSettings: '"liga" 1, "dlig" 1',
                    textRendering: 'geometricPrecision',
                    letterSpacing: 'normal'
                  }}
                >
                  {/* Decorative Gradient Border */}
                  <div className="absolute top-0 left-0 w-full h-[30px] bg-gradient-to-r from-qabas-orange via-qabas-purple to-qabas-orange"></div>
                  <div className="absolute bottom-0 left-0 w-full h-[30px] bg-gradient-to-r from-qabas-orange via-qabas-purple to-qabas-orange"></div>

                  {/* Outer Frame */}
                  <div className="absolute inset-[40px] border-[10px] border-qabas-purple/10 pointer-events-none rounded-[60px]"></div>
                  <div className="absolute inset-[60px] border-[4px] border-qabas-orange/20 pointer-events-none rounded-[40px]"></div>
                  
                  {/* Inner Content Area */}
                  <div className="w-full h-full p-[80px] pt-[60px] relative z-10 flex flex-col">
                    
                    {/* --- HEADER --- */}
                    <header className="flex flex-col items-center text-center mb-[50px]">
                      {/* Logo Area */}
                      <div className="mb-[30px]">
                         {config.logoUrl ? (
                            <img src={config.logoUrl} className="h-[320px] w-auto object-contain drop-shadow-xl" alt="Logo" />
                         ) : (
                            <div className="h-[300px] w-[300px] bg-slate-50 rounded-full flex items-center justify-center border-4 border-qabas-purple text-qabas-purple text-[40px] font-bold font-cairo">شعار</div>
                         )}
                      </div>

                      <div className="space-y-12 relative">
                         {/* QAHI Purple Title */}
                         <h1 className="text-[110px] text-qabas-purple leading-none tracking-normal drop-shadow-sm font-bold font-amiri pb-4">
                           معهد قبس الهدى للدراسات الشرعية واللغوية
                         </h1>
                         <h2 className="text-[45px] font-bold text-qabas-orange tracking-[0.2em] uppercase font-cairo">
                           {config.schoolNameEn}
                         </h2>
                         {/* Decorative Divider */}
                         <div className="flex items-center justify-center gap-4 mt-6 opacity-60">
                            <div className="w-[300px] h-[4px] bg-qabas-purple rounded-full"></div>
                            <div className="w-[20px] h-[20px] bg-qabas-orange rotate-45"></div>
                            <div className="w-[300px] h-[4px] bg-qabas-purple rounded-full"></div>
                         </div>
                      </div>
                    </header>

                    {/* --- STUDENT INFO CARD (UPDATED GRID) --- */}
                    <div className="bg-gradient-to-br from-purple-50 to-orange-50/30 border-[4px] border-qabas-purple/10 rounded-[50px] p-[50px] mb-[60px] shadow-sm relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-qabas-purple/5 rounded-bl-full"></div>
                      
                      {/* Structured 2x2 Grid for Perfect Alignment */}
                      <div className="grid grid-cols-2 gap-x-[80px] gap-y-[50px] relative z-10">
                         
                         {/* Name */}
                         <div className="flex flex-col gap-2">
                             <span className="text-[45px] font-bold text-qabas-purple font-amiri opacity-80">اسم الطالب :</span>
                             <span className="text-[55px] text-slate-900 font-bold border-b-[3px] border-slate-300/50 pb-2">{result.fullName}</span>
                         </div>
                         
                         {/* ID */}
                         <div className="flex flex-col gap-2">
                             <span className="text-[45px] font-bold text-qabas-purple font-amiri opacity-80">رقم الطالب :</span>
                             <span className="text-[55px] text-qabas-orange font-bold font-cairo tracking-wider border-b-[3px] border-slate-300/50 pb-2" dir="ltr">{result.studentId}</span>
                         </div>

                         {/* Level */}
                         <div className="flex flex-col gap-2">
                             <span className="text-[45px] font-bold text-qabas-purple font-amiri opacity-80">المستوى :</span>
                             <span className="text-[55px] text-slate-900 font-bold border-b-[3px] border-slate-300/50 pb-2">{result.classLevel}</span>
                         </div>

                         {/* Year */}
                         <div className="flex flex-col gap-2">
                             <span className="text-[45px] font-bold text-qabas-purple font-amiri opacity-80">العام الدراسي :</span>
                             <span className="text-[55px] text-slate-900 font-bold font-cairo border-b-[3px] border-slate-300/50 pb-2" dir="ltr">{result.academicYear}</span>
                         </div>

                      </div>
                    </div>

                    {/* --- MARKS TABLE --- */}
                    <div className="flex-1 mb-[40px]">
                       <table className="w-full border-collapse">
                          <thead>
                             <tr className="font-almarai">
                                <th className="bg-qabas-purple text-white py-[30px] text-[50px] font-bold border-b-[8px] border-qabas-orange w-[35%] rounded-tr-3xl">المادة</th>
                                <th className="bg-qabas-purple/90 text-white py-[30px] text-[50px] font-bold border-b-[8px] border-qabas-orange w-[20%]">الدرجة الكاملة</th>
                                <th className="bg-qabas-purple/90 text-white py-[30px] text-[50px] font-bold border-b-[8px] border-qabas-orange w-[20%]">درجة الطالب</th>
                                <th className="bg-qabas-purple text-white py-[30px] text-[50px] font-bold border-b-[8px] border-qabas-orange w-[25%] rounded-tl-3xl">النتيجة</th>
                             </tr>
                          </thead>
                          <tbody className="font-naskh">
                             {result.subjects.map((sub, idx) => (
                               <tr key={idx} className="even:bg-purple-50/50 hover:bg-orange-50/30">
                                  <td className="border-b-[3px] border-slate-200 py-[22px] px-8 text-[50px] font-bold text-slate-800 text-right">{sub.name}</td>
                                  <td className="border-b-[3px] border-slate-200 py-[22px] text-[45px] font-bold text-center text-slate-500 font-cairo">100</td>
                                  <td className="border-b-[3px] border-slate-200 py-[22px] text-[45px] font-bold text-center text-slate-900 font-cairo">{sub.studentMarks}</td>
                                  <td className={`border-b-[3px] border-slate-200 py-[22px] text-[45px] font-bold text-center ${sub.result === 'راسب' ? 'text-red-600' : 'text-green-700'}`}>
                                    {sub.result}
                                  </td>
                               </tr>
                             ))}
                          </tbody>
                       </table>
                    </div>

                    {/* --- SUMMARY SECTION --- */}
                    <div className="flex justify-between items-start mb-[60px] px-[20px] font-cairo">
                       <div className="w-[1100px] border-[4px] border-qabas-purple rounded-[40px] overflow-hidden flex shadow-lg">
                          <div className="flex-1 flex flex-col items-center justify-center bg-white py-6 border-l-[4px] border-qabas-purple">
                             <div className="text-[45px] text-qabas-purple font-bold mb-2">المجموع</div>
                             <div className="text-[55px] font-black text-slate-900">{result.total}</div>
                          </div>
                          <div className="flex-1 flex flex-col items-center justify-center bg-white py-6 border-l-[4px] border-qabas-purple">
                             <div className="text-[45px] text-qabas-purple font-bold mb-2">النسبة المئوية</div>
                             <div className="text-[55px] font-black text-slate-900" dir="ltr">{result.percentage}%</div>
                          </div>
                          <div className="flex-1 flex flex-col items-center justify-center bg-qabas-purple text-white py-6">
                             <div className="text-[45px] font-bold mb-2 opacity-90">النتيجة النهائية</div>
                             <div className="text-[60px] font-black">{result.finalResult}</div>
                          </div>
                       </div>
                    </div>

                    {/* --- FOOTER --- */}
                    <div className="mt-auto px-[60px] pb-[80px]">
                       <div className="flex justify-between items-end">
                          <div className="text-center relative group">
                             <div className="h-[200px] flex items-end justify-center mb-[20px]">
                                {config.managerSignatureUrl ? (
                                   <img src={config.managerSignatureUrl} className="h-full object-contain" alt="Signature" />
                                ) : (
                                   <div className="h-[100px] w-[300px] border-b-[4px] border-slate-300 border-dashed"></div>
                                )}
                             </div>
                             <p className="text-[50px] font-bold text-qabas-purple font-scheherazade">توقيع المدير</p>
                          </div>

                          <div className="relative bottom-8">
                             {config.stampUrl ? (
                                <img src={config.stampUrl} className="w-[350px] h-[350px] object-contain opacity-90 drop-shadow-xl rotate-[-15deg]" alt="Stamp" />
                             ) : (
                                <div className="w-[300px] h-[300px] rounded-full border-[10px] border-qabas-gold text-qabas-gold flex items-center justify-center text-[50px] font-bold rotate-[-15deg] opacity-50 font-amiri">
                                  ختم ذهبي
                                </div>
                             )}
                          </div>

                          <div className="text-center">
                             <div className="h-[200px] flex items-end justify-center mb-[20px]">
                                <span className="text-[50px] font-bold text-slate-800 font-cairo">{new Date().toLocaleDateString('ar-EG')}</span>
                             </div>
                             <p className="text-[50px] font-bold text-qabas-purple font-scheherazade">التاريخ</p>
                          </div>

                       </div>
                    </div>

                  </div>
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PublicHome;
