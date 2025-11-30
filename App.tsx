import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import PrivacyModal from './components/PrivacyModal';
import { AppSection } from './types';
import { NumerologySection, MedicalSection, DocumentSection, GeneralAISection, ContactSection, PrayerTimesSection, HoroscopeSection, BlackMagicSection, WazaifSection, TimeScienceSection, CalendarSection } from './components/FeatureComponents';
import { Clock, Moon, Shield, Sun, Star, Stethoscope, Calculator, BookOpen, Phone, FileText, ArrowRight, CalendarDays, Sparkles, MoveLeft } from 'lucide-react';

// --- Welcome Screen Component ---
const WelcomeScreen = ({ onEnter }: { onEnter: () => void }) => {
  return (
    <div className="fixed inset-0 z-[200] bg-gradient-to-br from-emerald-900 via-teal-900 to-emerald-950 flex flex-col items-center justify-center text-white p-6 animate-fade-in">
      
      {/* Background Decorations */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-emerald-500 rounded-full mix-blend-overlay filter blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-yellow-500 rounded-full mix-blend-overlay filter blur-3xl opacity-10 animate-pulse" style={{animationDelay: '1.5s'}}></div>
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] opacity-10"></div>

      {/* Content Container */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-md w-full">
        
        {/* Animated Logo */}
        <div className="w-32 h-32 mb-8 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center shadow-2xl border border-white/20 animate-bounce-slow ring-4 ring-white/5">
           <svg viewBox="0 0 100 100" className="w-24 h-24 overflow-visible" xmlns="http://www.w3.org/2000/svg">
              <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-emerald-200 opacity-40" />
              <path d="M60 30 A 30 30 0 1 1 35 75 A 24 24 0 1 0 60 30" fill="currentColor" className="text-yellow-400 drop-shadow-md" />
              <path d="M80 20 L82 26 L88 26 L83 30 L85 36 L80 32 L75 36 L77 30 L72 26 L78 26 Z" fill="currentColor" className="text-orange-300" />
              <g transform="translate(70, 65) rotate(-10)">
                <rect x="4" y="0" width="4" height="12" rx="1" fill="currentColor" className="text-red-400" />
                <rect x="0" y="4" width="12" height="4" rx="1" fill="currentColor" className="text-red-400" />
              </g>
              <path d="M25 80 Q 10 70 20 55 Q 35 40 50 55" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-green-400" />
              <path d="M20 55 Q 35 40 50 55" fill="currentColor" className="text-green-500/80" />
           </svg>
        </div>

        {/* Title & Tagline */}
        <h1 className="text-3xl md:text-4xl font-bold mb-2 tracking-wide drop-shadow-lg text-transparent bg-clip-text bg-gradient-to-b from-white to-emerald-100">
          روحانی و طبی رہنمائی
        </h1>
        <div className="h-1 w-24 bg-yellow-400/50 rounded-full mb-4"></div>
        
        <p className="text-lg text-emerald-100 font-light leading-relaxed mb-10 opacity-90">
          جدید ٹیکنالوجی اور قدیم علوم کا حسین امتزاج
          <br />
          <span className="text-sm opacity-75">طبی تشخیص • روحانی علاج • نجوم • وظائف</span>
        </p>

        {/* Action Button */}
        <button 
          onClick={onEnter}
          className="group relative w-full max-w-xs bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white text-xl font-bold py-4 px-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 active:scale-95 border border-white/20 flex items-center justify-center gap-3 overflow-hidden"
        >
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 skew-y-12"></div>
          <span className="relative z-10">آگے بڑھیں</span>
          <div className="bg-white/20 p-1.5 rounded-full relative z-10 group-hover:translate-x-[-5px] transition-transform">
             <MoveLeft size={20} className="text-white" />
          </div>
        </button>

        {/* Footer */}
        <p className="absolute bottom-6 text-xs text-emerald-400/60 font-sans tracking-widest uppercase">
          Apps Talk SMC Pvt Ltd
        </p>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [currentSection, setCurrentSection] = useState<AppSection>(AppSection.Home);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    // Check local storage if privacy was accepted previously
    const accepted = localStorage.getItem('privacy_accepted');
    if (accepted === 'true') {
      setPrivacyAccepted(true);
    }
  }, []);

  const handleAcceptPrivacy = () => {
    localStorage.setItem('privacy_accepted', 'true');
    setPrivacyAccepted(true);
  };

  const handleRejectPrivacy = () => {
    window.location.href = 'about:blank'; // Or close window
    alert("ایپ استعمال کرنے کے لیے شرائط کا قبول کرنا لازمی ہے۔");
  };

  const goBack = () => setCurrentSection(AppSection.Home);

  // If welcome screen is active, show it
  if (showWelcome) {
    return <WelcomeScreen onEnter={() => setShowWelcome(false)} />;
  }

  const renderSection = () => {
    switch (currentSection) {
      case AppSection.Calendar:
        return <CalendarSection onBack={goBack} />;
      case AppSection.PrayerTimes:
        return <PrayerTimesSection onBack={goBack} />;
      case AppSection.Numerology:
        return <NumerologySection onBack={goBack} />;
      case AppSection.Medical:
        return <MedicalSection onBack={goBack} />;
      case AppSection.Documents:
        return <DocumentSection onBack={goBack} />;
      case AppSection.TimeScience:
        return <TimeScienceSection onBack={goBack} />;
      case AppSection.Horoscope:
        return <HoroscopeSection onBack={goBack} />;
      case AppSection.Wazaif:
        return <WazaifSection onBack={goBack} />;
      case AppSection.Spiritual:
        return <GeneralAISection 
          title="روحانی رہنمائی" 
          icon={Moon}
          colorClass="border-cyan-500"
          promptContext="بطور ماہر روحانی معالج، صارف کے مسئلے کے لیے وظائف، دعائیں، اور اسما الحسنہ سے حل بتائیں۔"
          onBack={goBack}
        />;
      case AppSection.BlackMagic:
        return <BlackMagicSection onBack={goBack} />;
      case AppSection.Contact:
        return <ContactSection onBack={goBack} />;
      case AppSection.Home:
      default:
        return <HomeDashboard onNavigate={setCurrentSection} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden selection:bg-emerald-200" dir="rtl">
      {!privacyAccepted && <PrivacyModal onAccept={handleAcceptPrivacy} onReject={handleRejectPrivacy} />}
      
      <Header currentSection={currentSection} onNavigate={setCurrentSection} />
      
      <main className="flex-grow container mx-auto px-3 py-4 w-full max-w-7xl">
        {renderSection()}
      </main>
      
      <Footer />
    </div>
  );
};

// --- Home Dashboard Component ---
const HomeDashboard = ({ onNavigate }: { onNavigate: (s: AppSection) => void }) => {
  // Featured Card (Medical / Jadid Dawakhana)
  const featuredCard = {
      id: AppSection.Medical,
      title: 'جدید دواخانہ',
      desc: 'علامات سے بیماری کی تشخیص اور جدید علاج (یونانی، ایلوپیتھک، ہومیو، حجامہ)',
      color: 'text-blue-700',
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      icon: Stethoscope
  };

  // Other Cards
  const cards = [
    { id: AppSection.Calendar, title: 'کیلنڈر', desc: 'اسلامی، عیسوی، ہندی', color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100', icon: CalendarDays },
    { id: AppSection.PrayerTimes, title: 'اوقاتِ نماز', desc: 'نماز، سحر و افطار', color: 'text-teal-700', bg: 'bg-teal-50', border: 'border-teal-100', icon: Moon },
    { id: AppSection.Numerology, title: 'علم الاعداد', desc: 'لکی نمبر اور پتھر', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-100', icon: Calculator },
    { id: AppSection.Wazaif, title: 'استخارہ', desc: 'ہر مسئلے کا حل', color: 'text-teal-800', bg: 'bg-teal-100', border: 'border-teal-200', icon: BookOpen },
    { id: AppSection.TimeScience, title: 'علم الساعات', desc: 'نیک و بد ساعت', color: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-100', icon: Clock },
    { id: AppSection.Horoscope, title: 'زائچہ قسمت', desc: 'ستاروں کی چال', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100', icon: Star },
    { id: AppSection.Spiritual, title: 'روحانی حل', desc: 'وظائف و دعائیں', color: 'text-cyan-700', bg: 'bg-cyan-50', border: 'border-cyan-100', icon: BookOpen },
    { id: AppSection.BlackMagic, title: 'کالا جادو', desc: 'جادو کا علاج', color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-100', icon: Shield },
    { id: AppSection.Documents, title: 'دستاویزات', desc: 'رپورٹ ریڈر', color: 'text-gray-700', bg: 'bg-gray-100', border: 'border-gray-200', icon: FileText },
    { id: AppSection.Contact, title: 'رابطہ', desc: 'ٹیم سے بات کریں', color: 'text-yellow-700', bg: 'bg-yellow-50', border: 'border-yellow-200', icon: Phone },
  ];

  return (
    <div className="space-y-6 pb-8 animate-fade-in-up">
      
      {/* Improved Hero Section */}
      <div className="relative bg-gradient-to-br from-emerald-800 via-teal-900 to-emerald-950 rounded-3xl p-6 text-white shadow-xl overflow-hidden text-center md:text-right ring-4 ring-emerald-50">
         {/* Background Patterns */}
         <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
         <div className="absolute bottom-0 left-0 w-72 h-72 bg-yellow-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" style={{animationDelay: '2s'}}></div>
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] opacity-10"></div>
         
         <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="space-y-2 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[10px] font-bold border border-white/20 shadow-inner">
                    <Sparkles className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                    <span>بسم اللہ الرحمٰن الرحیم</span>
                </div>
                
                <p className="text-sm md:text-lg text-emerald-50 font-light leading-relaxed opacity-90 mt-2">
                    آپ کی زندگی کے روحانی، طبی اور نجومی مسائل کا حل جدید ٹیکنالوجی کے ذریعے۔
                </p>
            </div>
         </div>
      </div>

      {/* Featured Medical Section (Jadid Dawakhana) */}
      <div 
        onClick={() => onNavigate(featuredCard.id)}
        className={`group relative w-full bg-white p-5 rounded-3xl border-2 ${featuredCard.border} shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer overflow-hidden transform hover:-translate-y-1`}
      >
         {/* Decorative Gradient Header Line */}
         <div className={`absolute top-0 right-0 w-full h-1.5 bg-gradient-to-l from-blue-500 via-blue-400 to-blue-600 opacity-80`}></div>
         
         <div className="flex flex-row items-center justify-between gap-4 relative z-10">
            <div className="flex items-center gap-4 md:gap-6 flex-1">
                <div className={`shrink-0 p-4 md:p-5 rounded-2xl ${featuredCard.bg} ${featuredCard.color} shadow-inner group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 ring-4 ring-blue-50`}>
                    <featuredCard.icon size={36} strokeWidth={1.5} className="md:w-12 md:h-12" />
                </div>
                <div className="flex flex-col">
                    <h3 className="text-xl md:text-3xl font-bold text-gray-800 group-hover:text-blue-800 transition-colors mb-1 leading-tight">
                       {featuredCard.title}
                    </h3>
                    <p className="text-gray-500 text-xs md:text-sm font-medium group-hover:text-gray-700 leading-relaxed max-w-md">
                        {featuredCard.desc}
                    </p>
                </div>
            </div>
            
            <div className="shrink-0 p-3 rounded-full bg-blue-50 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-sm group-hover:shadow-blue-200">
                <ArrowRight size={24} className="text-blue-300 group-hover:text-white" />
            </div>
         </div>
         
         {/* Background Watermark Icon */}
         <featuredCard.icon className="absolute -bottom-4 -left-4 w-32 h-32 text-blue-50 opacity-50 transform rotate-12 group-hover:rotate-0 transition-transform duration-700" />
      </div>

      {/* Section Heading */}
      <div className="flex items-center gap-2 px-1 mt-4">
          <div className="h-6 w-1 bg-emerald-500 rounded-full"></div>
          <h2 className="text-lg font-bold text-gray-800">دیگر خدمات</h2>
      </div>

      {/* Auto-Adjustable Compact Cards Grid */}
      <div className="grid grid-cols-2 min-[450px]:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {cards.map((card) => (
          <div 
            key={card.id}
            onClick={() => onNavigate(card.id)}
            className={`group bg-white p-3 rounded-2xl border ${card.border} shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 cursor-pointer flex flex-col relative overflow-hidden h-full`}
          >
            {/* Card Top Gradient Line */}
            <div className={`absolute top-0 right-0 w-full h-1 bg-gradient-to-l from-white via-${card.bg.split('-')[1]}-400 to-${card.bg.split('-')[1]}-600 opacity-50`}></div>
            
            {/* Icon and Title Row - Compact */}
            <div className="flex items-center justify-between mb-2">
               <h3 className="text-sm font-bold text-gray-800 group-hover:text-emerald-800 transition-colors leading-tight text-right">
                   {card.title}
               </h3>
               <div className={`shrink-0 p-2 rounded-xl ${card.bg} ${card.color} shadow-inner group-hover:scale-110 transition-transform duration-300 ring-1 ring-white`}>
                   <card.icon size={18} strokeWidth={1.5} />
               </div>
            </div>
            
            {/* Description and Arrow Row */}
            <div className="flex justify-between items-end mt-auto">
                <p className="text-gray-400 text-[10px] font-medium leading-tight group-hover:text-gray-600 line-clamp-2 pl-1 text-right">
                    {card.desc}
                </p>
                <div className="p-0.5 rounded-full group-hover:bg-emerald-500 group-hover:text-white transition-colors shrink-0">
                  <ArrowRight size={12} className="text-gray-300 group-hover:text-white" />
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;