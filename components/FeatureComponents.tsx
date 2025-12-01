
import React, { useState, useEffect, useRef } from 'react';
import { Upload, Send, BookOpen, Heart, Moon, Sun, Clock, Eye, ChevronRight, Stethoscope, ArrowRight, MapPin, Sunrise, Sunset, Bell, BellOff, Volume2, X, Gift, Calendar, Zap, Users, Home, Key, Hash, ShieldCheck, Activity, AlertTriangle, Briefcase, PenTool, Car, Ghost, Smile, Star, Phone, UserPlus, HelpCircle, Smartphone, Shield, Save, RefreshCw, Settings, Play, Pause, RotateCcw, Calculator, FileText, Edit2, Check, Fingerprint, Search, History, TrendingUp, Gem, Palette, HeartPulse, CalendarDays, ChevronLeft, Pill, Mic, ThermometerSun, CloudSun, Loader2, Sparkles, MessageSquare, User, Scale, SearchCheck, Globe, Navigation, ChevronDown, Plus, Minus, Trash2 } from 'lucide-react';
import { getMedicalDiagnosis, getNumerologyAnalysis, scanDocument, generateSpiritualResponse, getInitialDiagnosis, getHoroscopeAnalysis, getBlackMagicDiagnosis, analyzeMedicine } from '../services/geminiService';
import GenericResult from './GenericResult';

interface SectionProps {
  onBack: () => void;
}

// --- Helper Functions (Top Level) ---

const safeIntlFormat = (date: Date, locale: string, options: Intl.DateTimeFormatOptions) => {
    try {
        return new Intl.DateTimeFormat(locale, options).format(date);
    } catch (e) {
        const { calendar, ...safeOptions } = options;
        try {
            return new Intl.DateTimeFormat('en-US', safeOptions).format(date);
        } catch (e2) {
            if (options.day) return date.getDate().toString();
            if (options.year) return date.getFullYear().toString();
            return '';
        }
    }
};

const safeIntlMonth = (date: Date, locale: string, options: Intl.DateTimeFormatOptions) => {
    try {
        return new Intl.DateTimeFormat(locale, options).format(date);
    } catch (e) {
        return date.toLocaleString('en-US', { month: 'long' });
    }
};

const urduMonths = ['جنوری', 'فروری', 'مارچ', 'اپریل', 'مئی', 'جون', 'جولائی', 'اگست', 'ستمبر', 'اکتوبر', 'نومبر', 'دسمبر'];

const getHindiMonthUrdu = (date: Date) => {
    const monthName = safeIntlMonth(date, 'en-u-ca-indian', { month: 'long' });
    const mappings: Record<string, string> = {
        'Chaitra': 'چیت', 'Vaisakha': 'بیساکھ', 'Jyeshtha': 'جیٹھ', 'Jyaistha': 'جیٹھ',
        'Ashadha': 'ہاڑ', 'Asadha': 'ہاڑ', 'Sravana': 'ساون', 'Shravana': 'ساون',
        'Bhadra': 'بھادوں', 'Bhadrapada': 'بھادوں', 'Ashvina': 'اسوج', 'Asvina': 'اسوج',
        'Kartika': 'کاتک', 'Agrahayana': 'مگھر', 'Margashirsha': 'مگھر', 'Pausha': 'پوہ',
        'Pausa': 'پوہ', 'Magha': 'ماگھ', 'Phalguna': 'پھاگن'
    };
    for (const key in mappings) if (monthName.includes(key)) return mappings[key];
    return monthName || 'ماہ';
};

const getGregorianMonthUrdu = (date: Date) => {
    const monthIndex = date.getMonth();
    return urduMonths[monthIndex];
};

const getHijriMonthUrdu = (date: Date) => {
    const hijriMonth = safeIntlMonth(date, 'en-u-ca-islamic-umalqura', { month: 'long' });
    const mappings: Record<string, string> = {
        'Muharram': 'محرم', 'Safar': 'صفر', 'Rabiʻ I': 'ربیع الاول', 'Rabiʻ II': 'ربیع الثانی',
        'Jumada I': 'جمادی الثانی', 'Jumada II': 'جمادی الثانی',
        'Rajab': 'رجب', 'Shaʻban': 'شعبان',
        'Ramadan': 'رمضان', 'Shawwal': 'شوال', 'Dhu al-Qiʻdah': 'ذیقعد', 'Dhu al-Hijjah': 'ذی الحجہ'
    };
    for (const key in mappings) if (hijriMonth.includes(key)) return mappings[key];
    return hijriMonth || 'ماہ';
};

const getBikramiYear = (date: Date) => date.getFullYear() + 57;

const getNanakShahiYear = (date: Date) => {
    const month = date.getMonth();
    const day = date.getDate();
    if (month > 2 || (month === 2 && day >= 14)) {
        return date.getFullYear() - 1468;
    }
    return date.getFullYear() - 1469;
};

// --- Prayer Time Helpers ---

const adjustTimeStr = (timeStr: string, offsetMinutes: number) => {
    if (!timeStr) return timeStr;
    if (offsetMinutes === 0) return timeStr;
    try {
        const [time, period] = timeStr.trim().split(/\s+/);
        let [hours, minutes] = time.split(':').map(Number);
        
        const isPM = period && period.toUpperCase() === 'PM';
        const isAM = period && period.toUpperCase() === 'AM';

        if (isPM && hours !== 12) hours += 12;
        if (isAM && hours === 12) hours = 0;
        
        const date = new Date();
        date.setHours(hours, minutes + offsetMinutes);
        
        let newHours = date.getHours();
        const newMinutes = date.getMinutes();
        const newPeriod = newHours >= 12 ? 'PM' : 'AM';
        
        if (newHours > 12) newHours -= 12;
        if (newHours === 0) newHours = 12;
        
        return `${newHours}:${newMinutes.toString().padStart(2, '0')} ${newPeriod}`;
    } catch (e) {
        return timeStr;
    }
};

const parseTimeToMinutes = (timeStr: string) => {
    if (!timeStr) return 0;
    try {
        const cleanStr = timeStr.replace(/[\u0600-\u06FF]/g, '').trim(); 
        const [time, period] = cleanStr.split(' ');
        if (!time || !period) return 0;
        let [hours, minutes] = time.split(':').map(Number);
        if (isNaN(hours) || isNaN(minutes)) return 0;
        
        const isPM = period.toUpperCase() === 'PM';
        const isAM = period.toUpperCase() === 'AM';
        
        if (isPM && hours !== 12) hours += 12;
        if (isAM && hours === 12) hours = 0;
        
        return hours * 60 + minutes;
    } catch (e) {
        return 0;
    }
};

const SPECIAL_DAYS_DATA = [
    { d: 1, m: 1, label: 'نئے سال کا آغاز (New Year)' },
    { d: 4, m: 1, label: 'بریل کا عالمی دن' },
    { d: 24, m: 1, label: 'تعلیم کا عالمی دن' },
    { d: 5, m: 2, label: 'یوم یکجہتی کشمیر (Kashmir Day)' },
    { d: 21, m: 2, label: 'مادری زبانوں کا عالمی دن' },
    { d: 8, m: 3, label: 'خواتین کا عالمی دن (Women\'s Day)' },
    { d: 15, m: 3, label: 'انسدادِ اسلامو فوبیا کا عالمی دن (End of Islamophobia)' },
    { d: 21, m: 3, label: 'جنگلات کا عالمی دن' },
    { d: 22, m: 3, label: 'پانی کا عالمی دن (World Water Day)' },
    { d: 23, m: 3, label: 'یوم پاکستان (Pakistan Day)' },
    { d: 7, m: 4, label: 'صحت کا عالمی دن (World Health Day)' },
    { d: 22, m: 4, label: 'کرہ ارض کا دن (Earth Day)' },
    { d: 1, m: 5, label: 'یوم مزدور (Labour Day)' },
    { d: 28, m: 5, label: 'یوم تکبیر' },
    { d: 31, m: 5, label: 'تمباکو نوشی کے انسداد کا عالمی دن' },
    { d: 5, m: 6, label: 'ماحولیات کا عالمی دن (Environment Day)' },
    { d: 12, m: 6, label: 'چائلڈ لیبر کے خلاف عالمی دن' },
    { d: 11, m: 7, label: 'آبادی کا عالمی دن' },
    { d: 14, m: 8, label: 'یوم آزادی پاکستان (Independence Day)' },
    { d: 6, m: 9, label: 'یوم دفاع (Defence Day)' },
    { d: 8, m: 9, label: 'خواندگی کا عالمی دن' },
    { d: 21, m: 9, label: 'امن کا عالمی دن' },
    { d: 5, m: 10, label: 'اساتذہ کا عالمی دن (Teachers\' Day)' },
    { d: 10, m: 10, label: 'ذہنی صحت کا عالمی دن' },
    { d: 16, m: 10, label: 'خوراک کا عالمی دن' },
    { d: 24, m: 10, label: 'اقوام متحدہ کا دن' },
    { d: 9, m: 11, label: 'یوم اقبال (Iqbal Day)' },
    { d: 14, m: 11, label: 'ذیابیطس کا عالمی دن' },
    { d: 20, m: 11, label: 'بچوں کا عالمی دن (Children\'s Day)' },
    { d: 25, m: 11, label: 'خواتین پر تشدد کے خاتمے کا دن' },
    { d: 1, m: 12, label: 'ایڈز کا عالمی دن' },
    { d: 10, m: 12, label: 'انسانی حقوق کا عالمی دن' },
    { d: 18, m: 12, label: 'عربی زبان کا عالمی دن' },
    { d: 25, m: 12, label: 'یوم قائد اعظم / کرسمس' },
];

// --- Shared Components (Top Level) ---

const BackButton = ({ onClick }: { onClick: () => void }) => (
  <div className="flex justify-start mb-3">
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 bg-white text-emerald-800 border border-emerald-100 px-3 py-1.5 rounded-xl shadow-sm hover:shadow-md hover:bg-emerald-50 transition-all font-bold text-xs group"
    >
      <div className="bg-emerald-100 p-0.5 rounded-full group-hover:bg-emerald-200 transition-colors">
        <ArrowRight className="w-3 h-3" /> 
      </div>
      واپس جائیں
    </button>
  </div>
);

const FileUploader = ({ onSelect, label }: { onSelect: (b64: string) => void, label: string }) => {
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onSelect(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="border-2 border-dashed border-emerald-200 rounded-2xl p-4 text-center bg-emerald-50/30 hover:bg-emerald-50 transition-all cursor-pointer relative w-full overflow-hidden group hover:border-emerald-400">
      <input type="file" accept="image/*" onChange={handleFile} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
      <div className="transform group-hover:scale-110 transition-transform duration-300 bg-white p-2 rounded-full inline-block shadow-lg mb-1 text-emerald-600 ring-4 ring-emerald-50">
        <Upload className="w-5 h-5" />
      </div>
      <p className="text-emerald-900 font-bold text-sm mb-0.5">{label}</p>
      <p className="text-[10px] text-emerald-600 font-medium">یہاں کلک کریں یا تصویر ڈریگ کریں</p>
    </div>
  );
};

interface VoiceInputProps {
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
  multiline?: boolean;
  type?: string;
  className?: string;
}

const VoiceInput: React.FC<VoiceInputProps> = ({ value, onChange, placeholder, multiline = false, type = "text", className = "" }) => {
    const [isListening, setIsListening] = useState(false);
    
    // Check browser support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    const handleListen = () => {
        if (!SpeechRecognition) {
            alert("معذرت، آپ کا براؤزر آواز کی شناخت کو سپورٹ نہیں کرتا۔");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = 'ur-PK'; // Urdu Pakistan
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onstart = () => {
            setIsListening(true);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            onChange(transcript); 
        };
        
        recognition.onerror = (event: any) => {
            console.error(event.error);
            setIsListening(false);
        };

        recognition.start();
    };

    const commonClasses = `w-full rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none text-right pr-4 pl-12 bg-white/80 backdrop-blur-sm ${className}`;

    return (
        <div className="relative w-full group">
            {multiline ? (
                <textarea 
                    value={value} 
                    onChange={(e) => onChange(e.target.value)} 
                    placeholder={placeholder}
                    className={`${commonClasses} pt-3 min-h-[100px]`}
                />
            ) : (
                <input 
                    type={type}
                    value={value} 
                    onChange={(e) => onChange(e.target.value)} 
                    placeholder={placeholder}
                    className={`${commonClasses} h-12`}
                />
            )}
            
            <button 
                type="button"
                onClick={handleListen}
                className={`absolute left-2 bottom-2 p-2 rounded-full transition-all shadow-sm flex items-center justify-center ${isListening ? 'bg-red-500 text-white animate-pulse ring-4 ring-red-200' : 'bg-gray-100 text-gray-500 hover:bg-emerald-100 hover:text-emerald-600'}`}
                title="بول کر لکھیں"
            >
                {isListening ? <Mic size={18} className="animate-ping absolute inline-flex opacity-75" /> : null}
                <Mic size={18} className="relative z-10" />
            </button>
        </div>
    );
};

// --- Calendar Components (Top Level) ---

const TodayPanel = () => {
    const today = new Date();
    const gDay = today.getDate();
    const gMonth = urduMonths[today.getMonth()];
    const gYear = today.getFullYear();
    
    const hDay = safeIntlFormat(today, 'ur-PK', { calendar: 'islamic-umalqura', day: 'numeric' });
    const hMonth = getHijriMonthUrdu(today);
    const hYear = safeIntlFormat(today, 'en-u-ca-islamic-umalqura', { year: 'numeric' });

    const pDay = safeIntlFormat(today, 'hi-IN-u-ca-indian', { calendar: 'indian', day: 'numeric' });
    const pMonth = getHindiMonthUrdu(today);
    const bYear = getBikramiYear(today);
    const nYear = getNanakShahiYear(today);

    return (
        <div className="bg-gradient-to-br from-gray-50 to-white rounded-3xl p-6 border border-gray-200 shadow-md mb-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-100 rounded-full blur-2xl opacity-50 -translate-y-4 translate-x-4"></div>
            <h3 className="text-center font-bold text-gray-400 text-xs mb-4 uppercase tracking-widest border-b border-gray-100 pb-2">آج کی تاریخ (Today's Date)</h3>
            <div className="space-y-4 text-center sm:text-right">
                    <div>
                        <span className="text-lg text-gray-800 font-medium leading-loose">
                        آج انگریزی ماہ <span className="font-bold text-blue-700">{gMonth}</span> کی <span className="font-bold text-blue-700">{gDay}</span> تاریخ اور سال <span className="font-bold text-blue-700">{gYear}</span> عیسوی ہے۔
                        </span>
                    </div>
                    <div className="w-full h-px bg-gray-100"></div>
                    <div>
                        <span className="text-lg text-gray-800 font-medium leading-loose">
                            آج اسلامی ماہ <span className="font-bold text-emerald-700">{hMonth}</span> کی <span className="font-bold text-emerald-700">{hDay}</span> تاریخ اور سال <span className="font-bold text-emerald-700">{hYear}</span> ہجری ہے۔
                        </span>
                    </div>
                    <div className="w-full h-px bg-gray-100"></div>
                    <div>
                        <span className="text-lg text-gray-800 font-medium leading-loose">
                            پنجابی (دیسی) ماہ <span className="font-bold text-orange-700">{pMonth}</span> کی <span className="font-bold text-orange-700">{pDay}</span> تاریخ، سال <span className="font-bold text-orange-700">{bYear}</span> بکرمی سمت (<span className="font-bold text-orange-700">{nYear}</span> نانک شاہی) ہے۔
                        </span>
                    </div>
            </div>
        </div>
    );
};

// --- Prayer Card Component (Top Level) ---

const PrayerCard = ({ 
    title, 
    time, 
    icon: Icon, 
    color, 
    isActive, 
    isForbidden = false, 
    prayerKey,
    customOffset = 0,
    isAlarm = false,
    onOffsetChange,
    onAlarmToggle
}: any) => {
    const [showAdjust, setShowAdjust] = useState(false);
    const [manualInput, setManualInput] = useState("");
    
    // Calculate the display time based on offset
    const displayTime = adjustTimeStr(time, customOffset);

    // Keep manual input in sync with display time when we open edit mode
    useEffect(() => {
            if (showAdjust) setManualInput(displayTime);
    }, [showAdjust, displayTime]);

    const handleManualBlur = () => {
        const newMins = parseTimeToMinutes(manualInput);
        const baseMins = parseTimeToMinutes(time);
        
        if (newMins > 0 && baseMins > 0) {
            let diff = newMins - baseMins;
            if (diff < -720) diff += 1440;
            if (diff > 720) diff -= 1440;
            
            onOffsetChange(prayerKey, diff - customOffset);
        } else {
            setManualInput(displayTime);
        }
    };

    const resetOffset = (e: React.MouseEvent) => {
        e.stopPropagation();
        onOffsetChange(prayerKey, -customOffset);
    };

    return (
        <div className={`relative overflow-visible rounded-2xl p-4 flex flex-col items-center justify-center gap-2 border transition-all duration-300 ${isActive ? `bg-gradient-to-br ${color} text-white shadow-lg scale-105 ring-2 ring-offset-2 ring-emerald-100` : 'bg-white border-gray-100 text-gray-700 hover:shadow-md'}`}>
                {isActive && <div className="absolute inset-0 bg-white/20 animate-pulse pointer-events-none rounded-2xl"></div>}
                
                {/* Alarm Button */}
                <div className="absolute top-2 left-2 z-20">
                    <button 
                    onClick={(e) => { e.stopPropagation(); onAlarmToggle(prayerKey); }}
                    className={`p-1.5 rounded-full transition-colors backdrop-blur-sm ${isActive ? 'bg-white/20 hover:bg-white/30 text-white' : (isAlarm ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400')}`}
                    title="Alarm"
                    >
                        {isAlarm ? <Bell size={14} className="fill-current" /> : <BellOff size={14} />}
                    </button>
                </div>

                {/* Settings Button */}
                {!isForbidden && (
                    <div className="absolute top-2 right-2 z-20">
                        <button 
                        onClick={(e) => { e.stopPropagation(); setShowAdjust(!showAdjust); }}
                        className={`p-1.5 rounded-full transition-colors backdrop-blur-sm ${isActive ? 'bg-white/20 hover:bg-white/30 text-white' : (showAdjust ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400')}`}
                        title="Adjust Time"
                        >
                            <Settings size={14} />
                        </button>
                    </div>
                )}

                {/* Main Content */}
                <div className={`p-2 rounded-full ${isActive ? 'bg-white/20' : 'bg-gray-50'}`}>
                <Icon size={20} className={isActive ? 'text-white' : 'text-gray-500'} />
                </div>
                <span className="text-sm font-bold opacity-90">{title}</span>
                
                {/* Time Display or Adjustment Controls */}
                {showAdjust ? (
                    <div className="flex items-center justify-between bg-white shadow-xl p-2 rounded-xl absolute bottom-[-16px] left-1/2 transform -translate-x-1/2 z-30 w-[160px] border border-gray-200" dir="ltr" onClick={(e) => e.stopPropagation()}>
                        <button 
                        onClick={() => onOffsetChange(prayerKey, -1)} 
                        className="w-8 h-8 flex items-center justify-center bg-red-50 text-red-500 rounded-lg hover:bg-red-100 active:scale-95 transition-all shadow-sm"
                        >
                        <Minus size={18} strokeWidth={2.5} />
                        </button>
                        
                        <input 
                        type="text" 
                        value={manualInput}
                        onChange={(e) => setManualInput(e.target.value)}
                        onBlur={handleManualBlur}
                        onKeyDown={(e) => {
                            if(e.key === 'Enter') {
                                handleManualBlur();
                                e.currentTarget.blur();
                            }
                        }}
                        className="flex-1 w-full text-center text-sm font-bold text-gray-800 focus:ring-2 focus:ring-emerald-500 outline-none bg-gray-50 rounded mx-1 py-1"
                        />
                        
                        <button 
                        onClick={() => onOffsetChange(prayerKey, 1)} 
                        className="w-8 h-8 flex items-center justify-center bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 active:scale-95 transition-all shadow-sm"
                        >
                        <Plus size={18} strokeWidth={2.5} />
                        </button>
                        
                        {customOffset !== 0 && (
                            <button 
                            onClick={resetOffset}
                            className="absolute -top-3 -right-3 bg-gray-700 text-white rounded-full p-1.5 shadow-md hover:bg-gray-900 border-2 border-white"
                            title="Reset Time"
                            >
                                <RotateCcw size={12} />
                            </button>
                        )}
                    </div>
                ) : (
                <span className="text-xl font-bold tracking-wider mt-1" dir="ltr">{displayTime || '--:--'}</span>
                )}

                {isForbidden && <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold absolute top-2 right-2">مکروہ</span>}
                
                {isAlarm && !showAdjust && (
                <div className={`absolute bottom-2 w-1.5 h-1.5 rounded-full ${isActive ? 'bg-white' : 'bg-emerald-500'}`}></div>
                )}
        </div>
    );
};

// --- Calendar Section ---
export const CalendarSection = ({ onBack }: SectionProps) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [calendarType, setCalendarType] = useState<'gregorian' | 'hijri' | 'punjabi'>('gregorian');
    const [yearInput, setYearInput] = useState(currentDate.getFullYear().toString());

    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date();
            if (now.getDate() !== currentDate.getDate()) {
                setCurrentDate(now);
                setYearInput(now.getFullYear().toString());
            }
        }, 60000);
        return () => clearInterval(timer);
    }, [currentDate]);

    useEffect(() => {
        setYearInput(currentDate.getFullYear().toString());
    }, [currentDate]);

    const goToToday = () => setCurrentDate(new Date());
    const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    
    const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const valStr = e.target.value;
        setYearInput(valStr);
        const val = parseInt(valStr);
        if (!isNaN(val) && val > 0 && val < 9999) {
            setCurrentDate(new Date(val, currentDate.getMonth(), 1));
        }
    };

    const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = parseInt(e.target.value);
        setCurrentDate(new Date(currentDate.getFullYear(), val, 1));
    };

    const getHeaderDate = () => {
        if (calendarType === 'hijri') {
            const month = getHijriMonthUrdu(currentDate);
            const year = safeIntlFormat(currentDate, 'en-u-ca-islamic-umalqura', { year: 'numeric' });
            return `${month} ${year}`;
        } else if (calendarType === 'punjabi') {
            const urduMonth = getHindiMonthUrdu(currentDate);
            const year = getBikramiYear(currentDate);
            return `${urduMonth} ${year} بکرمی`;
        }
        const urduMonth = getGregorianMonthUrdu(currentDate);
        const year = currentDate.getFullYear();
        return `${urduMonth} ${year}`;
    };

    const generateGrid = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDayIndex = firstDay.getDay(); 
        const daysInMonth = lastDay.getDate();

        const days = [];
        for (let i = 0; i < startDayIndex; i++) days.push(null);
        for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));
        return days;
    };

    const days = generateGrid();
    const weekDays = ['اتوار', 'پیر', 'منگل', 'بدھ', 'جمعرات', 'جمعہ', 'ہفتہ'];

    const themes = {
        gregorian: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800', active: 'bg-blue-600', icon: 'text-blue-600' },
        hijri: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-800', active: 'bg-emerald-600', icon: 'text-emerald-600' },
        punjabi: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-800', active: 'bg-orange-600', icon: 'text-orange-600' },
    };
    const theme = themes[calendarType];

    const currentMonthEvents = SPECIAL_DAYS_DATA.filter(
        (e) => e.m === currentDate.getMonth() + 1
    ).sort((a, b) => a.d - b.d);

    return (
        <div className="max-w-5xl mx-auto animate-fade-in">
            <BackButton onClick={onBack} />
            
            <TodayPanel />

            <div className={`bg-white rounded-3xl shadow-xl border ${theme.border} overflow-hidden w-full`}>
                <div className={`${theme.bg} p-4 md:p-6 flex flex-col md:flex-row items-center justify-between gap-4 border-b ${theme.border}`}>
                    <div className="flex items-center gap-4">
                        <div className={`p-3 bg-white rounded-full shadow-sm ${theme.icon}`}>
                            <CalendarDays size={24} />
                        </div>
                        <div>
                            <h2 className={`text-2xl font-bold ${theme.text}`}>{getHeaderDate()}</h2>
                            <p className="text-xs opacity-70 font-bold text-gray-600">
                                {calendarType === 'gregorian' ? 'عیسوی کیلنڈر' : calendarType === 'hijri' ? 'اسلامی/ہجری کیلنڈر' : 'پنجابی/بکرمی کیلنڈر'}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 bg-white/50 p-1.5 rounded-xl">
                        <button onClick={() => setCalendarType('gregorian')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${calendarType === 'gregorian' ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-blue-100 text-blue-800'}`}>عیسوی</button>
                        <button onClick={() => setCalendarType('hijri')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${calendarType === 'hijri' ? 'bg-emerald-600 text-white shadow-md' : 'hover:bg-emerald-100 text-emerald-800'}`}>اسلامی</button>
                        <button onClick={() => setCalendarType('punjabi')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${calendarType === 'punjabi' ? 'bg-orange-600 text-white shadow-md' : 'hover:bg-orange-100 text-orange-800'}`}>پنجابی (Desi)</button>
                    </div>
                </div>
                
                <div className="relative flex flex-col sm:flex-row justify-center items-center p-4 bg-gray-50 border-b border-gray-100 gap-4">
                    <div className="flex items-center gap-1 bg-white p-1.5 rounded-2xl shadow-sm border border-gray-200 z-10">
                        <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-xl text-gray-600 transition-colors" aria-label="Previous Month">
                            <ChevronRight size={20} />
                        </button>
                        <div className="h-5 w-px bg-gray-200 mx-1"></div>
                        <div className="flex items-center">
                            <select 
                                value={currentDate.getMonth()} 
                                onChange={handleMonthChange}
                                className="bg-transparent font-bold text-gray-700 text-sm py-1 px-2 cursor-pointer outline-none text-center hover:text-emerald-700 transition-colors appearance-none"
                            >
                                {urduMonths.map((m, i) => (
                                    <option key={i} value={i}>{m}</option>
                                ))}
                            </select>
                            <input 
                                type="number" 
                                value={yearInput} 
                                onChange={handleYearChange}
                                className="w-16 bg-transparent font-bold text-gray-700 text-sm py-1 outline-none text-center hover:text-emerald-700 transition-colors"
                            />
                        </div>
                        <div className="h-5 w-px bg-gray-200 mx-1"></div>
                        <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-xl text-gray-600 transition-colors" aria-label="Next Month">
                            <ChevronLeft size={20} />
                        </button>
                    </div>
                    <button onClick={goToToday} className="sm:absolute sm:left-4 px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-xl font-bold text-xs hover:bg-gray-100 transition-colors shadow-sm">
                        آج (Today)
                    </button>
                </div>

                <div className="p-2 md:p-4 w-full overflow-hidden">
                    <div className="grid grid-cols-7 text-center mb-2">
                        {weekDays.map((d, i) => (
                            <div key={i} className={`text-[10px] sm:text-xs md:text-sm font-bold ${i === 5 ? 'text-emerald-600' : 'text-gray-500'} py-2`}>{d}</div>
                        ))}
                    </div>
                    <div className="grid grid-cols-7 gap-1 md:gap-2 auto-rows-fr">
                        {days.map((date, idx) => {
                            if (!date) return <div key={idx} className="aspect-[4/5] sm:aspect-square"></div>;
                            const isToday = date.toDateString() === new Date().toDateString();
                            
                            const gregDate = date.getDate().toString();
                            const gregMonth = getGregorianMonthUrdu(date);
                            const hijriDateNum = safeIntlFormat(date, 'ur-PK', { calendar: 'islamic-umalqura', day: 'numeric' });
                            const hijriMonth = getHijriMonthUrdu(date);
                            const hindiDateNum = safeIntlFormat(date, 'hi-IN-u-ca-indian', { calendar: 'indian', day: 'numeric' });
                            const hindiMonth = getHindiMonthUrdu(date);

                            let mainDisplay = '', subDisplay1 = '', subDisplay2 = '';
                            if (calendarType === 'gregorian') {
                                mainDisplay = gregDate;
                                subDisplay1 = `${hijriMonth} ${hijriDateNum}`;
                                subDisplay2 = `${hindiMonth} ${hindiDateNum}`;
                            } else if (calendarType === 'hijri') {
                                mainDisplay = hijriDateNum;
                                subDisplay1 = `${gregMonth} ${gregDate}`;
                                subDisplay2 = `${hindiMonth} ${hindiDateNum}`;
                            } else { 
                                mainDisplay = hindiDateNum;
                                subDisplay1 = `${gregMonth} ${gregDate}`;
                                subDisplay2 = `${hijriMonth} ${hijriDateNum}`;
                            }

                            const event = SPECIAL_DAYS_DATA.find(e => e.d === date.getDate() && e.m === date.getMonth() + 1);

                            return (
                                <div key={idx} className={`aspect-[4/5] sm:aspect-square rounded-xl md:rounded-2xl flex flex-col items-center justify-center relative transition-all cursor-default border p-0.5 ${isToday ? `${theme.active} text-white shadow-lg scale-105 z-10 border-transparent` : `bg-white hover:bg-gray-50 ${theme.border} text-gray-700`}`}>
                                    <span className={`text-base sm:text-xl md:text-2xl font-bold leading-none mb-1 ${isToday ? 'text-white' : theme.text}`}>{mainDisplay}</span>
                                    <div className="flex flex-col items-center leading-tight gap-0.5 w-full">
                                        <span className={`text-[6px] sm:text-[8px] md:text-[9px] font-medium truncate w-full text-center ${isToday ? 'text-white/90' : 'text-gray-500'}`}>{subDisplay1}</span>
                                        <span className={`text-[6px] sm:text-[8px] md:text-[9px] font-medium truncate w-full text-center ${isToday ? 'text-white/90' : 'text-gray-400'}`}>{subDisplay2}</span>
                                    </div>
                                    {event && !isToday && (
                                        <div className="absolute top-1 right-1 w-1.5 h-1.5 md:w-2 md:h-2 bg-red-500 rounded-full animate-pulse"></div>
                                    )}
                                     {event && isToday && (
                                        <div className="absolute top-1 right-1 w-1.5 h-1.5 md:w-2 md:h-2 bg-yellow-300 rounded-full animate-pulse shadow-sm"></div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="mt-6 bg-white p-6 rounded-3xl border border-blue-100 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/10 rounded-full blur-2xl transform translate-x-10 -translate-y-10"></div>
                <h3 className="font-bold text-xl text-blue-900 mb-4 flex items-center gap-2 relative z-10">
                    <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                         <Sparkles size={20} className="text-yellow-500 fill-yellow-500" />
                    </div>
                    اس ماہ کے خاص ایام (Special Days)
                </h3>
                <div className="space-y-2 relative z-10">
                    {currentMonthEvents.length > 0 ? (
                        currentMonthEvents.map((ev, i) => (
                            <div key={i} className="flex gap-4 items-center p-3 bg-gradient-to-r from-blue-50 to-transparent rounded-2xl border border-blue-50 hover:border-blue-200 transition-colors">
                                <div className="bg-white text-blue-800 font-bold w-12 h-12 flex items-center justify-center rounded-xl shadow-sm text-lg border border-blue-100 shrink-0">
                                    {ev.d}
                                </div>
                                <span className="text-base font-medium text-gray-800">{ev.label}</span>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-8 text-gray-400 flex flex-col items-center">
                            <Calendar size={32} className="mb-2 opacity-20" />
                            <p>اس ماہ کوئی خاص عالمی دن درج نہیں ہے۔</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- Prayer Times Section ---
export const PrayerTimesSection = ({ onBack }: SectionProps) => {
    const [city, setCity] = useState('');
    const [locationInput, setLocationInput] = useState('Lahore, Pakistan');
    const [isEditingLocation, setIsEditingLocation] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isAutoLocating, setIsAutoLocating] = useState(true);
    const [jurist, setJurist] = useState<'hanafi' | 'shafi'>('hanafi');
    const [prayerData, setPrayerData] = useState<any>(null);
    const [currentDate, setCurrentDate] = useState(new Date());
    
    // Customization State
    const [customOffsets, setCustomOffsets] = useState<Record<string, number>>({});
    const [activeAlarms, setActiveAlarms] = useState<Record<string, boolean>>({});

    // Load settings from local storage
    useEffect(() => {
        const savedOffsets = localStorage.getItem('prayer_offsets');
        if (savedOffsets) setCustomOffsets(JSON.parse(savedOffsets));
        
        const savedAlarms = localStorage.getItem('prayer_alarms');
        if (savedAlarms) setActiveAlarms(JSON.parse(savedAlarms));
    }, []);

    // Ensure date stays fresh
    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date();
            if (now.getDate() !== currentDate.getDate()) {
                setCurrentDate(now);
            }
        }, 60000);
        return () => clearInterval(timer);
    }, [currentDate]);

    const changeOffset = (key: string, delta: number) => {
        const newOffsets = { ...customOffsets, [key]: (customOffsets[key] || 0) + delta };
        setCustomOffsets(newOffsets);
        localStorage.setItem('prayer_offsets', JSON.stringify(newOffsets));
    };

    const toggleAlarm = (key: string) => {
        const newAlarms = { ...activeAlarms, [key]: !activeAlarms[key] };
        setActiveAlarms(newAlarms);
        localStorage.setItem('prayer_alarms', JSON.stringify(newAlarms));
    };

    // Initial load
    useEffect(() => {
        if (navigator.geolocation) {
            setIsAutoLocating(true);
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    fetchPrayerTimes(undefined, { lat: latitude, long: longitude });
                },
                (error) => {
                    console.error("Geolocation denied or error:", error);
                    setIsAutoLocating(false);
                    fetchPrayerTimes('Lahore, Pakistan');
                }
            );
        } else {
            setIsAutoLocating(false);
            fetchPrayerTimes('Lahore, Pakistan');
        }
    }, []);

    // Refetch if jurist method changes AND we already have data
    useEffect(() => {
        if (prayerData) {
            handleManualSearch();
        }
    }, [jurist]);

    const fetchPrayerTimes = async (cityName?: string, coords?: { lat: number, long: number }) => {
        setLoading(true);
        setPrayerData(null);
        const dateStr = new Date().toLocaleDateString('en-US', { dateStyle: 'full' });
        
        let locationStr = cityName || locationInput;
        if (coords) locationStr = `Lat: ${coords.lat}, Long: ${coords.long}`;

        const prompt = `
        Calculate precise prayer times.
        Location: ${locationStr}
        Date: ${dateStr}
        Asr Calculation Method: ${jurist === 'hanafi' ? 'Hanafi (Later time)' : 'Standard/Shafi (Earlier time)'}.
        
        Return the result in strictly valid JSON format. Do not use Markdown. 
        Structure:
        {
          "locationName": "City Name, Country",
          "islamicDate": "DD Month YYYY",
          "fajr": "HH:MM AM",
          "sunrise": "HH:MM AM",
          "dhuhr": "HH:MM PM",
          "asr": "HH:MM PM",
          "sunset": "HH:MM PM",
          "maghrib": "HH:MM PM",
          "isha": "HH:MM PM",
          "ishraq": "HH:MM AM",
          "chasht": "HH:MM AM",
          "zawal_start": "HH:MM AM/PM",
          "tahajjud": "HH:MM AM"
        }
        `;
        
        try {
            const res = await generateSpiritualResponse(prompt);
            const cleanJson = res.replace(/```json/g, '').replace(/```/g, '').trim();
            const parsed = JSON.parse(cleanJson);
            setPrayerData(parsed);
            if(parsed.locationName) setCity(parsed.locationName);
        } catch (e) {
            console.error("Failed to parse prayer JSON", e);
            setPrayerData({ error: true });
        } finally {
            setLoading(false);
            setIsAutoLocating(false);
            setIsEditingLocation(false);
        }
    };

    const handleManualSearch = () => {
        fetchPrayerTimes(locationInput);
    };

    const hijriDate = safeIntlFormat(currentDate, 'ur-PK', { calendar: 'islamic-umalqura', day: 'numeric', month: 'long', year: 'numeric' });

    return (
        <div className="max-w-4xl mx-auto animate-fade-in pb-10">
            <BackButton onClick={onBack} />
            
            {/* Header Card */}
            <div className="bg-gradient-to-r from-emerald-900 to-teal-800 rounded-3xl p-6 text-white shadow-xl mb-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl transform translate-x-10 -translate-y-10"></div>
                
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                             {isAutoLocating ? <Loader2 className="animate-spin w-4 h-4"/> : <MapPin className="w-4 h-4 text-emerald-300" />}
                             <h2 className="text-2xl font-bold">{city || locationInput}</h2>
                             <button onClick={() => setIsEditingLocation(!isEditingLocation)} className="p-1.5 bg-white/10 rounded-full hover:bg-white/20 transition-colors"><Edit2 size={12} /></button>
                        </div>
                        <div className="flex gap-4 text-sm font-medium text-emerald-100 opacity-90">
                            <span>{hijriDate}</span>
                            <span>•</span>
                            <span dir="ltr">{currentDate.toDateString()}</span>
                        </div>
                    </div>
                    
                    <div className="flex flex-col gap-2 w-full md:w-auto">
                         <div className="bg-black/20 rounded-xl p-1 flex text-xs font-bold border border-white/10">
                             <button 
                                onClick={() => setJurist('hanafi')}
                                className={`flex-1 px-4 py-2 rounded-lg transition-all ${jurist === 'hanafi' ? 'bg-white text-emerald-900 shadow-sm' : 'text-emerald-100 hover:bg-white/5'}`}
                             >
                                فقہ حنفی (پاکستان)
                             </button>
                             <button 
                                onClick={() => setJurist('shafi')}
                                className={`flex-1 px-4 py-2 rounded-lg transition-all ${jurist === 'shafi' ? 'bg-white text-emerald-900 shadow-sm' : 'text-emerald-100 hover:bg-white/5'}`}
                             >
                                فقہ شافعی/مالکی
                             </button>
                         </div>
                    </div>
                </div>

                 {/* Manual Location Input */}
                 {isEditingLocation && (
                    <div className="mt-4 pt-4 border-t border-white/10 animate-fade-in flex gap-2">
                        <input 
                            type="text" 
                            value={locationInput}
                            onChange={(e) => setLocationInput(e.target.value)}
                            placeholder="شہر کا نام..."
                            className="flex-1 p-2 rounded-xl text-emerald-900 text-sm outline-none"
                        />
                        <button onClick={handleManualSearch} className="bg-yellow-400 text-emerald-900 px-4 py-2 rounded-xl font-bold text-sm hover:bg-yellow-300">
                            تلاش
                        </button>
                    </div>
                )}
            </div>

            {loading ? (
                <div className="p-12 text-center">
                    <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-500 font-bold">اوقات کا حساب لگایا جا رہا ہے...</p>
                </div>
            ) : prayerData && !prayerData.error ? (
                <>
                    {/* Main Prayers Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4 mb-6">
                        <PrayerCard 
                            title="فجر" 
                            time={prayerData.fajr} 
                            icon={CloudSun} 
                            color="from-blue-400 to-blue-600" 
                            prayerKey="fajr"
                            customOffset={customOffsets['fajr']}
                            isAlarm={activeAlarms['fajr']}
                            onOffsetChange={changeOffset}
                            onAlarmToggle={toggleAlarm}
                        />
                        <PrayerCard 
                            title="طلوع آفتاب" 
                            time={prayerData.sunrise} 
                            icon={Sunrise} 
                            color="from-orange-400 to-red-500" 
                            isForbidden={true} 
                            prayerKey="sunrise" 
                            customOffset={0}
                            isAlarm={false}
                            onOffsetChange={() => {}}
                            onAlarmToggle={() => {}}
                        />
                        <PrayerCard 
                            title="ظہر" 
                            time={prayerData.dhuhr} 
                            icon={Sun} 
                            color="from-yellow-400 to-orange-500" 
                            prayerKey="dhuhr" 
                            customOffset={customOffsets['dhuhr']}
                            isAlarm={activeAlarms['dhuhr']}
                            onOffsetChange={changeOffset}
                            onAlarmToggle={toggleAlarm}
                        />
                        <PrayerCard 
                            title="عصر" 
                            time={prayerData.asr} 
                            icon={CloudSun} 
                            color="from-orange-300 to-orange-600" 
                            isActive={true} 
                            prayerKey="asr" 
                            customOffset={customOffsets['asr']}
                            isAlarm={activeAlarms['asr']}
                            onOffsetChange={changeOffset}
                            onAlarmToggle={toggleAlarm}
                        /> 
                        <PrayerCard 
                            title="مغرب" 
                            time={prayerData.maghrib} 
                            icon={Sunset} 
                            color="from-indigo-400 to-purple-600" 
                            prayerKey="maghrib" 
                            customOffset={customOffsets['maghrib']}
                            isAlarm={activeAlarms['maghrib']}
                            onOffsetChange={changeOffset}
                            onAlarmToggle={toggleAlarm}
                        />
                        <PrayerCard 
                            title="عشاء" 
                            time={prayerData.isha} 
                            icon={Moon} 
                            color="from-slate-600 to-slate-800" 
                            prayerKey="isha" 
                            customOffset={customOffsets['isha']}
                            isAlarm={activeAlarms['isha']}
                            onOffsetChange={changeOffset}
                            onAlarmToggle={toggleAlarm}
                        />
                    </div>

                    {/* Nawafil Section */}
                    <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">
                        <h3 className="font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
                            <Star className="text-yellow-500 fill-yellow-500" size={18} /> نوافل و ممنوعہ اوقات
                        </h3>
                        <div className="divide-y divide-gray-100">
                            <div className="py-3 flex justify-between items-center">
                                <span className="text-gray-600 text-sm">نماز اشراق (طلوع کے 20 منٹ بعد)</span>
                                <span className="font-bold text-emerald-700" dir="ltr">{adjustTimeStr(prayerData.ishraq, customOffsets['ishraq'] || 0)}</span>
                            </div>
                            <div className="py-3 flex justify-between items-center">
                                <span className="text-gray-600 text-sm">نماز چاشت</span>
                                <span className="font-bold text-emerald-700" dir="ltr">{adjustTimeStr(prayerData.chasht, customOffsets['chasht'] || 0)}</span>
                            </div>
                            <div className="py-3 flex justify-between items-center bg-red-50 px-2 rounded-lg">
                                <span className="text-red-600 font-bold text-sm">زوال (ممنوعہ وقت)</span>
                                <span className="font-bold text-red-700" dir="ltr">{prayerData.zawal_start}</span>
                            </div>
                            <div className="py-3 flex justify-between items-center">
                                <span className="text-gray-600 text-sm">نماز تہجد</span>
                                <span className="font-bold text-indigo-700" dir="ltr">{adjustTimeStr(prayerData.tahajjud, customOffsets['tahajjud'] || 0)}</span>
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                !loading && <div className="text-center p-8 bg-red-50 rounded-2xl text-red-600">
                    معذرت، ڈیٹا حاصل کرنے میں مسئلہ پیش آیا۔ دوبارہ کوشش کریں۔
                    <button onClick={handleManualSearch} className="block mx-auto mt-2 underline">دوبارہ کوشش</button>
                </div>
            )}
        </div>
    );
};

// --- Numerology Section ---
export const NumerologySection = ({ onBack }: SectionProps) => {
    // Default current day and date in Urdu
    const today = new Date();
    const defaultDay = today.toLocaleDateString('ur-PK', { weekday: 'long' });
    const defaultDate = today.toLocaleDateString('ur-PK', { dateStyle: 'long' });

    const [data, setData] = useState<any>({ 
        name: '', 
        motherName: '', 
        dob: '', 
        birthTime: '',
        day: defaultDay,
        date: defaultDate,
        partnerName: '', 
        mobile: '' 
    });
    const [topic, setTopic] = useState('general');
    const [result, setResult] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleAnalyze = async () => {
        if (!data.name) return alert("براہ کرم نام لکھیں");
        setLoading(true);
        setResult(null);
        let extra = '';
        if (topic === 'relation_spouse') extra = data.partnerName;
        if (topic === 'mobile_analysis') extra = data.mobile;
        
        const res = await getNumerologyAnalysis(data, topic, extra);
        setResult(res);
        setLoading(false);
    };

    const topics = [
        { id: 'general', label: 'عمومی جائزہ', icon: User },
        { id: 'relation_spouse', label: 'شریک حیات', icon: Heart },
        { id: 'business_suitability', label: 'کاروبار', icon: Briefcase },
        { id: 'lucky_stone', label: 'لکی پتھر', icon: Gem },
        { id: 'mobile_analysis', label: 'موبائل نمبر', icon: Smartphone },
        { id: 'future_analysis', label: 'مستقبل', icon: TrendingUp },
    ];

    return (
        <div className="max-w-2xl mx-auto animate-fade-in">
            <BackButton onClick={onBack} />
            <div className="bg-white rounded-3xl shadow-xl p-6 border border-emerald-100">
                <div className="flex items-center gap-3 mb-6 border-b pb-4">
                    <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
                        <Calculator size={24} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">علم الاعداد (Numerology)</h2>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-6">
                    {topics.map(t => (
                        <button 
                            key={t.id}
                            onClick={() => setTopic(t.id)}
                            className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${topic === t.id ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-emerald-50'}`}
                        >
                            <t.icon size={20} />
                            <span className="text-xs font-bold">{t.label}</span>
                        </button>
                    ))}
                </div>

                <div className="space-y-4">
                    <VoiceInput value={data.name} onChange={v => setData({...data, name: v})} placeholder="آپ کا نام" />
                    <VoiceInput value={data.motherName} onChange={v => setData({...data, motherName: v})} placeholder="والدہ کا نام" />
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <VoiceInput value={data.day} onChange={v => setData({...data, day: v})} placeholder="دن (مثلاً: پیر)" />
                        <VoiceInput value={data.date} onChange={v => setData({...data, date: v})} placeholder="تاریخ (مثلاً: 12 مارچ 2024)" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <VoiceInput value={data.dob} onChange={v => setData({...data, dob: v})} placeholder="تاریخ پیدائش" />
                        <VoiceInput value={data.birthTime} onChange={v => setData({...data, birthTime: v})} placeholder="وقت پیدائش (مثلاً: صبح 10 بجے)" />
                    </div>
                    
                    {topic === 'relation_spouse' && (
                        <VoiceInput value={data.partnerName} onChange={v => setData({...data, partnerName: v})} placeholder="شریک حیات / پارٹنر کا نام" />
                    )}
                    {topic === 'mobile_analysis' && (
                        <VoiceInput value={data.mobile} onChange={v => setData({...data, mobile: v})} placeholder="موبائل نمبر" type="tel" />
                    )}

                    <button onClick={handleAnalyze} disabled={loading} className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold text-lg shadow-lg hover:bg-emerald-700 transition-all disabled:opacity-70 flex justify-center items-center gap-2">
                        {loading ? <Loader2 className="animate-spin" /> : <>تجزیہ کریں <Sparkles size={20} /></>}
                    </button>
                </div>
            </div>
            <GenericResult loading={loading} result={result} title="رپورٹ علم الاعداد" />
        </div>
    );
};

// --- Medical Section ---
export const MedicalSection = ({ onBack }: SectionProps) => {
    const [mode, setMode] = useState<'diagnose' | 'treatment' | 'medicine'>('diagnose');
    const [symptoms, setSymptoms] = useState('');
    const [image, setImage] = useState<string | undefined>(undefined);
    const [treatmentType, setTreatmentType] = useState('طب یونانی (Herbal)');
    const [result, setResult] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleAction = async () => {
        setLoading(true);
        setResult(null);
        let res = "";
        if (mode === 'diagnose') {
            res = await getInitialDiagnosis(symptoms, image);
        } else if (mode === 'treatment') {
            res = await getMedicalDiagnosis(symptoms, treatmentType, image);
        } else if (mode === 'medicine') {
            if (!image) { alert("تصویر لازمی ہے"); setLoading(false); return; }
            res = await analyzeMedicine(image);
        }
        setResult(res);
        setLoading(false);
    };

    return (
        <div className="max-w-3xl mx-auto animate-fade-in">
            <BackButton onClick={onBack} />
            
            <div className="bg-white rounded-3xl shadow-lg border border-blue-100 overflow-hidden">
                <div className="flex bg-blue-50 border-b border-blue-100">
                    <button onClick={() => setMode('diagnose')} className={`flex-1 p-4 text-center font-bold text-sm transition-colors ${mode === 'diagnose' ? 'bg-white text-blue-600 border-t-2 border-blue-600' : 'text-gray-500 hover:bg-blue-100/50'}`}>تشخیص (Diagnosis)</button>
                    <button onClick={() => setMode('treatment')} className={`flex-1 p-4 text-center font-bold text-sm transition-colors ${mode === 'treatment' ? 'bg-white text-blue-600 border-t-2 border-blue-600' : 'text-gray-500 hover:bg-blue-100/50'}`}>علاج (Treatment)</button>
                    <button onClick={() => setMode('medicine')} className={`flex-1 p-4 text-center font-bold text-sm transition-colors ${mode === 'medicine' ? 'bg-white text-blue-600 border-t-2 border-blue-600' : 'text-gray-500 hover:bg-blue-100/50'}`}>میڈیسن گائیڈ</button>
                </div>

                <div className="p-6 space-y-6">
                    {mode !== 'medicine' && (
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">علامات / مسئلہ لکھیں:</label>
                            <VoiceInput 
                                multiline
                                placeholder="مثلاً: سر میں درد ہے، بخار ہے..."
                                value={symptoms}
                                onChange={setSymptoms}
                            />
                        </div>
                    )}

                    {mode === 'treatment' && (
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">طریقہ علاج منتخب کریں:</label>
                            <select 
                                className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none text-right bg-white"
                                value={treatmentType}
                                onChange={e => setTreatmentType(e.target.value)}
                            >
                                <option>طب یونانی (Herbal)</option>
                                <option>ہومیوپیتھک (Homeopathy)</option>
                                <option>ایلوپیتھک (Allopathic)</option>
                                <option>حجامہ تھراپی (Hijama)</option>
                                <option>آروما تھراپی (Aromatherapy)</option>
                            </select>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">تصویر اپلوڈ کریں (اختیاری):</label>
                        <FileUploader onSelect={setImage} label={mode === 'medicine' ? "دوائی کی تصویر" : "زبان / چہرہ / رپورٹ کی تصویر"} />
                        {image && <p className="text-xs text-green-600 mt-2 text-center font-bold">تصویر منتخب ہو گئی ✅</p>}
                    </div>

                    <button 
                        onClick={handleAction}
                        disabled={loading}
                        className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-lg shadow-lg hover:bg-blue-700 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : <>نتیجہ دیکھیں <Stethoscope size={20} /></>}
                    </button>
                </div>
            </div>
            <GenericResult loading={loading} result={result} title="طبی رپورٹ" />
        </div>
    );
};

// --- Document Reader Section ---
export const DocumentSection = ({ onBack }: SectionProps) => {
    const [image, setImage] = useState<string | null>(null);
    const [result, setResult] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleScan = async () => {
        if (!image) return alert("براہ کرم دستاویز کی تصویر اپلوڈ کریں");
        setLoading(true);
        const res = await scanDocument(image);
        setResult(res);
        setLoading(false);
    };

    return (
        <div className="max-w-2xl mx-auto animate-fade-in">
            <BackButton onClick={onBack} />
            <div className="bg-white rounded-3xl shadow-lg p-6 border border-gray-200">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-gray-100 rounded-xl text-gray-700"><FileText size={24} /></div>
                    <h2 className="text-xl font-bold">دستاویز ریڈر (Document Reader)</h2>
                </div>
                
                <div className="space-y-4">
                    <FileUploader onSelect={setImage} label="رپورٹ یا نسخہ اپلوڈ کریں" />
                    {image && <img src={image} alt="Preview" className="w-full h-48 object-cover rounded-xl border" />}
                    
                    <button onClick={handleScan} disabled={loading} className="w-full py-4 bg-gray-800 text-white rounded-xl font-bold shadow-lg hover:bg-gray-900 transition-all disabled:opacity-70 flex justify-center gap-2">
                        {loading ? <Loader2 className="animate-spin" /> : <>تجزیہ کریں <Sparkles size={20} /></>}
                    </button>
                </div>
            </div>
            <GenericResult loading={loading} result={result} title="دستاویز کا خلاصہ" />
        </div>
    );
};

// --- General AI Section (Spiritual) ---
export const GeneralAISection = ({ onBack, title, icon: Icon, colorClass, promptContext }: any) => {
    const [query, setQuery] = useState('');
    const [result, setResult] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleAsk = async () => {
        if (!query) return;
        setLoading(true);
        setResult(null);
        const prompt = `${promptContext}\n\nصارف کا سوال: ${query}`;
        const res = await generateSpiritualResponse(prompt);
        setResult(res);
        setLoading(false);
    };

    return (
        <div className="max-w-2xl mx-auto animate-fade-in">
            <BackButton onClick={onBack} />
            <div className={`bg-white rounded-3xl shadow-xl p-6 border-t-4 ${colorClass || 'border-emerald-500'}`}>
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600"><Icon size={24} /></div>
                    <h2 className="text-xl font-bold">{title}</h2>
                </div>
                
                <div className="space-y-4">
                    <VoiceInput 
                        multiline
                        placeholder="اپنا مسئلہ یا سوال یہاں لکھیں..."
                        value={query}
                        onChange={setQuery}
                    />
                    <button onClick={handleAsk} disabled={loading} className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold shadow-lg hover:bg-emerald-700 transition-all disabled:opacity-70 flex justify-center gap-2">
                        {loading ? <Loader2 className="animate-spin" /> : <>پوچھیں <Send size={20} /></>}
                    </button>
                </div>
            </div>
            <GenericResult loading={loading} result={result} title={title} />
        </div>
    );
};

// --- Horoscope Section ---
export const HoroscopeSection = ({ onBack }: SectionProps) => {
    const today = new Date();
    const defaultDay = today.toLocaleDateString('ur-PK', { weekday: 'long' });
    const defaultDate = today.toLocaleDateString('ur-PK', { dateStyle: 'long' });
    
    const [data, setData] = useState({ 
        name: '', 
        motherName: '', 
        dob: '', 
        birthTime: '',
        day: defaultDay,
        date: defaultDate,
    });
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<string | null>(null);

    const handleAnalyze = async () => {
        if(!data.name) return alert("نام لکھنا ضروری ہے");
        setLoading(true);
        const res = await getHoroscopeAnalysis(data, 'chart');
        setResult(res);
        setLoading(false);
    };

    return (
        <div className="max-w-2xl mx-auto animate-fade-in">
            <BackButton onClick={onBack} />
            <div className="bg-white rounded-3xl shadow-xl p-6 border border-orange-100">
                <div className="flex items-center gap-3 mb-6 border-b pb-4">
                    <div className="p-3 bg-orange-100 text-orange-600 rounded-xl"><Star size={24} /></div>
                    <h2 className="text-2xl font-bold text-gray-800">زائچہ قسمت (Horoscope)</h2>
                </div>
                
                <div className="space-y-4">
                    <VoiceInput value={data.name} onChange={v => setData({...data, name: v})} placeholder="آپ کا نام" />
                    <VoiceInput value={data.motherName} onChange={v => setData({...data, motherName: v})} placeholder="والدہ کا نام" />
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <VoiceInput value={data.day} onChange={v => setData({...data, day: v})} placeholder="دن" />
                        <VoiceInput value={data.date} onChange={v => setData({...data, date: v})} placeholder="تاریخ" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                         <VoiceInput value={data.dob} onChange={v => setData({...data, dob: v})} placeholder="تاریخ پیدائش" />
                         <VoiceInput value={data.birthTime} onChange={v => setData({...data, birthTime: v})} placeholder="وقت پیدائش" />
                    </div>

                    <button onClick={handleAnalyze} disabled={loading} className="w-full py-4 bg-orange-600 text-white rounded-xl font-bold text-lg shadow-lg hover:bg-orange-700 transition-all disabled:opacity-70 flex justify-center items-center gap-2">
                        {loading ? <Loader2 className="animate-spin" /> : <>زائچہ نکالیں <Sparkles size={20} /></>}
                    </button>
                </div>
            </div>
            <GenericResult loading={loading} result={result} title="آپ کا زائچہ" />
        </div>
    );
};

// --- Black Magic Section ---
export const BlackMagicSection = ({ onBack }: SectionProps) => {
    const today = new Date();
    const defaultDay = today.toLocaleDateString('ur-PK', { weekday: 'long' });
    const defaultDate = today.toLocaleDateString('ur-PK', { dateStyle: 'long' });

    const [data, setData] = useState({ 
        name: '', 
        motherName: '', 
        dob: '', 
        birthTime: '',
        day: defaultDay,
        date: defaultDate,
        problem: '' 
    });
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<string | null>(null);

    const handleDiagnose = async () => {
        if(!data.name) return alert("نام لکھنا ضروری ہے");
        setLoading(true);
        const res = await getBlackMagicDiagnosis(data, 'diagnosis');
        setResult(res);
        setLoading(false);
    };

    return (
        <div className="max-w-2xl mx-auto animate-fade-in">
            <BackButton onClick={onBack} />
            <div className="bg-white rounded-3xl shadow-xl p-6 border border-red-100">
                <div className="flex items-center gap-3 mb-6 border-b pb-4">
                    <div className="p-3 bg-red-100 text-red-600 rounded-xl"><ShieldCheck size={24} /></div>
                    <h2 className="text-2xl font-bold text-gray-800">کالا جادو / بندش (Diagnosis)</h2>
                </div>
                
                <div className="space-y-4">
                    <VoiceInput value={data.name} onChange={v => setData({...data, name: v})} placeholder="متاثرہ شخص کا نام" />
                    <VoiceInput value={data.motherName} onChange={v => setData({...data, motherName: v})} placeholder="والدہ کا نام" />
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <VoiceInput value={data.day} onChange={v => setData({...data, day: v})} placeholder="دن" />
                        <VoiceInput value={data.date} onChange={v => setData({...data, date: v})} placeholder="تاریخ" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                         <VoiceInput value={data.dob} onChange={v => setData({...data, dob: v})} placeholder="تاریخ پیدائش" />
                         <VoiceInput value={data.birthTime} onChange={v => setData({...data, birthTime: v})} placeholder="وقت پیدائش" />
                    </div>

                    <VoiceInput value={data.problem} onChange={v => setData({...data, problem: v})} placeholder="مسئلہ / علامات (اختیاری)" multiline />

                    <button onClick={handleDiagnose} disabled={loading} className="w-full py-4 bg-red-600 text-white rounded-xl font-bold text-lg shadow-lg hover:bg-red-700 transition-all disabled:opacity-70 flex justify-center items-center gap-2">
                        {loading ? <Loader2 className="animate-spin" /> : <>تشخیص کریں <Activity size={20} /></>}
                    </button>
                </div>
            </div>
            <GenericResult loading={loading} result={result} title="روحانی تشخیص" />
        </div>
    );
};

// --- Time Science Section ---
export const TimeScienceSection = ({ onBack }: SectionProps) => {
    const today = new Date();
    const defaultDay = today.toLocaleDateString('ur-PK', { weekday: 'long' });
    const defaultDate = today.toLocaleDateString('ur-PK', { dateStyle: 'long' });

    const [data, setData] = useState({ 
        name: '', 
        motherName: '', 
        dob: '', 
        birthTime: '',
        day: defaultDay,
        date: defaultDate,
        question: ''
    });
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<string | null>(null);

    const handleAnalyze = async () => {
        setLoading(true);
        // We use a custom prompt for Time Science combining user data
        const prompt = `
        علم الساعات (Time Science) کے اصولوں پر تجزیہ کریں۔
        نام: ${data.name}
        والدہ: ${data.motherName}
        تاریخ پیدائش: ${data.dob}
        وقت پیدائش: ${data.birthTime}
        موجودہ دن اور تاریخ: ${data.day}, ${data.date}
        سوال/مقصد: ${data.question}

        بتائیں کہ یہ وقت ان کے لیے کیسا ہے؟ کیا کام کرنا چاہیے؟
        `;
        const res = await generateSpiritualResponse(prompt);
        setResult(res);
        setLoading(false);
    };

    return (
        <div className="max-w-2xl mx-auto animate-fade-in">
             <BackButton onClick={onBack} />
             <div className="bg-white rounded-3xl shadow-xl p-6 border border-purple-100">
                <div className="flex items-center gap-3 mb-6 border-b pb-4">
                    <div className="p-3 bg-purple-100 text-purple-600 rounded-xl"><Clock size={24} /></div>
                    <h2 className="text-2xl font-bold text-gray-800">علم الساعات (Time Science)</h2>
                </div>

                <div className="space-y-4">
                    <VoiceInput value={data.name} onChange={v => setData({...data, name: v})} placeholder="نام (اختیاری)" />
                    <VoiceInput value={data.motherName} onChange={v => setData({...data, motherName: v})} placeholder="والدہ کا نام (اختیاری)" />
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <VoiceInput value={data.day} onChange={v => setData({...data, day: v})} placeholder="دن" />
                        <VoiceInput value={data.date} onChange={v => setData({...data, date: v})} placeholder="تاریخ" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                         <VoiceInput value={data.dob} onChange={v => setData({...data, dob: v})} placeholder="تاریخ پیدائش" />
                         <VoiceInput value={data.birthTime} onChange={v => setData({...data, birthTime: v})} placeholder="وقت پیدائش" />
                    </div>

                    <VoiceInput value={data.question} onChange={v => setData({...data, question: v})} placeholder="کیا کام کرنا چاہتے ہیں؟ (سوال)" multiline />

                    <button onClick={handleAnalyze} disabled={loading} className="w-full py-4 bg-purple-600 text-white rounded-xl font-bold text-lg shadow-lg hover:bg-purple-700 transition-all disabled:opacity-70 flex justify-center items-center gap-2">
                        {loading ? <Loader2 className="animate-spin" /> : <>ساعت معلوم کریں <Sparkles size={20} /></>}
                    </button>
                </div>
             </div>
             <GenericResult loading={loading} result={result} title="علم الساعات رپورٹ" />
        </div>
    );
};

// --- Wazaif Section ---
export const WazaifSection = ({ onBack }: SectionProps) => {
    // Similar input structure as others
    const today = new Date();
    const defaultDay = today.toLocaleDateString('ur-PK', { weekday: 'long' });
    const defaultDate = today.toLocaleDateString('ur-PK', { dateStyle: 'long' });

    const [data, setData] = useState({ 
        name: '', 
        motherName: '', 
        dob: '', 
        birthTime: '',
        day: defaultDay,
        date: defaultDate,
        purpose: ''
    });
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<string | null>(null);

    const handleGetWazifa = async () => {
        if(!data.purpose && !data.name) return alert("براہ کرم نام اور مقصد لکھیں");
        setLoading(true);
        const prompt = `
        استخارہ اور وظائف سیکشن:
        نام: ${data.name}
        والدہ: ${data.motherName}
        تاریخ پیدائش: ${data.dob}
        مقصد/پریشانی: ${data.purpose}

        براہ کرم قرآن و سنت کی روشنی میں بہترین وظیفہ اور دعا تجویز کریں۔
        `;
        const res = await generateSpiritualResponse(prompt);
        setResult(res);
        setLoading(false);
    };

    return (
         <div className="max-w-2xl mx-auto animate-fade-in">
            <BackButton onClick={onBack} />
            <div className="bg-white rounded-3xl shadow-xl p-6 border border-teal-100">
                <div className="flex items-center gap-3 mb-6 border-b pb-4">
                    <div className="p-3 bg-teal-100 text-teal-600 rounded-xl"><BookOpen size={24} /></div>
                    <h2 className="text-2xl font-bold text-gray-800">استخارہ و وظائف</h2>
                </div>

                <div className="space-y-4">
                    <VoiceInput value={data.name} onChange={v => setData({...data, name: v})} placeholder="آپ کا نام" />
                    <VoiceInput value={data.motherName} onChange={v => setData({...data, motherName: v})} placeholder="والدہ کا نام" />
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <VoiceInput value={data.day} onChange={v => setData({...data, day: v})} placeholder="دن" />
                        <VoiceInput value={data.date} onChange={v => setData({...data, date: v})} placeholder="تاریخ" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                         <VoiceInput value={data.dob} onChange={v => setData({...data, dob: v})} placeholder="تاریخ پیدائش" />
                         <VoiceInput value={data.birthTime} onChange={v => setData({...data, birthTime: v})} placeholder="وقت پیدائش" />
                    </div>

                    <VoiceInput value={data.purpose} onChange={v => setData({...data, purpose: v})} placeholder="کس مقصد کے لیے وظیفہ چاہیے؟" multiline />

                    <button onClick={handleGetWazifa} disabled={loading} className="w-full py-4 bg-teal-600 text-white rounded-xl font-bold text-lg shadow-lg hover:bg-teal-700 transition-all disabled:opacity-70 flex justify-center items-center gap-2">
                        {loading ? <Loader2 className="animate-spin" /> : <>وظیفہ حاصل کریں <BookOpen size={20} /></>}
                    </button>
                </div>
            </div>
            <GenericResult loading={loading} result={result} title="آپ کا وظیفہ" />
         </div>
    );
};


// --- Contact Section ---
export const ContactSection = ({ onBack }: SectionProps) => {
    return (
        <div className="max-w-2xl mx-auto animate-fade-in">
            <BackButton onClick={onBack} />
            <div className="bg-white rounded-3xl shadow-xl p-8 border border-yellow-100 text-center">
                <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6 text-yellow-700">
                    <Phone size={40} />
                </div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">رابطہ کریں</h2>
                <p className="text-gray-500 mb-8">کسی بھی ذاتی رہنمائی یا اپائنٹمنٹ کے لیے نیچے دیے گئے نمبرز پر رابطہ کریں۔</p>
                
                <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-2xl flex items-center gap-4 hover:bg-emerald-50 transition-colors border border-gray-100">
                        <div className="bg-green-500 text-white p-3 rounded-full"><Phone size={20} /></div>
                        <div className="text-right">
                            <p className="font-bold text-gray-800 text-lg">حکیم غلام یاسین آرائیں</p>
                            <p className="text-emerald-600 font-bold" dir="ltr">+92 300 1234567</p>
                            <p className="text-xs text-gray-400">کہروڑ پکا</p>
                        </div>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-2xl flex items-center gap-4 hover:bg-emerald-50 transition-colors border border-gray-100">
                        <div className="bg-blue-500 text-white p-3 rounded-full"><Phone size={20} /></div>
                        <div className="text-right">
                            <p className="font-bold text-gray-800 text-lg">حاجی اشفاق احمد</p>
                            <p className="text-blue-600 font-bold" dir="ltr">+92 300 7654321</p>
                            <p className="text-xs text-gray-400">خانیوال (ماہر عملیات)</p>
                        </div>
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-100">
                    <p className="text-xs text-gray-400">Apps Talk SMC Pvt Ltd © 2024</p>
                </div>
            </div>
        </div>
    );
};
