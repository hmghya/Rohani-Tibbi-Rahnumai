
import React, { useState } from 'react';
import { AppSection } from '../types';
import { Menu, X, Home, Clock, Calculator, Stethoscope, Watch, Star, Moon, Shield, FileText, Phone, BookOpen, CalendarDays } from 'lucide-react';

interface HeaderProps {
  currentSection: AppSection;
  onNavigate: (section: AppSection) => void;
}

// --- New Composite App Logo ---
const AppLogo = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full p-0.5 overflow-visible" xmlns="http://www.w3.org/2000/svg">
    {/* Outer Glow/Ring - Slow Rotation */}
    <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-emerald-200 opacity-40 animate-[spin_10s_linear_infinite] origin-center" />
    
    {/* Central Moon (Spiritual) - Gentle Pulse */}
    <path d="M60 30 A 30 30 0 1 1 35 75 A 24 24 0 1 0 60 30" fill="currentColor" className="text-yellow-400 drop-shadow-sm animate-[pulse_3s_ease-in-out_infinite]" />
    
    {/* Star (Astrology) - Top Right - Twinkle */}
    <path d="M80 20 L82 26 L88 26 L83 30 L85 36 L80 32 L75 36 L77 30 L72 26 L78 26 Z" fill="currentColor" className="text-orange-300 animate-[pulse_2s_ease-in-out_infinite]" />
    
    {/* Medical Cross (Health) - Bottom Right */}
    <g transform="translate(70, 65) rotate(-10)">
      <rect x="4" y="0" width="4" height="12" rx="1" fill="currentColor" className="text-red-400" />
      <rect x="0" y="4" width="12" height="4" rx="1" fill="currentColor" className="text-red-400" />
    </g>

    {/* Leaf (Herbal/Unani) - Bottom Left */}
    <path d="M25 80 Q 10 70 20 55 Q 35 40 50 55" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-green-400" />
    <path d="M20 55 Q 35 40 50 55" fill="currentColor" className="text-green-500/80" />
    
    {/* Atom/Orbit (Science/Tech) - Top Left */}
     <ellipse cx="30" cy="30" rx="12" ry="4" transform="rotate(45 30 30)" stroke="currentColor" fill="none" strokeWidth="1" className="text-blue-300" />
  </svg>
);

const Header: React.FC<HeaderProps> = ({ onNavigate }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuItems = [
    { id: AppSection.Home, label: 'ہوم (Home)', icon: Home },
    { id: AppSection.Calendar, label: 'کیلنڈر (Calendar)', icon: CalendarDays },
    { id: AppSection.PrayerTimes, label: 'اوقاتِ نماز', icon: Clock },
    { id: AppSection.Numerology, label: 'علم الاعداد', icon: Calculator },
    { id: AppSection.Wazaif, label: 'استخارہ', icon: BookOpen },
    { id: AppSection.Medical, label: 'امراض کی تشخیص', icon: Stethoscope },
    { id: AppSection.TimeScience, label: 'علم الساعات', icon: Watch },
    { id: AppSection.Horoscope, label: 'زائچہ و نجوم', icon: Star },
    { id: AppSection.Spiritual, label: 'روحانی رہنمائی', icon: Moon },
    { id: AppSection.BlackMagic, label: 'کالا جادو', icon: Shield },
    { id: AppSection.Documents, label: 'دستاویز ریڈر', icon: FileText },
    { id: AppSection.Contact, label: 'رابطہ', icon: Phone },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 pt-[env(safe-area-inset-top)] transition-all duration-300">
        {/* Main Header Container - Dark Emerald Gradient */}
        <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-900 shadow-md border-b border-emerald-800">
            <div className="container mx-auto px-4 py-3 flex justify-between items-center relative">
            
            {/* Menu Button (Hamburger) */}
            <button 
                onClick={() => setIsMenuOpen(true)}
                className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all focus:outline-none active:scale-95 shadow-sm border border-white/10"
                aria-label="Menu"
            >
                <Menu className="w-6 h-6" />
            </button>

            {/* Logo & Title - Updated with New AppLogo */}
            <div 
                className="flex items-center gap-3 cursor-pointer absolute left-1/2 transform -translate-x-1/2 group" 
                onClick={() => onNavigate(AppSection.Home)}
            >
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center shadow-lg border border-white/10 text-white group-hover:scale-105 transition-transform backdrop-blur-sm overflow-hidden">
                    <AppLogo />
                </div>
                <h1 className="text-xl md:text-2xl font-bold leading-none whitespace-nowrap tracking-wide text-white drop-shadow-md">
                    روحانی و طبی رہنمائی
                </h1>
            </div>

            {/* Invisible Spacer for balance */}
            <div className="w-10 opacity-0"></div>
            </div>
        </div>
      </header>

      {/* Side Menu Drawer (Overlay) */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 flex justify-start" role="dialog" aria-modal="true">
            {/* Backdrop */}
            <div 
                className="fixed inset-0 bg-emerald-950/60 backdrop-blur-sm transition-opacity animate-fade-in" 
                onClick={() => setIsMenuOpen(false)}
            ></div>
            
            {/* Sidebar Panel */}
            <div className="relative w-[85%] max-w-[320px] bg-white h-full shadow-2xl flex flex-col transition-transform transform animate-fade-in border-l border-emerald-100 rounded-r-3xl my-2 ml-2 overflow-hidden">
                
                {/* Sidebar Header */}
                <div className="p-6 bg-gradient-to-br from-emerald-800 to-teal-900 text-white flex justify-between items-center shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl transform translate-x-10 -translate-y-10"></div>
                    <div className="relative z-10">
                        <span className="text-2xl font-bold block drop-shadow-md">فہرست</span>
                        <span className="text-sm text-emerald-100 opacity-90">مطلوبہ سروس منتخب کریں</span>
                    </div>
                    <button onClick={() => setIsMenuOpen(false)} className="relative z-10 p-2 bg-white/20 hover:bg-white/30 rounded-full transition border border-white/10">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Menu Items */}
                <nav className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#fafbfb]">
                    {menuItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => {
                                onNavigate(item.id);
                                setIsMenuOpen(false);
                            }}
                            className="w-full flex items-center gap-4 p-3.5 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md hover:border-emerald-200 hover:bg-emerald-50/50 active:scale-[0.98] transition-all text-right group"
                        >
                            <div className="p-2.5 bg-emerald-50 rounded-xl group-hover:bg-emerald-500 group-hover:text-white transition-colors text-emerald-600 shadow-inner border border-emerald-100">
                                {/* Added conditional pulse animation for PrayerTimes */}
                                <item.icon className={`w-5 h-5 ${item.id === AppSection.PrayerTimes ? 'animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite]' : ''}`} />
                            </div>
                            <span className="font-bold text-lg text-gray-700 group-hover:text-emerald-900">{item.label}</span>
                        </button>
                    ))}
                </nav>

                {/* Sidebar Footer */}
                <div className="p-4 bg-white border-t text-center shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20">
                     <p className="text-xs text-emerald-800 font-bold opacity-70">Apps Talk SMC Pvt Ltd</p>
                </div>
            </div>
        </div>
      )}
    </>
  );
};

export default Header;
