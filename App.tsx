
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import PrivacyModal from './components/PrivacyModal';
import { AppSection } from './types';
import { NumerologySection, MedicalSection, DocumentSection, GeneralAISection, ContactSection, PrayerTimesSection, HoroscopeSection, BlackMagicSection, WazaifSection, TimeScienceSection, CalendarSection, SettingsSection, SpiritualSection, TasbeehCounterSection } from './components/FeatureComponents';
import { Clock, Moon, Shield, Sun, Star, Stethoscope, Calculator, BookOpen, Phone, FileText, ArrowRight, CalendarDays, Sparkles, MoveLeft, Key, AlertTriangle, Fingerprint } from 'lucide-react';

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
        <h1 className="text-3xl md:text-4xl font-bold mb-2 tracking-wide drop-shadow-lg">طبی و روحانی معالج</h1>
        <p className="text-lg text-emerald-100 font-light leading-relaxed mb-10 opacity-90">جدید ٹیکنالوجی اور قدیم علوم کا حسین امتزاج</p>
        <button onClick={onEnter} className="w-full max-w-xs bg-emerald-500 text-white text-xl font-bold py-4 px-8 rounded-2xl shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all">
          آگے بڑھیں <MoveLeft size={20} />
        </button>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [currentSection, setCurrentSection] = useState<AppSection>(AppSection.Home);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    const accepted = localStorage.getItem('privacy_accepted');
    if (accepted === 'true') setPrivacyAccepted(true);
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
      case AppSection.Calendar: return <CalendarSection onBack={goBack} />;
      case AppSection.PrayerTimes: return <PrayerTimesSection onBack={goBack} />;
      case AppSection.Tasbeeh: return <TasbeehCounterSection onBack={goBack} />;
      case AppSection.Numerology: return <NumerologySection onBack={goBack} />;
      case AppSection.Medical: return <MedicalSection onBack={goBack} />;
      case AppSection.Documents: return <DocumentSection onBack={goBack} />;
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

const HomeDashboard = ({ onNavigate }: { onNavigate: (s: AppSection) => void }) => {
  const cards = [
    { id: AppSection.Medical, title: 'جدید دواخانہ', desc: 'تشخیص و علاج', color: 'text-blue-700', bg: 'bg-blue-50', icon: Stethoscope },
    { id: AppSection.Tasbeeh, title: 'تسبیح کاؤنٹر', desc: 'ڈیجیٹل تسبیح', color: 'text-emerald-700', bg: 'bg-emerald-50', icon: Fingerprint },
    { id: AppSection.PrayerTimes, title: 'اوقاتِ نماز', desc: 'نماز و الرٹ', color: 'text-teal-700', bg: 'bg-teal-50', icon: Moon },
    { id: AppSection.Numerology, title: 'علم الاعداد', desc: 'نام کے اعداد', color: 'text-emerald-700', bg: 'bg-emerald-50', icon: Calculator },
    { id: AppSection.Wazaif, title: 'استخارہ', desc: 'روحانی رہنمائی', color: 'text-teal-800', bg: 'bg-teal-100', icon: BookOpen },
    { id: AppSection.TimeScience, title: 'علم الساعات', desc: 'وقت کی تاثیر', color: 'text-purple-700', bg: 'bg-purple-50', icon: Clock },
    { id: AppSection.Horoscope, title: 'زائچہ و نجوم', desc: 'قسمت کا حال', color: 'text-orange-600', bg: 'bg-orange-50', icon: Star },
    { id: AppSection.Spiritual, title: 'اسلامی تعلیمات', desc: 'دعائیں و کلمات', color: 'text-cyan-700', bg: 'bg-cyan-50', icon: BookOpen },
    { id: AppSection.BlackMagic, title: 'کالا جادو', desc: 'جادو کا توڑ', color: 'text-red-700', bg: 'bg-red-50', icon: Shield },
    { id: AppSection.Calendar, title: 'کیلنڈر', desc: 'تاریخیں', color: 'text-indigo-600', bg: 'bg-indigo-50', icon: CalendarDays },
    { id: AppSection.Documents, title: 'دستاویزات', desc: 'رپورٹ ریڈر', color: 'text-gray-700', bg: 'bg-gray-100', icon: FileText },
    { id: AppSection.Contact, title: 'رابطہ', desc: 'ٹیم سے بات کریں', color: 'text-yellow-700', bg: 'bg-yellow-50', icon: Phone },
  ];

  return (
    <div className="space-y-6 pb-8 animate-fade-in-up">
      <div className="bg-emerald-900 rounded-3xl p-6 text-white text-center shadow-xl ring-4 ring-emerald-50">
         <h2 className="text-2xl font-bold mb-2">بسم اللہ الرحمٰن الرحیم</h2>
         <p className="opacity-80">طبی و روحانی مسائل کا جدید و شرعی حل</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div key={card.id} onClick={() => onNavigate(card.id)} className={`bg-white p-5 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col items-center text-center gap-3`}>
             <div className={`p-4 rounded-2xl ${card.bg} ${card.color} shadow-inner`}><card.icon size={32} /></div>
             <div>
                <h3 className="font-bold text-gray-800">{card.title}</h3>
                <p className="text-gray-400 text-xs">{card.desc}</p>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;
