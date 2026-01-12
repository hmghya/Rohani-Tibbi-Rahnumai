import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import PrivacyModal from './components/PrivacyModal';
import { AppSection } from './types';
import { NumerologySection, DocumentSection, GeneralAISection, ContactSection, PrayerTimesSection, HoroscopeSection, BlackMagicSection, WazaifSection, TimeScienceSection, SettingsSection, SpiritualSection, UnaniHealthSection } from './components/FeatureComponents';
import { Clock, Moon, Shield, Sun, Star, Stethoscope, Calculator, BookOpen, Phone, FileText, ArrowRight, Sparkles, MoveLeft, Key, AlertTriangle, Menu, Settings, Sprout } from 'lucide-react';

// --- Welcome Screen Component ---
const WelcomeScreen = ({ onEnter }: { onEnter: () => void }) => {
  return (
    <div className="fixed inset-0 z-[200] bg-gradient-to-br from-emerald-900 via-teal-900 to-emerald-950 flex flex-col items-center justify-center text-white p-6 animate-fade-in">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] opacity-10"></div>
      <div className="relative z-10 flex flex-col items-center text-center max-w-md w-full">
        <div className="w-32 h-32 mb-8 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center shadow-2xl border border-white/20 animate-bounce-slow">
           <svg viewBox="0 0 100 100" className="w-24 h-24 overflow-visible" xmlns="http://www.w3.org/2000/svg">
              <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-emerald-200 opacity-40" />
              <path d="M60 30 A 30 30 0 1 1 35 75 A 24 24 0 1 0 60 30" fill="currentColor" className="text-yellow-400" />
              <path d="M80 20 L82 26 L88 26 L83 30 L85 36 L80 32 L75 36 L77 30 L72 26 L78 26 Z" fill="currentColor" className="text-orange-300" />
           </svg>
        </div>
        <h1 className="text-3xl md:text-5xl font-bold mb-3 tracking-wide drop-shadow-lg ur-text">طبی و روحانی معالج</h1>
        <p className="text-xl text-emerald-100 font-light leading-relaxed mb-12 opacity-90 ur-text">جدید ٹیکنالوجی اور قدیم علوم کا حسین امتزاج</p>
        <button onClick={onEnter} className="w-full max-w-xs bg-emerald-500 hover:bg-emerald-400 text-white text-2xl font-black py-5 px-10 rounded-[2rem] shadow-2xl shadow-emerald-950 flex items-center justify-center gap-4 active:scale-95 transition-all ur-text">
          آئیے شروع کریں <ArrowRight size={24} className="rotate-180" />
        </button>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [currentSection, setCurrentSection] = useState<AppSection>(AppSection.Home);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);

  // Initialize and apply settings from localStorage
  useEffect(() => {
    // Privacy Policy
    const accepted = localStorage.getItem('privacy_accepted');
    if (accepted === 'true') setPrivacyAccepted(true);

    // Dark Mode Apply
    const theme = localStorage.getItem('theme');
    if (theme === 'dark') {
        document.documentElement.classList.add('dark');
    }

    // Font Size Apply
    const fontSize = localStorage.getItem('font-size') || 'normal';
    const sizeMap: Record<string, string> = {
        'small': '0.9rem',
        'normal': '1.1rem',
        'large': '1.3rem'
    };
    document.documentElement.style.fontSize = sizeMap[fontSize];
  }, []);

  const handleAcceptPrivacy = () => {
    localStorage.setItem('privacy_accepted', 'true');
    setPrivacyAccepted(true);
  };

  const handleRejectPrivacy = () => {
    window.location.href = 'about:blank';
  };

  const goBack = () => setCurrentSection(AppSection.Home);

  if (showWelcome) return <WelcomeScreen onEnter={() => setShowWelcome(false)} />;

  const renderSection = () => {
    switch (currentSection) {
      case AppSection.PrayerTimes: return <PrayerTimesSection onBack={goBack} />;
      case AppSection.Numerology: return <NumerologySection onBack={goBack} />;
      case AppSection.Documents: return <DocumentSection onBack={goBack} />;
      case AppSection.UnaniHealth: return <UnaniHealthSection onBack={goBack} />;
      case AppSection.TimeScience: return <TimeScienceSection onBack={goBack} />;
      case AppSection.Horoscope: return <HoroscopeSection onBack={goBack} />;
      case AppSection.Wazaif: return <WazaifSection onBack={goBack} />;
      case AppSection.Spiritual: return <SpiritualSection onBack={goBack} />;
      case AppSection.BlackMagic: return <BlackMagicSection onBack={goBack} />;
      case AppSection.Contact: return <ContactSection onBack={goBack} />;
      case AppSection.Settings: return <SettingsSection onBack={goBack} />;
      default: return <HomeDashboard onNavigate={setCurrentSection} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden selection:bg-emerald-200 dark:bg-slate-950 transition-colors" dir="rtl">
      {!privacyAccepted && <PrivacyModal onAccept={handleAcceptPrivacy} onReject={handleRejectPrivacy} />}
      <Header currentSection={currentSection} onNavigate={setCurrentSection} />
      <main className="flex-grow container mx-auto px-4 py-4 w-full max-w-7xl">
        {renderSection()}
      </main>
      <Footer />
    </div>
  );
};

const HomeDashboard = ({ onNavigate }: { onNavigate: (s: AppSection) => void }) => {
  const medicalItems = [
    { id: AppSection.UnaniHealth, title: 'طبِ یونانی و صحت', desc: 'حکیمی و طبی معلومات', color: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20', icon: Sprout },
    { id: AppSection.Documents, title: 'رپورٹ ریڈر', desc: 'تجزیہ رپورٹ', color: 'text-indigo-700 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-900/20', icon: FileText },
  ];

  return (
    <div className="space-y-6 pb-12 animate-fade-in-up">
      <div className="bg-gradient-to-br from-emerald-900 to-teal-900 dark:from-slate-900 dark:to-slate-800 rounded-[1.5rem] p-6 text-white text-center shadow-lg relative overflow-hidden border border-emerald-800 dark:border-slate-700">
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] opacity-5"></div>
         <div className="relative z-10">
            <h2 className="text-xl font-black mb-1 drop-shadow-md ur-text">بسم اللہ الرحمٰن الرحیم</h2>
            <p className="text-base opacity-90 font-bold text-emerald-100 ur-text">طبی و روحانی مسائل کا جدید حل</p>
         </div>
      </div>

      <div className="space-y-4">
           <h3 className="text-lg font-black text-gray-800 dark:text-slate-200 mr-1 flex items-center gap-2 ur-text">
              <span className="w-1 h-5 bg-emerald-500 rounded-full"></span>
              طبی خدمات (Medical)
           </h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
              {medicalItems.map((card) => (
                <div key={card.id} onClick={() => onNavigate(card.id)} className="bg-white dark:bg-slate-900 p-6 rounded-[1.5rem] border border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all cursor-pointer flex flex-col items-center text-center gap-4 group">
                   <div className={`p-4 rounded-xl ${card.bg} ${card.color} shadow-inner group-hover:scale-105 transition-transform`}><card.icon size={36} /></div>
                   <div>
                      <h3 className="font-black text-xl text-gray-800 dark:text-white mb-0.5 ur-text">{card.title}</h3>
                      <p className="text-gray-500 dark:text-slate-400 text-xs font-bold ur-text">{card.desc}</p>
                   </div>
                   <div className="text-emerald-600 font-black flex items-center gap-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity ur-text">
                      دیکھیں <ArrowRight size={14} className="rotate-180" />
                   </div>
                </div>
              ))}
           </div>
           
           <div className="mt-8 p-6 bg-emerald-50/50 dark:bg-slate-900/50 rounded-[2rem] border border-dashed border-emerald-200 dark:border-slate-700 text-center">
                <Menu className="mx-auto text-emerald-300 mb-2" size={32} />
                <h4 className="text-base font-black text-emerald-900 dark:text-emerald-400 mb-1 ur-text">دیگر تمام روحانی خدمات</h4>
                <p className="text-emerald-700 dark:text-slate-400 text-sm ur-text">اوپر موجود <span className="font-black">مینو</span> سے دیگر تمام خدمات حاصل کریں۔</p>
           </div>
      </div>
    </div>
  );
};

export default App;
