
import React, { useState, useEffect, useRef } from 'react';
import { Upload, Send, BookOpen, Heart, Moon, Sun, Clock, Eye, ChevronRight, Stethoscope, ArrowRight, MapPin, Sunrise, Sunset, Bell, BellOff, Volume2, X, Gift, Calendar, Zap, Users, Home, Key, Hash, ShieldCheck, Activity, AlertTriangle, Briefcase, PenTool, Car, Ghost, Smile, Star, Phone, UserPlus, HelpCircle, Smartphone, Shield, Save, RefreshCw, Settings, Play, Pause, RotateCcw, Calculator, FileText, Edit2, Check, Fingerprint, Search, History, TrendingUp, Gem, Palette, HeartPulse, CalendarDays, ChevronLeft, Pill, Mic, ThermometerSun, CloudSun, Loader2, Sparkles, MessageSquare, User, Scale, SearchCheck, Globe, Navigation, ChevronDown, Plus, Minus, Trash2, Code2, Watch, Camera, Mail, Info, Book, HeartHandshake, Sparkle } from 'lucide-react';
import { getMedicalDiagnosis, getNumerologyAnalysis, scanDocument, generateSpiritualResponse, getInitialDiagnosis, getHoroscopeAnalysis, getBlackMagicDiagnosis, analyzeMedicine } from '../services/geminiService';
import GenericResult from './GenericResult';

interface SectionProps {
  onBack: () => void;
}

// --- Helper Functions (Top Level) ---

const abjadMap: Record<string, number> = {
    'ا': 1, 'آ': 1, 'ء': 1, 'ب': 2, 'پ': 2, 'ج': 3, 'چ': 3, 'د': 4, 'ہ': 5, 'ۃ': 5,
    'و': 6, 'ؤ': 6, 'ز': 7, 'ژ': 7, 'ح': 8, 'ط': 9, 'ی': 10, 'ئ': 10, 'ے': 10,
    'ک': 20, 'گ': 20, 'ل': 30, 'م': 40, 'ن': 50, 'س': 60, 'ع': 70, 'ف': 80,
    'ص': 90, 'ق': 100, 'ر': 200, 'ش': 300, 'ت': 400, 'ث': 500, 'خ': 600,
    'ذ': 700, 'ض': 800, 'ظ': 900, 'غ': 1000
};

const calculateAbjad = (text: string): number => {
    let total = 0;
    for (const char of text) {
        if (abjadMap[char]) {
            total += abjadMap[char];
        }
    }
    return total;
};

const getSingleDigit = (num: number): number => {
    while (num > 9) {
        num = num.toString().split('').reduce((acc, digit) => acc + parseInt(digit), 0);
    }
    return num;
};

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

const FileUploader = ({ onSelect, label, icon: Icon = Upload }: { onSelect: (b64: string) => void, label: string, icon?: any }) => {
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
    <div className="border-2 border-dashed border-gray-300 rounded-2xl p-4 text-center bg-gray-50 hover:bg-emerald-50 transition-all cursor-pointer relative w-full overflow-hidden group hover:border-emerald-400">
      <input type="file" accept="image/*" onChange={handleFile} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
      <div className="transform group-hover:scale-110 transition-transform duration-300 bg-white p-3 rounded-full inline-block shadow-md mb-2 text-emerald-600 ring-4 ring-gray-100 group-hover:ring-emerald-100">
        <Icon className="w-6 h-6" />
      </div>
      <p className="text-gray-900 font-bold text-sm mb-1">{label}</p>
      <p className="text-[10px] text-gray-500 font-medium">یہاں کلک کریں یا فائل منتخب کریں</p>
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
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    const handleListen = () => {
        if (!SpeechRecognition) {
            alert("معذرت، آپ کا براؤزر آواز کی شناخت کو سپورٹ نہیں کرتا۔ برائے مہربانی گوگل کروم استعمال کریں۔");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = 'ur-PK';
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onstart = () => {
            setIsListening(true);
            setStatus('idle');
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            if (transcript) {
                onChange(transcript);
                setStatus('success');
                // Auto-reset success state after delay
                setTimeout(() => setStatus('idle'), 2000);
            }
        };

        recognition.onerror = (event: any) => {
            setIsListening(false);
            setStatus('error');
            
            let errorMessage = "آواز کی شناخت میں مسئلہ پیش آیا۔";
            
            switch (event.error) {
                case 'not-allowed':
                    errorMessage = "مائیکروفون کے استعمال کی اجازت نہیں دی گئی۔ براہ کرم براؤزر سیٹنگز چیک کریں۔";
                    break;
                case 'no-speech':
                    errorMessage = "کوئی آواز سنائی نہیں دی۔ براہ کرم دوبارہ کوشش کریں اور مائیک کے قریب بولیں۔";
                    break;
                case 'network':
                    errorMessage = "انٹرنیٹ کا مسئلہ ہے۔ آواز کی شناخت کے لیے نیٹ ورک ضروری ہے۔";
                    break;
                case 'audio-capture':
                    errorMessage = "مائیکروفون نہیں ملا۔ براہ کرم یقینی بنائیں کہ مائیک جڑا ہوا ہے۔";
                    break;
                default:
                    errorMessage = `خرابی: ${event.error}`;
            }
            
            alert(errorMessage);
            setTimeout(() => setStatus('idle'), 3000);
        };

        try {
            recognition.start();
        } catch (e) {
            console.error("Speech Recognition start error:", e);
            setIsListening(false);
        }
    };

    const getStatusClasses = () => {
        if (status === 'success') return 'border-emerald-500 ring-2 ring-emerald-100 shadow-emerald-50';
        if (status === 'error') return 'border-red-500 ring-2 ring-red-100 shadow-red-50';
        return 'border-gray-200';
    };

    const commonClasses = `w-full rounded-xl border focus:ring-2 focus:ring-emerald-500 outline-none text-right pr-4 pl-12 bg-white/80 backdrop-blur-sm transition-all duration-300 ${getStatusClasses()} ${className}`;

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
                disabled={isListening}
                className={`absolute left-2 bottom-2 p-2.5 rounded-full transition-all shadow-md z-10 flex items-center justify-center ${
                    isListening 
                    ? 'bg-red-500 text-white animate-pulse' 
                    : status === 'success'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white text-emerald-600 border border-emerald-100 hover:bg-emerald-50 active:scale-95'
                }`}
                title="آواز کے ذریعے ٹائپ کریں"
            >
                {isListening ? (
                    <div className="relative">
                        <Mic size={18} />
                        <span className="absolute -inset-1 rounded-full border-2 border-white/40 animate-ping"></span>
                    </div>
                ) : status === 'success' ? (
                    <Check size={18} />
                ) : (
                    <Mic size={18} />
                )}
            </button>
            
            {/* Contextual Feedback Labels */}
            {isListening && (
                <div className="absolute left-14 bottom-2.5 text-[10px] font-bold text-red-500 animate-fade-in whitespace-nowrap bg-white/90 px-2 py-0.5 rounded-full border border-red-50 shadow-sm">
                    بولنا شروع کریں...
                </div>
            )}
            {status === 'success' && (
                <div className="absolute left-14 bottom-2.5 text-[10px] font-bold text-emerald-600 animate-fade-in whitespace-nowrap bg-white/90 px-2 py-0.5 rounded-full border border-emerald-50 shadow-sm">
                    درست موصول ہوا!
                </div>
            )}
        </div>
    );
};

// --- Settings Section ---
export const SettingsSection = ({ onBack }: SectionProps) => {
    return (
        <div className="max-w-2xl mx-auto animate-fade-in">
             <BackButton onClick={onBack} />
             <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-200">
                <div className="flex items-center gap-3 mb-6 border-b pb-4">
                    <div className="p-3 bg-gray-100 text-gray-600 rounded-xl"><Settings size={24} /></div>
                    <h2 className="text-2xl font-bold text-gray-800">ترتیبات (Settings)</h2>
                </div>

                <div className="space-y-6">
                    <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 shadow-sm text-center">
                        <p className="text-sm text-gray-500 leading-relaxed">
                            ایپ کی تمام ترتیبات اب براہ راست کلاؤڈ کے ذریعے منظم کی جاتی ہیں۔ آپ کی پرائیویسی اور ڈیٹا کی حفاظت ہماری اولین ترجیح ہے۔
                        </p>
                        <div className="mt-6 flex justify-center">
                            <div className="flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100">
                                <ShieldCheck size={18} className="text-emerald-600" />
                                <span className="text-xs font-bold text-emerald-800">سسٹم محفوظ ہے</span>
                            </div>
                        </div>
                    </div>
                </div>
             </div>
        </div>
    );
};

// --- TodayPanel Component ---
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

    return (
        <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm mb-6">
            <h3 className="text-center font-bold text-gray-400 text-xs mb-4 uppercase tracking-widest">آج کی تاریخ</h3>
            <div className="space-y-4 text-right">
                <p className="text-lg">آج انگریزی ماہ <span className="font-bold text-blue-700">{gMonth}</span> کی <span className="font-bold text-blue-700">{gDay}</span> تاریخ، سال <span className="font-bold text-blue-700">{gYear}</span> ہے۔</p>
                <div className="h-px bg-gray-100"></div>
                <p className="text-lg">آج اسلامی ماہ <span className="font-bold text-emerald-700">{hMonth}</span> کی <span className="font-bold text-emerald-700">{hDay}</span> تاریخ، سال <span className="font-bold text-emerald-700">{hYear}</span> ہے۔</p>
                <div className="h-px bg-gray-100"></div>
                <p className="text-lg">دیسی ماہ <span className="font-bold text-orange-700">{pMonth}</span> کی <span className="font-bold text-orange-700">{pDay}</span> تاریخ، سال <span className="font-bold text-orange-700">{bYear}</span> بکرمی ہے۔</p>
            </div>
        </div>
    );
};

// --- Calendar Section ---
export const CalendarSection = ({ onBack }: SectionProps) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));

    const generateGrid = () => {
        const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        const days = [];
        for (let i = 0; i < firstDay.getDay(); i++) days.push(null);
        for (let i = 1; i <= lastDay.getDate(); i++) days.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), i));
        return days;
    };

    return (
        <div className="max-w-4xl mx-auto animate-fade-in">
            <BackButton onClick={onBack} />
            <TodayPanel />
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-200">
                <div className="bg-emerald-50 p-6 flex justify-between items-center border-b">
                    <button onClick={prevMonth} className="p-2 hover:bg-white rounded-full"><ChevronRight /></button>
                    <h2 className="text-2xl font-bold text-emerald-900">{getGregorianMonthUrdu(currentDate)} {currentDate.getFullYear()}</h2>
                    <button onClick={nextMonth} className="p-2 hover:bg-white rounded-full"><ChevronLeft /></button>
                </div>
                <div className="p-4">
                    <div className="grid grid-cols-7 text-center font-bold text-gray-500 mb-2">
                        {['اتوار', 'پیر', 'منگل', 'بدھ', 'جمعرات', 'جمعہ', 'ہفتہ'].map(d => <div key={d} className="py-2 text-xs">{d}</div>)}
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                        {generateGrid().map((date, idx) => (
                            <div key={idx} className={`aspect-square flex items-center justify-center rounded-xl border ${date?.toDateString() === new Date().toDateString() ? 'bg-emerald-600 text-white border-transparent' : 'bg-white border-gray-100 text-gray-700'}`}>
                                <span className="text-lg font-bold">{date ? date.getDate() : ''}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Prayer Times Section ---
export const PrayerTimesSection = ({ onBack }: SectionProps) => {
    const [prayerData, setPrayerData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [location, setLocation] = useState<{lat: number, lon: number} | null>(null);
    const [locationName, setLocationName] = useState('لاہور، پاکستان');
    const [currentTime, setCurrentTime] = useState(new Date());
    const [adjustments, setAdjustments] = useState<Record<string, number>>(() => {
        const saved = localStorage.getItem('prayer_adjustments');
        return saved ? JSON.parse(saved) : {};
    });
    const [nextPrayer, setNextPrayer] = useState<{name: string, time: string, diff: string, id: string} | null>(null);
    const [isAlertEnabled, setIsAlertEnabled] = useState(() => {
        return localStorage.getItem('prayer_alerts_enabled') === 'true';
    });
    const lastAlertedPrayerRef = useRef<string | null>(null);

    // Update real-time clock and check for alerts
    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date();
            setCurrentTime(now);
            checkPrayerAlert(now);
        }, 1000);
        return () => clearInterval(timer);
    }, [prayerData, adjustments, isAlertEnabled]);

    // Geolocation detection
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    setLocation({lat: pos.coords.latitude, lon: pos.coords.longitude});
                },
                (err) => {
                    console.log('Location access denied or error:', err.message);
                    fetchTimes(); // Use default if failed
                },
                { timeout: 8000 }
            );
        } else {
            fetchTimes(); // Fallback if browser doesn't support
        }
    }, []);

    const checkPrayerAlert = (now: Date) => {
        if (!isAlertEnabled || !prayerData) return;

        const prayers = [
            { id: 'fajr', urdu: 'فجر' },
            { id: 'dhuhr', urdu: 'ظہر' },
            { id: 'asr', urdu: 'عصر' },
            { id: 'maghrib', urdu: 'مغرب' },
            { id: 'isha', urdu: 'عشاء' }
        ];

        prayers.forEach(p => {
            const timeStr = getAdjustedTime(p.id, prayerData[p.id]);
            const [time, period] = timeStr.split(' ');
            let [h, m] = time.split(':').map(Number);
            if (period === 'PM' && h !== 12) h += 12;
            if (period === 'AM' && h === 12) h = 0;

            const nowH = now.getHours();
            const nowM = now.getMinutes();

            // Trigger alert exactly at the start of the minute
            if (nowH === h && nowM === m && lastAlertedPrayerRef.current !== p.id) {
                lastAlertedPrayerRef.current = p.id;
                triggerAlert(p.urdu);
            }
        });
    };

    const triggerAlert = (prayerName: string) => {
        // 1. Browser Notification
        if (Notification.permission === "granted") {
            new Notification(`نماز کا وقت: ${prayerName}`, {
                body: `اب ${prayerName} کا وقت شروع ہو چکا ہے۔ برائے مہربانی اپنی نماز کی تیاری کریں۔`,
                icon: "https://cdn-icons-png.flaticon.com/512/2618/2618254.png"
            });
        }

        // 2. Audio/TTS Announcement
        const announcement = `توجہ فرمائیں، ${prayerName} کا وقت ہو گیا ہے۔ اللہ اکبر، اللہ اکبر۔`;
        const utterance = new SpeechSynthesisUtterance(announcement);
        utterance.lang = 'ur-PK';
        window.speechSynthesis.speak(utterance);
    };

    const toggleAlerts = () => {
        if (!isAlertEnabled) {
            Notification.requestPermission().then(permission => {
                if (permission === "granted") {
                    setIsAlertEnabled(true);
                    localStorage.setItem('prayer_alerts_enabled', 'true');
                } else {
                    alert("الرٹ کے لیے نوٹیفیکیشن کی اجازت ضروری ہے۔");
                }
            });
        } else {
            setIsAlertEnabled(false);
            localStorage.setItem('prayer_alerts_enabled', 'false');
        }
    };

    // Fetch times from AI
    const fetchTimes = async () => {
        setLoading(true);
        const locPrompt = location 
            ? `for coordinates ${location.lat}, ${location.lon}` 
            : `for Lahore, Pakistan`;
            
        const prompt = `Provide today's Islamic prayer times (Hanafi/Sunni) ${locPrompt} in JSON format.
        Return ONLY the JSON object. Do not include any conversational text.
        Format strictly as: { "city": "City Name in Urdu", "fajr": "HH:MM AM/PM", "sunrise": "HH:MM AM/PM", "dhuhr": "HH:MM AM/PM", "asr": "HH:MM AM/PM", "maghrib": "HH:MM AM/PM", "isha": "HH:MM AM/PM", "sunset": "HH:MM AM/PM" }`;

        try {
            const res = await generateSpiritualResponse(prompt);
            const jsonStart = res.indexOf('{');
            const jsonEnd = res.lastIndexOf('}');
            
            if (jsonStart !== -1 && jsonEnd !== -1) {
                const jsonStr = res.substring(jsonStart, jsonEnd + 1);
                const json = JSON.parse(jsonStr);
                setPrayerData(json);
                if (json.city) setLocationName(json.city);
            }
        } catch (e) { 
            console.error('Failed to parse prayer JSON', e);
        }
        setLoading(false);
    };

    useEffect(() => {
        if (location) fetchTimes();
    }, [location]);

    // Calculate Adjusted Times
    const getAdjustedTime = (key: string, baseTime: string) => {
        if (!baseTime) return '--:--';
        const offset = adjustments[key] || 0;
        if (offset === 0) return baseTime;

        try {
            const [time, period] = baseTime.split(' ');
            let [h, m] = time.split(':').map(Number);
            if (period === 'PM' && h !== 12) h += 12;
            if (period === 'AM' && h === 12) h = 0;

            const date = new Date();
            date.setHours(h, m + offset, 0);
            return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
        } catch (e) { return baseTime; }
    };

    // Calculate Next Prayer Countdown
    useEffect(() => {
        if (!prayerData) return;
        
        const prayers = [
            { id: 'fajr', urdu: 'فجر' },
            { id: 'dhuhr', urdu: 'ظہر' },
            { id: 'asr', urdu: 'عصر' },
            { id: 'maghrib', urdu: 'مغرب' },
            { id: 'isha', urdu: 'عشاء' }
        ];

        const now = new Date();
        let closest = null;
        let minDiff = Infinity;

        prayers.forEach(p => {
            const timeStr = getAdjustedTime(p.id, prayerData[p.id]);
            const [time, period] = timeStr.split(' ');
            let [h, m] = time.split(':').map(Number);
            if (period === 'PM' && h !== 12) h += 12;
            if (period === 'AM' && h === 12) h = 0;

            const pDate = new Date();
            pDate.setHours(h, m, 0);
            if (pDate < now) pDate.setDate(pDate.getDate() + 1);
            
            const diff = pDate.getTime() - now.getTime();
            if (diff < minDiff) {
                minDiff = diff;
                closest = { name: p.urdu, time: timeStr, diffMs: diff, id: p.id };
            }
        });

        if (closest) {
            const h = Math.floor(closest.diffMs / 3600000);
            const m = Math.floor((closest.diffMs % 3600000) / 60000);
            const s = Math.floor((closest.diffMs % 60000) / 1000);
            setNextPrayer({
                name: closest.name,
                time: closest.time,
                id: closest.id,
                diff: `${h} گھنٹے، ${m} منٹ، ${s} سیکنڈ`
            });
        }
    }, [prayerData, currentTime, adjustments]);

    const handleAdjust = (key: string, delta: number) => {
        const newAdj = { ...adjustments, [key]: (adjustments[key] || 0) + delta };
        setAdjustments(newAdj);
        localStorage.setItem('prayer_adjustments', JSON.stringify(newAdj));
    };

    const handleSpeakSchedule = () => {
        if (!prayerData) return;
        const text = `آج کے اوقات نماز برائے ${locationName} درج ذیل ہیں۔ 
        فجر کا وقت ${getAdjustedTime('fajr', prayerData.fajr)}، 
        طلوع آفتاب ${getAdjustedTime('sunrise', prayerData.sunrise)}، 
        ظہر کا وقت ${getAdjustedTime('dhuhr', prayerData.dhuhr)}، 
        عصر کا وقت ${getAdjustedTime('asr', prayerData.asr)}، 
        مغرب کا وقت ${getAdjustedTime('maghrib', prayerData.maghrib)}، 
        اور عشاء کا وقت ${getAdjustedTime('isha', prayerData.isha)} ہے۔`;
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'ur-PK';
        window.speechSynthesis.speak(utterance);
    };

    const PrayerRow = ({ id, urdu, baseTime, icon: Icon, isForbidden = false, color }: any) => {
        const adjusted = getAdjustedTime(id, baseTime);
        const isActive = nextPrayer?.id === id;

        return (
            <div className={`p-4 rounded-2xl border flex items-center justify-between transition-all group ${isActive ? 'bg-emerald-50 border-emerald-400 shadow-md ring-2 ring-emerald-100 scale-[1.02]' : 'bg-white border-gray-100'}`}>
                <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${color} text-white shadow-sm`}>
                        <Icon size={24} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-800 text-lg">{urdu}</span>
                            {isForbidden && <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold">ممنوعہ</span>}
                            {isActive && <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>}
                        </div>
                        <span className="text-2xl font-bold text-gray-900 font-mono tracking-tighter" dir="ltr">{adjusted}</span>
                    </div>
                </div>

                <div className="flex flex-col gap-1 items-end">
                    <div className="flex items-center bg-gray-50 rounded-lg border border-gray-100 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleAdjust(id, -1)} className="p-1 hover:text-emerald-600"><Minus size={14}/></button>
                        <span className="px-2 text-[10px] font-bold text-gray-400">{(adjustments[id] || 0) > 0 ? `+${adjustments[id]}` : (adjustments[id] || 0)}</span>
                        <button onClick={() => handleAdjust(id, 1)} className="p-1 hover:text-emerald-600"><Plus size={14}/></button>
                    </div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Adjust</p>
                </div>
            </div>
        );
    };

    return (
        <div className="max-w-4xl mx-auto animate-fade-in space-y-6">
            <BackButton onClick={onBack} />

            {/* Header Card */}
            <div className="bg-gradient-to-br from-emerald-900 to-teal-950 text-white p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden ring-4 ring-emerald-50">
                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none" style={{backgroundImage: "url('https://www.transparenttextures.com/patterns/arabesque.png')"}}></div>
                
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="text-center md:text-right">
                        <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                             <MapPin size={18} className="text-emerald-400" />
                             <span className="text-emerald-200 font-bold tracking-widest uppercase text-xs">{locationName}</span>
                        </div>
                        <h2 className="text-4xl font-bold mb-4 drop-shadow-md">اوقاتِ نماز</h2>
                        <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20">
                            <Clock size={20} className="text-yellow-400" />
                            <span className="text-2xl font-bold tracking-widest font-mono" dir="ltr">
                                {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
                            </span>
                        </div>
                    </div>

                    <div className="bg-white/10 backdrop-blur-md p-6 rounded-[2rem] border border-white/20 text-center min-w-[240px] shadow-inner relative overflow-hidden">
                        {isAlertEnabled && <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse border-2 border-emerald-900"></div>}
                        <p className="text-xs text-emerald-300 font-bold uppercase tracking-[0.2em] mb-2">اگلی نماز: {nextPrayer?.name || '---'}</p>
                        {nextPrayer ? (
                            <>
                                <div className="text-3xl font-bold mb-1">{nextPrayer.time}</div>
                                <div className="text-xs font-medium text-emerald-100 opacity-80" dir="ltr">{nextPrayer.diff} باقی</div>
                            </>
                        ) : (
                            <div className="animate-pulse">حساب لگایا جا رہا ہے...</div>
                        )}
                    </div>
                </div>
                
                <div className="flex justify-center mt-6 gap-3">
                    <button onClick={fetchTimes} className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all border border-white/20 active:scale-95" title="Refresh Times">
                        <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                    </button>
                    <button onClick={handleSpeakSchedule} className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all border border-white/20 active:scale-95" title="Listen Schedule">
                        <Volume2 size={20} />
                    </button>
                    <button onClick={toggleAlerts} className={`p-3 rounded-2xl transition-all border active:scale-95 flex items-center gap-2 ${isAlertEnabled ? 'bg-emerald-500 text-white border-emerald-400 shadow-lg' : 'bg-white/10 text-white border-white/20 hover:bg-white/20'}`} title="Toggle Alerts">
                        {isAlertEnabled ? <Bell size={20} /> : <BellOff size={20} />}
                        <span className="text-xs font-bold">{isAlertEnabled ? 'الرٹ آن ہے' : 'الرٹ آن کریں'}</span>
                    </button>
                </div>
            </div>

            {/* Prayer List */}
            {loading ? (
                <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-gray-200">
                    <Loader2 className="animate-spin mx-auto w-12 h-12 text-emerald-600 mb-4" />
                    <p className="font-bold text-gray-400">ایریا لوڈ ہو رہا ہے اور وقت سیٹ کیا جا رہا ہے...</p>
                </div>
            ) : prayerData && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <PrayerRow id="fajr" urdu="فجر" baseTime={prayerData.fajr} icon={CloudSun} color="bg-indigo-600" />
                    <PrayerRow id="sunrise" urdu="طلوع آفتاب" baseTime={prayerData.sunrise} icon={Sunrise} color="bg-orange-500" isForbidden />
                    <PrayerRow id="dhuhr" urdu="ظہر" baseTime={prayerData.dhuhr} icon={Sun} color="bg-yellow-500" />
                    <PrayerRow id="asr" urdu="عصر" baseTime={prayerData.asr} icon={ThermometerSun} color="bg-amber-600" />
                    <PrayerRow id="sunset" urdu="غروب آفتاب" baseTime={prayerData.sunset} icon={Sunset} color="from-red-600 to-orange-600 bg-gradient-to-br" isForbidden />
                    <PrayerRow id="maghrib" urdu="مغرب" baseTime={prayerData.maghrib} icon={Sunset} color="bg-purple-700" />
                    <PrayerRow id="isha" urdu="عشاء" baseTime={prayerData.isha} icon={Moon} color="bg-slate-800" />
                </div>
            )}

            {/* Info Section */}
            <div className="bg-blue-50 p-6 rounded-[2rem] border border-blue-100 flex items-start gap-4">
                <div className="p-3 bg-white rounded-2xl shadow-sm text-blue-600 shrink-0">
                    <Info size={24} />
                </div>
                <div className="text-right">
                    <h4 className="font-bold text-blue-900 mb-1">نماز الرٹ کے بارے میں</h4>
                    <p className="text-xs text-blue-800 leading-relaxed font-bold">
                        اگر آپ الرٹ آن کریں گے تو سسٹم ہر نماز کے وقت آپ کو آواز میں اطلاع دے گا اور نوٹیفیکیشن بھیجے گا۔ اس فیچر کے درست کام کرنے کے لیے ایپ کا براؤزر میں کھلا رہنا ضروری ہے۔ الرٹ کے لیے ہم آپ کے سسٹم کا وقت اور جی پی ایس استعمال کرتے ہیں۔
                    </p>
                </div>
            </div>
        </div>
    );
};

// --- General AI Section ---
export const GeneralAISection = ({ title, icon: Icon, colorClass, promptContext, onBack }: any) => {
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<string | null>(null);

    const handleAsk = async () => {
        if (!input.trim()) return;
        setLoading(true);
        const res = await generateSpiritualResponse(`${promptContext}\nسوال: ${input}`);
        setResult(res);
        setLoading(false);
    };

    return (
        <div className="max-w-3xl mx-auto animate-fade-in">
             <BackButton onClick={onBack} />
             <div className={`bg-white rounded-3xl shadow-xl p-6 border-t-4 ${colorClass}`}>
                <div className="flex items-center gap-3 mb-6">
                    <Icon className="text-emerald-600" size={28} />
                    <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
                </div>
                <VoiceInput value={input} onChange={setInput} placeholder="اپنا سوال یہاں لکھیں..." multiline className="mb-4" />
                <button onClick={handleAsk} disabled={loading || !input} className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold shadow-lg flex items-center justify-center gap-2">
                    {loading ? <Loader2 className="animate-spin" /> : <Send size={18} />} جواب حاصل کریں
                </button>
                <GenericResult loading={loading} result={result} title={title} />
             </div>
        </div>
    );
};

// --- Spiritual & Islamic Education Section (Rebuilt) ---
export const SpiritualSection = ({ onBack }: SectionProps) => {
    const [view, setView] = useState<'menu' | 'category' | 'detail' | 'ai'>('menu');
    const [category, setCategory] = useState<any>(null);
    const [selectedItem, setSelectedItem] = useState<any>(null);

    const categories = [
        { 
            id: 'kalima', title: 'کلمہ جات', icon: Star, color: 'bg-emerald-500', 
            items: [
                { name: 'پہلا کلمہ (طیب)', content: 'لَا إِلٰهَ إِلَّا اللهُ مُحَمَّدٌ رَسُولُ اللهِ\n\n**ترجمہ:** اللہ کے سوا کوئی معبود نہیں اور محمد (صلی اللہ علیہ وآلہ وسلم) اللہ کے رسول ہیں۔' },
                { name: 'دوسرا کلمہ (شہادت)', content: 'أَشْهَدُ أَنْ لَا إِلٰهَ إِلَّا اللهُ وَحْدَهُ لَا شَرِيکَ لَهُ وَأَشْهَدُ أَنَّ مُحَمَّا عَبْدُهُ وَرَسُولُهُ\n\n**ترجمہ:** میں گواہی دیتا ہوں کہ اللہ کے سوا کوئی معبود نہیں، وہ اکیلا ہے، اس کا کوئی شریک نہیں اور میں گواہی دیتا ہوں کہ بے شک محمد (صلی اللہ علیہ وآلہ وسلم) اس کے بندے اور رسول ہیں۔' },
                { name: 'تیسرا کلمہ (تمجید)', content: 'سُبْحَانَ اللهِ وَالْحَمْدُ لِلَّهِ وَلَا إِلٰهَ إِلَّا اللهُ وَاللهُ أَکْبَرُ وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللهِ الْعَلِيِّ الْعَظِيمِ' },
                { name: 'چوتھا کلمہ (توحید)', content: 'لَا إِلٰهَ إِلَّا اللهُ وَحْدَهُ لَا شَرِيکَ لَهُ لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ يُحْيِي وَيُمِيتُ وَهُوَ حَيٌّ لَا يَمُوتُ أَبَدًا أَبَدًا ذُو الْجَلَالِ وَالْإِکْرَامِ بِيَدِهِ الْخَيْرُ وَهُوَ عَلَى کُلِّ شَيْءٍ قَدِيرٌ' },
                { name: 'پانچواں کلمہ (استغفار)', content: 'اسْتَغْفِرُ اللهَ رَبِّي مِنْ کُلِّ ذَنْبٍ أَذْنَبْتُهُ عَمَدًا أَوْ خَطَأً سِرًّا أَوْ عَلَانِيَةً وَأَتُوبُ إِلَيْهِ مِنَ الذَّنْبِ الَّذِي أَعْلَمُ وَمِنَ الذَّنْبِ الَّذِي لَا أَعْلَمُ إِنَّكَ أَنْتَ عَلَّامُ الْغُيُوبِ وَسَتَّارُ الْعُيُوبِ وَغَفَّارُ الذُّنُوبِ وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللهِ الْعَلِيِّ الْعَظِيمِ' },
                { name: 'چھٹا کلمہ (ردِ کفر)', content: 'اَللّٰهُمَّ اِنِّیْ اَعُوْذُ بِکَ مِنْ اَنْ اُشْرِکَ بِکَ شَیْئًا وَّاَنَا اَعْلَمُ بِهٖ وَاَسْتَغْفِرُکَ لِمَا لَا اَعْلَمُ بِهٖ تُبْتُ عَنْهُ وَتَبَرَّأْتُ مِنَ الْکُفْرِ وَالشِّرْکِ وَالْکِذْبِ وَالْغِیْبَةِ وَالْبِدْعَةِ وَالنَّمِیْمَةِ وَالْفَوَاحِشِ وَالْبُهْتَانِ وَالْمَعَاصِیْ کُلِّهَا وَاَسْلَمْتُ وَاَقُوْلُ لَا اِلٰهَ اِلَّا اللّٰهُ مُحَمَّدٌ رَّسُوْلُ اللّٰهِؕ' },
            ]
        },
        { 
            id: 'dua', title: 'مسنون دعائیں', icon: Moon, color: 'bg-cyan-500',
            items: [
                { name: 'صبح وشام کی دعا', content: 'اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلىَ النُّشُورُ' },
                { name: 'کھانا کھانے کی دعا', content: 'بِسْمِ اللَّهِ وَعَلَى بَرَكَةِ اللَّهِ' },
                { name: 'گھر سے نکلنے کی دعا', content: 'بِسْمِ اللَّهِ، تَوَكَّلْتُ عَلَى اللَّهِ، وَلا حَوْلَ وَلا قُوَّةَ إِلاَّ بِاللَّهِ' },
                { name: 'بیماری سے شفا کی دعا', content: 'أَذْهِبِ الْبَاسَ رَبَّ النَّاسِ، وَاشْفِ أَنْتَ الشَّافِي، لا شِفَاءَ إِلا شِفَاؤُكَ، شِفَاءً لا يُغَادِرُ سَقَمًا' },
            ]
        },
        { 
            id: 'hadith', title: 'فرامینِ نبویﷺ', icon: BookOpen, color: 'bg-indigo-500',
            items: [
                { name: 'نیتوں کا حال', content: 'انما الاعمال بالنيات\n\n**ترجمہ:** اعمال کا دارومدار نیتوں پر ہے۔' },
                { name: 'بہترین شخص', content: 'خيركم من تعلم القرآن وعلمه\n\n**ترجمہ:** تم میں سے بہتر وہ ہے جو قرآن سیکھے اور سکھائے۔' },
                { name: 'مسلمان کی تعریف', content: 'المسلم من سلم المسلمون من لسانه ويده\n\n**ترجمہ:** مسلمان وہ ہے جس کی زبان اور ہاتھ سے دوسرے مسلمان محفوظ رہیں۔' },
            ]
        },
        { 
            id: 'namaz', title: 'نماز کا طریقہ', icon: Sunrise, color: 'bg-orange-500',
            items: [
                { name: 'نماز کے فرائض', content: '1. تکبیر تحریمہ\n2. قیام\n3. قرات\n4. رکوع\n5. سجدہ\n6. قعدہ اخیرہ' },
                { name: 'وضو کا طریقہ', content: '1. نیت کرنا\n2. ہاتھ دھونا\n3. کلی کرنا\n4. ناک میں پانی ڈالنا\n5. چہرہ دھونا\n6. کہنیوں سمیت ہاتھ دھونا\n7. سر کا مسح کرنا\n8. پاؤں دھونا' },
            ]
        }
    ];

    const renderMenu = () => (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {categories.map((cat) => (
                <button
                    key={cat.id}
                    onClick={() => { setCategory(cat); setView('category'); }}
                    className="flex flex-col items-center gap-3 p-6 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md hover:scale-[1.03] transition-all group"
                >
                    <div className={`p-4 rounded-2xl ${cat.color} text-white shadow-lg group-hover:rotate-6 transition-transform`}>
                        <cat.icon size={32} />
                    </div>
                    <span className="font-bold text-xl text-gray-800">{cat.title}</span>
                </button>
            ))}
            <button
                onClick={() => setView('ai')}
                className="flex flex-col items-center gap-3 p-6 bg-emerald-50 rounded-3xl border border-emerald-100 shadow-sm hover:shadow-md hover:scale-[1.03] transition-all group col-span-2 md:col-span-1"
            >
                <div className="p-4 rounded-2xl bg-emerald-600 text-white shadow-lg group-hover:animate-pulse">
                    <Sparkles size={32} />
                </div>
                <span className="font-bold text-xl text-emerald-800">روحانی مشورہ (AI)</span>
            </button>
        </div>
    );

    const renderCategory = () => (
        <div className="space-y-4">
            <button 
                onClick={() => setView('menu')}
                className="flex items-center gap-2 text-emerald-600 font-bold mb-4"
            >
                <ArrowRight size={18} /> فہرست پر واپس جائیں
            </button>
            <h3 className="text-2xl font-bold text-gray-800 border-r-4 border-emerald-500 pr-3 mb-6">{category?.title}</h3>
            <div className="grid grid-cols-1 gap-3">
                {category?.items.map((item: any, idx: number) => (
                    <button
                        key={idx}
                        onClick={() => { setSelectedItem(item); setView('detail'); }}
                        className="w-full text-right p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:bg-emerald-50 transition-colors flex justify-between items-center group"
                    >
                        <span className="font-bold text-lg text-gray-700">{item.name}</span>
                        <ChevronLeft size={20} className="text-gray-300 group-hover:text-emerald-500" />
                    </button>
                ))}
            </div>
        </div>
    );

    const renderDetail = () => (
        <div className="space-y-6">
            <button 
                onClick={() => setView('category')}
                className="flex items-center gap-2 text-emerald-600 font-bold mb-4"
            >
                <ArrowRight size={18} /> {category?.title} پر واپس جائیں
            </button>
            
            <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden">
                <div className={`p-6 ${category?.color} text-white text-center relative overflow-hidden`}>
                    <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')]"></div>
                    <h4 className="text-2xl font-bold relative z-10">{selectedItem?.name}</h4>
                </div>
                <div className="p-8 text-center bg-[#fffdf5]">
                    <div className="text-3xl md:text-4xl leading-[3] text-emerald-900 mb-8 font-serif" dir="rtl">
                        {selectedItem?.content.split('\n\n')[0]}
                    </div>
                    {selectedItem?.content.includes('**ترجمہ:**') && (
                        <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-100 text-lg text-emerald-800 leading-loose">
                            <h5 className="font-bold text-emerald-600 mb-2">ترجمہ:</h5>
                            {selectedItem?.content.split('**ترجمہ:**')[1]}
                        </div>
                    )}
                    {!selectedItem?.content.includes('**ترجمہ:**') && selectedItem?.content.split('\n\n')[1] && (
                         <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 text-lg text-gray-700 leading-loose">
                             {selectedItem?.content.split('\n\n')[1]}
                         </div>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto animate-fade-in">
            <BackButton onClick={onBack} />
            <div className="bg-gradient-to-br from-emerald-900 to-teal-950 text-white p-8 rounded-[2.5rem] shadow-2xl mb-8 relative overflow-hidden text-center ring-4 ring-emerald-50">
                 <div className="absolute inset-0 opacity-10" style={{backgroundImage: "url('https://www.transparenttextures.com/patterns/arabesque.png')"}}></div>
                 <div className="relative z-10">
                    <h2 className="text-4xl font-bold mb-2">روحانی و اسلامی تعلیمات</h2>
                    <p className="opacity-80">دعائیں، احادیث، کلمہ جات اور ایمان کی روشنی</p>
                 </div>
            </div>

            {view === 'menu' && renderMenu()}
            {view === 'category' && renderCategory()}
            {view === 'detail' && renderDetail()}
            {view === 'ai' && (
                <div className="space-y-4">
                    <button 
                        onClick={() => setView('menu')}
                        className="flex items-center gap-2 text-emerald-600 font-bold mb-4"
                    >
                        <ArrowRight size={18} /> فہرست پر واپس جائیں
                    </button>
                    <GeneralAISection 
                        title="روحانی مشورہ و حل" 
                        icon={Sparkles}
                        colorClass="border-emerald-500"
                        promptContext="بطور ماہر روحانی معالج، صارف کے ہر قسم کے روحانی، نفسیاتی اور گھریلو مسائل کے لیے قرآنی وظائف، دعائیں اور اسما الحسنہ سے حل بتائیں۔"
                        onBack={() => setView('menu')}
                    />
                </div>
            )}
        </div>
    );
};

// --- Medical Section ---
export const MedicalSection = ({ onBack }: SectionProps) => {
    const [symptoms, setSymptoms] = useState('');
    const [result, setResult] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleDiagnose = async () => {
        if (!symptoms) return;
        setLoading(true);
        const res = await getInitialDiagnosis(symptoms);
        setResult(res);
        setLoading(false);
    };

    return (
        <div className="max-w-3xl mx-auto animate-fade-in">
             <BackButton onClick={onBack} />
             <div className="bg-white rounded-3xl shadow-xl p-6 border-t-4 border-blue-500">
                <div className="flex items-center gap-3 mb-6">
                    <Stethoscope className="text-blue-600" size={28} />
                    <h2 className="text-2xl font-bold text-gray-800">امراض کی تشخیص</h2>
                </div>
                <VoiceInput value={symptoms} onChange={setSymptoms} placeholder="اپنی علامات تفصیل سے لکھیں..." multiline className="mb-4" />
                <button onClick={handleDiagnose} disabled={loading || !symptoms} className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg flex items-center justify-center gap-2">
                    {loading ? <Loader2 className="animate-spin" /> : <Activity size={18} />} تشخیص کریں
                </button>
                <GenericResult loading={loading} result={result} title="تشخیص" />
             </div>
        </div>
    );
};

// --- Document Section (Improved) ---
export const DocumentSection = ({ onBack }: SectionProps) => {
    const [image, setImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<string | null>(null);

    const handleProcessImage = async (base64: string) => {
        setImage(base64);
        setLoading(true);
        try {
            const res = await scanDocument(base64);
            setResult(res);
        } catch (e) {
            alert("دستاویز پراسیس کرنے میں خرابی آئی۔");
        }
        setLoading(false);
    };

    return (
        <div className="max-w-3xl mx-auto animate-fade-in">
            <BackButton onClick={onBack} />
            <div className="bg-white rounded-3xl shadow-xl p-6 border-t-4 border-gray-600">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-gray-100 text-gray-700 rounded-xl">
                        <FileText size={28} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">دستاویز ریڈر (OCR)</h2>
                        <p className="text-xs text-gray-500 font-bold">میڈیکل رپورٹس یا کوئی بھی تحریر اردو میں سمجھیں</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    <FileUploader 
                        label="دستاویز اپ لوڈ کریں" 
                        icon={Upload} 
                        onSelect={handleProcessImage} 
                    />
                    <FileUploader 
                        label="تصویر کھینچیں (Scan)" 
                        icon={Camera} 
                        onSelect={handleProcessImage} 
                    />
                </div>

                {image && (
                    <div className="mb-6 p-2 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
                        <p className="text-center text-[10px] font-bold text-gray-400 mb-2 uppercase">منتخب شدہ دستاویز</p>
                        <img src={image} alt="Selected Document" className="max-h-48 mx-auto rounded-xl shadow-sm object-contain" />
                    </div>
                )}

                {!image && !loading && (
                    <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 flex items-start gap-3">
                        <AlertTriangle className="text-blue-600 shrink-0 mt-1" size={18} />
                        <p className="text-xs text-blue-900 leading-relaxed font-bold">
                            آپ اپنی میڈیکل رپورٹ، لیب ٹیسٹ، یا کسی بھی پرانی تحریر کی تصویر اپ لوڈ کر سکتے ہیں۔ سسٹم اس متن کو پڑھے گا اور آپ کو اردو میں آسان خلاصہ بتائے گا۔
                        </p>
                    </div>
                )}

                <GenericResult loading={loading} result={result} title="دستاویز کا خلاصہ" />
            </div>
        </div>
    );
};

// --- Black Magic Section (Final Abjad Logic & Voice Support) ---
export const BlackMagicSection = ({ onBack }: SectionProps) => {
    const [name, setName] = useState('');
    const [motherName, setMotherName] = useState('');
    const [selectedDayId, setSelectedDayId] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<string | null>(null);
    const [isSpeaking, setIsSpeaking] = useState(false);

    const weekDays = [
        { id: 6, urdu: 'ہفتہ (شنبہ)', calcName: 'شنبہ', hindi: 'شنیوار (Saturday)' },
        { id: 0, urdu: 'اتوار (یکشنبہ)', calcName: 'یکشنبہ', hindi: 'رویوار (Sunday)' },
        { id: 1, urdu: 'پیر (دوشنبہ)', calcName: 'دوشنبہ', hindi: 'سوموار (Monday)' },
        { id: 2, urdu: 'منگل (سہ شنبہ)', calcName: 'سہ شنبہ', hindi: 'منگل وار (Tuesday)' },
        { id: 3, urdu: 'بدھ (چہار شنبہ)', calcName: 'چہار شنبہ', hindi: 'بدھ وار (Wednesday)' },
        { id: 4, urdu: 'جمعرات (پنج شنبہ)', calcName: 'پنج شنبہ', hindi: 'ویر وار (Thursday)' },
        { id: 5, urdu: 'جمعہ (آدینہ)', calcName: 'آدینہ', hindi: 'شکروار (Friday)' },
    ];

    const handleSpeak = () => {
        if (!result) return;
        if (isSpeaking) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
            return;
        }
        const utterance = new SpeechSynthesisUtterance(result);
        utterance.lang = 'ur-PK';
        utterance.onend = () => setIsSpeaking(false);
        setIsSpeaking(true);
        window.speechSynthesis.speak(utterance);
    };

    const handleDiagnosis = async () => {
        if (!name.trim()) return alert("براہ کرم نام درج کریں۔");
        if (selectedDayId === null) return alert("براہ کرم دن منتخب کریں۔");
        
        setLoading(true);
        
        const dayObj = weekDays.find(d => d.id === selectedDayId);
        const dayCalcName = dayObj?.calcName || '';
        
        const sumName = calculateAbjad(name);
        const sumMother = calculateAbjad(motherName);
        const sumDay = calculateAbjad(dayCalcName);
        const grandTotal = sumName + sumMother + sumDay;
        
        const remainder = grandTotal % 4;
        let diagnosticResultText = '';
        
        if (remainder === 1) {
            diagnosticResultText = `محترم /محترمہ آپ کو کالاجادو کی شکایت نہیں ہے، آپ اندرونی بیماریاں ہیں (بخار وغیرہ) اپ اپنا علاج کسی ماہر ظبیب سے کرائیں ، یا شنگرف ہر بل ایکس دواخانہ سے رابطہ فرمائیں ۔`;
        } else if (remainder === 2) {
            diagnosticResultText = `محترم / محترمہ آپ کو نہ کالا جادو ہے اور نہ ہی کسی قسم کا سایہ ہے۔ اپ کو جسمانی امراض ہیں ، اپ کسی ماہر طبیب سے رابطہ کر کے اپنا علاج کرائیں ، یا اپ شنگرف ہر بل ایکس دواخانہ سے رابطہ کریں ۔`;
        } else if (remainder === 3) {
            diagnosticResultText = `محترم / محترمہ آپ جادو اور سایہ میں مبتلا ہیں ، آپ اپنا علاج کسی ماہر عملیات سے کرائیں یا اسی ایپ میں موجود رابطہ کے سیکشن میں رابطہ کریں ۔ مکمل اور مفت راہنمائی کی جائے گی ، نماز کی باقاعدگی سے پابندی کریں ، تلاوت کریں ۔`;
        } else { // remainder === 0 (or 4, but % 4 gives 0)
            diagnosticResultText = `محترم / محترمہ ، آپ کی زندگی مسائل سے گری پڑی ہے، اپ کو نظر ہے اور آپ پر کالا جادو کا شدید حملہ ہو رہا ہے ،اور آپ مختلف جسمانی اور کاروباری معاملات میں گھرے ہوئے ہیں ، آپ کسی بھی ماہر عملیات و کالاجادو کے ماہر سے رابطہ کریں اور اپنا مکمل علاج کرائیں ۔ یا آپ اسی ایپ کے رابطی کے سیکشن میں جا کر ماہر عملیات سے رابطہ کریں ۔ مکمل اور مفط راہنمائی کی جائے گی ، نم،از ادا کریں ،تلاوت کریں ، سدقات بادا کریں ۔`;
        }

        // Simulating processing delay for effect
        setTimeout(() => {
            setResult(diagnosticResultText);
            setLoading(false);
        }, 1200);
    };

    return (
        <div className="max-w-4xl mx-auto animate-fade-in">
            <BackButton onClick={onBack} />
            <div className="bg-white rounded-3xl shadow-xl p-6 border-t-4 border-red-600 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none" style={{backgroundImage: "url('https://www.transparenttextures.com/patterns/arabesque.png')"}}></div>
                
                <div className="flex items-center gap-3 mb-6 relative z-10">
                    <Shield className="text-red-600" size={28} />
                    <h2 className="text-2xl font-bold text-gray-800">کالا جادو اور سحر کی تشخیص</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 relative z-10">
                    {/* Input Fields */}
                    <div className="space-y-4">
                        <div className="bg-red-50/30 p-4 rounded-2xl border border-red-100 shadow-inner">
                             <div className="mb-4">
                                <label className="block text-sm font-bold text-gray-700 mb-2 mr-2">آپ کا نام</label>
                                <VoiceInput value={name} onChange={setName} placeholder="اپنا نام لکھیں..." />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2 mr-2">والدہ کا نام</label>
                                <VoiceInput value={motherName} onChange={setMotherName} placeholder="والدہ کا نام لکھیں..." />
                            </div>
                        </div>

                        <button 
                            onClick={handleDiagnosis} 
                            disabled={loading || !name} 
                            className="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold shadow-lg transition-all flex items-center justify-center gap-3 active:scale-95 group"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : <Ghost size={20} className="group-hover:rotate-12 transition-transform" />} 
                            <span>تشخیص کریں</span>
                        </button>
                    </div>

                    {/* Day Selector */}
                    <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200 shadow-inner">
                        <div className="flex items-center gap-2 mb-4 justify-center">
                            <Calendar size={18} className="text-red-500" />
                            <h3 className="font-bold text-gray-800 text-center uppercase tracking-wider text-sm">دن کا انتخاب کریں</h3>
                        </div>
                        <div className="grid grid-cols-1 gap-2 max-h-[280px] overflow-y-auto pr-2 custom-scrollbar">
                            {weekDays.map((day) => (
                                <button
                                    key={day.id}
                                    onClick={() => setSelectedDayId(day.id)}
                                    className={`w-full text-right p-3 rounded-xl border transition-all flex justify-between items-center group ${selectedDayId === day.id ? 'bg-red-600 border-red-600 text-white shadow-md' : 'bg-white border-gray-100 text-gray-700 hover:border-red-200 hover:bg-red-50'}`}
                                >
                                    <div className="flex flex-col text-right">
                                        <span className={`font-bold ${selectedDayId === day.id ? 'text-white' : 'text-gray-800'}`}>{day.urdu}</span>
                                        <span className={`text-[10px] ${selectedDayId === day.id ? 'text-red-100' : 'text-gray-400 group-hover:text-red-400'}`}>{day.hindi}</span>
                                    </div>
                                    {selectedDayId === day.id && <Check size={16} className="text-white" />}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Result Section */}
                {result && !loading && (
                    <div className="mt-8 animate-fade-in-up">
                        <div className="flex justify-between items-center mb-3 px-2">
                             <div className="flex items-center gap-2">
                                <div className="h-4 w-1 bg-red-600 rounded-full"></div>
                                <h4 className="font-bold text-red-900">تشخیص کا نتیجہ</h4>
                             </div>
                             <button 
                                onClick={handleSpeak}
                                className={`p-2.5 rounded-full transition-all border shadow-sm ${isSpeaking ? 'bg-red-600 text-white border-red-500 animate-pulse' : 'bg-white text-red-600 border-red-100 hover:bg-red-50'}`}
                                title="Listen to Result"
                             >
                                <Volume2 size={20} />
                             </button>
                        </div>
                        <GenericResult loading={loading} result={result} title="روحانی تشخیص کا رزلٹ" />
                    </div>
                )}
                
                {loading && (
                    <div className="py-12 text-center relative z-10">
                        <div className="w-16 h-16 border-4 border-red-600 border-t-red-100 rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="font-bold text-red-800">اعداد کا حساب لگایا جا رہا ہے...</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- Time Science Section (Enhanced) ---
export const TimeScienceSection = ({ onBack }: SectionProps) => {
    const [name, setName] = useState('');
    const [motherName, setMotherName] = useState('');
    const [dob, setDob] = useState('');
    const [tob, setTob] = useState('');
    const [selectedDayId, setSelectedDayId] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<string | null>(null);
    const [isSpeaking, setIsSpeaking] = useState(false);

    const weekDays = [
        { id: 6, urdu: 'ہفتہ (شنبہ)', calcName: 'شنبہ', hindi: 'شنیوار (Saturday)' },
        { id: 0, urdu: 'اتوار (یکشنبہ)', calcName: 'یکشنبہ', hindi: 'رویوار (Sunday)' },
        { id: 1, urdu: 'پیر (دوشنبہ)', calcName: 'دوشنبہ', hindi: 'سوموار (Monday)' },
        { id: 2, urdu: 'منگل (سہ شنبہ)', calcName: 'سہ شنبہ', hindi: 'منگل وار (Tuesday)' },
        { id: 3, urdu: 'بدھ (چہار شنبہ)', calcName: 'چہار شنبہ', hindi: 'بدھ وار (Wednesday)' },
        { id: 4, urdu: 'جمعرات (پنج شنبہ)', calcName: 'پنج شنبہ', hindi: 'ویر وار (Thursday)' },
        { id: 5, urdu: 'جمعہ (آدینہ)', calcName: 'آدینہ', hindi: 'شکروار (Friday)' },
    ];

    const handleSpeak = () => {
        if (!result) return;
        if (isSpeaking) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
            return;
        }
        const utterance = new SpeechSynthesisUtterance(result);
        utterance.lang = 'ur-PK';
        utterance.onend = () => setIsSpeaking(false);
        setIsSpeaking(true);
        window.speechSynthesis.speak(utterance);
    };

    const handleAnalyze = async () => {
        if (!name.trim()) return alert("براہ کرم اپنا نام درج کریں۔");
        setLoading(true);

        const dayObj = weekDays.find(d => d.id === selectedDayId);
        const dayInfo = dayObj ? dayObj.urdu : "معلوم نہیں";

        const prompt = `بطور ماہر علم الساعات، درج ذیل تفصیلات کی بنیاد پر وقت کی تاثیر، سعد و نحس ساعتیں، اور پیدائشی وقت کا تجزیہ اردو میں فراہم کریں۔
        نام: ${name}
        والدہ کا نام: ${motherName || "ذکر نہیں کیا"}
        تاریخ پیدائش: ${dob || "ذکر نہیں کیا"}
        وقت پیدائش: ${tob || "ذکر نہیں کیا"}
        دن پیدائش: ${dayInfo}
        براہ کرم بتائیں کہ موجودہ وقت یا پیدائشی وقت صارف کی زندگی پر کیا اثرات رکھتا ہے اور اسے کن اوقات میں اہم کام کرنے صاحبان کو چاہیے۔`;

        try {
            const res = await generateSpiritualResponse(prompt);
            setResult(res);
        } catch (e) {
            setResult("معذرت، تجزیہ کرنے میں مسئلہ پیش آیا۔");
        }
        setLoading(false);
    };

    return (
        <div className="max-w-4xl mx-auto animate-fade-in">
            <BackButton onClick={onBack} />
            <div className="bg-white rounded-3xl shadow-xl p-6 border-t-4 border-purple-600 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-full h-full opacity-[0.03] pointer-events-none" style={{backgroundImage: "url('https://www.transparenttextures.com/patterns/arabesque.png')"}}></div>
                
                <div className="flex items-center gap-3 mb-6 relative z-10">
                    <Watch className="text-purple-600" size={28} />
                    <h2 className="text-2xl font-bold text-gray-800">علم الساعات (ٹائمنگ کا تجزیہ)</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 relative z-10">
                    {/* Inputs */}
                    <div className="space-y-4">
                        <div className="bg-purple-50/30 p-5 rounded-2xl border border-purple-100 shadow-inner space-y-4">
                             <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5 mr-2">آپ کا نام (لازمی)</label>
                                <VoiceInput value={name} onChange={setName} placeholder="اپنا نام لکھیں..." />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5 mr-2">والدہ کا نام (آپشنل)</label>
                                <VoiceInput value={motherName} onChange={setMotherName} placeholder="والدہ کا نام لکھیں..." />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5 mr-2">تاریخ پیدائش</label>
                                    <input 
                                        type="date" 
                                        value={dob} 
                                        onChange={(e) => setDob(e.target.value)}
                                        className="w-full h-12 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 outline-none px-4 bg-white/80 text-sm" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5 mr-2">وقت پیدائش</label>
                                    <input 
                                        type="time" 
                                        value={tob} 
                                        onChange={(e) => setTob(e.target.value)}
                                        className="w-full h-12 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 outline-none px-4 bg-white/80 text-sm" 
                                    />
                                </div>
                            </div>
                        </div>

                        <button 
                            onClick={handleAnalyze} 
                            disabled={loading || !name} 
                            className="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-bold shadow-lg transition-all flex items-center justify-center gap-3 active:scale-95 group"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : <Clock size={20} className="group-hover:rotate-12 transition-transform" />} 
                            <span>تشخیص کریں</span>
                        </button>
                    </div>

                    {/* Day Selection */}
                    <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200 shadow-inner">
                        <div className="flex items-center gap-2 mb-4 justify-center">
                            <CalendarDays size={18} className="text-purple-500" />
                            <h3 className="font-bold text-gray-800 text-center uppercase tracking-wider text-sm">پیدائش کا دن (آپشنل)</h3>
                        </div>
                        <div className="grid grid-cols-1 gap-2 max-h-[280px] overflow-y-auto pr-2 custom-scrollbar">
                            {weekDays.map((day) => (
                                <button
                                    key={day.id}
                                    onClick={() => setSelectedDayId(day.id)}
                                    className={`w-full text-right p-3 rounded-xl border transition-all flex justify-between items-center group ${selectedDayId === day.id ? 'bg-purple-600 border-purple-600 text-white shadow-md' : 'bg-white border-gray-100 text-gray-700 hover:border-purple-200 hover:bg-purple-50'}`}
                                >
                                    <div className="flex flex-col text-right">
                                        <span className={`font-bold ${selectedDayId === day.id ? 'text-white' : 'text-gray-800'}`}>{day.urdu}</span>
                                        <span className={`text-[10px] ${selectedDayId === day.id ? 'text-purple-100' : 'text-gray-400 group-hover:text-purple-400'}`}>{day.hindi}</span>
                                    </div>
                                    {selectedDayId === day.id && <Check size={16} className="text-white" />}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Result Section */}
                {result && !loading && (
                    <div className="mt-8 animate-fade-in-up">
                        <div className="flex justify-between items-center mb-3 px-2">
                             <div className="flex items-center gap-2">
                                <div className="h-4 w-1 bg-purple-600 rounded-full"></div>
                                <h4 className="font-bold text-purple-900">ساعات کا تجزیہ</h4>
                             </div>
                             <button 
                                onClick={handleSpeak}
                                className={`p-2.5 rounded-full transition-all border shadow-sm ${isSpeaking ? 'bg-purple-600 text-white border-purple-500 animate-pulse' : 'bg-white text-purple-600 border-purple-100 hover:bg-purple-50'}`}
                                title="Listen to Result"
                             >
                                <Volume2 size={20} />
                             </button>
                        </div>
                        <GenericResult loading={loading} result={result} title="علم الساعات کا نتیجہ" />
                    </div>
                )}
                
                {loading && (
                    <div className="py-12 text-center relative z-10">
                        <div className="w-16 h-16 border-4 border-purple-600 border-t-purple-100 rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="font-bold text-purple-800">ستاروں کی چال اور وقت کا حساب لگایا جا رہا ہے...</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- Wazaif & Istikhara Section (Enhanced) ---
export const WazaifSection = ({ onBack }: SectionProps) => {
    const [name, setName] = useState('');
    const [motherName, setMotherName] = useState('');
    const [question, setQuestion] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<string | null>(null);
    const [isSpeaking, setIsSpeaking] = useState(false);

    const handleSpeak = () => {
        if (!result) return;
        if (isSpeaking) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
            return;
        }
        const utterance = new SpeechSynthesisUtterance(result);
        utterance.lang = 'ur-PK';
        utterance.onend = () => setIsSpeaking(false);
        setIsSpeaking(true);
        window.speechSynthesis.speak(utterance);
    };

    const handleIstikhara = async () => {
        if (!name.trim()) return alert("براہ کرم اپنا نام درج کریں۔");
        if (!question.trim()) return alert("براہ کرم اپنا سوال درج کریں۔");
        
        setLoading(true);

        const prompt = `بطور ماہر روحانی معالج اور ماہر استخارہ، درج ذیل تفصیلات کی بنیاد پر استخارہ اور وظائف فراہم کریں:
        نام: ${name}
        والدہ کا نام: ${motherName || "ذکر نہیں کیا"}
        سوال: ${question}
        براہ کرم صارف کے نام کے اعداد اور ان کے مخصوص سوال کی روشنی میں ان کے لیے بہتر مشورہ، استخارہ کا جواب، اور مخصوص قرآنی وظائف اردو میں فراہم کریں۔ استخارہ کا جواب تفصیل سے دیں تاکہ صارف کو رہنمائی مل سکے۔`;

        try {
            const res = await generateSpiritualResponse(prompt);
            setResult(res);
        } catch (e) {
            setResult("معذرت، استخارہ کرنے میں مسئلہ پیش آیا۔");
        }
        setLoading(false);
    };

    return (
        <div className="max-w-4xl mx-auto animate-fade-in">
            <BackButton onClick={onBack} />
            <div className="bg-white rounded-3xl shadow-xl p-6 border-t-4 border-teal-600 relative overflow-hidden">
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{backgroundImage: "url('https://www.transparenttextures.com/patterns/arabesque.png')"}}></div>
                
                <div className="flex items-center gap-3 mb-6 relative z-10">
                    <BookOpen className="text-teal-600" size={28} />
                    <h2 className="text-2xl font-bold text-gray-800">استخارہ و وظائف</h2>
                </div>

                <div className="bg-teal-50/30 p-6 rounded-3xl border border-teal-100 shadow-inner space-y-5 mb-8 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1.5 mr-2">آپ کا نام (لازمی)</label>
                            <VoiceInput value={name} onChange={setName} placeholder="اپنا نام لکھیں..." />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1.5 mr-2">والدہ کا نام (آپشنل)</label>
                            <VoiceInput value={motherName} onChange={setMotherName} placeholder="والدہ کا نام لکھیں..." />
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5 mr-2">آپ کا سوال یا مسئلہ (لازمی)</label>
                        <VoiceInput value={question} onChange={setQuestion} placeholder="اپنا سوال یہاں تفصیل سے لکھیں..." multiline />
                    </div>
                    
                    <button 
                        onClick={handleIstikhara} 
                        disabled={loading || !name || !question} 
                        className="w-full py-4 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl font-bold shadow-lg transition-all flex items-center justify-center gap-3 active:scale-95 group"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={20} className="group-hover:rotate-12 transition-transform" />} 
                        <span>تشخیص کریں</span>
                    </button>
                </div>

                {/* Result Section */}
                {result && !loading && (
                    <div className="mt-8 animate-fade-in-up">
                        <div className="flex justify-between items-center mb-3 px-2">
                             <div className="flex items-center gap-2">
                                <div className="h-4 w-1 bg-teal-600 rounded-full"></div>
                                <h4 className="font-bold text-teal-900">استخارہ و وظائف کا نتیجہ</h4>
                             </div>
                             <button 
                                onClick={handleSpeak}
                                className={`p-2.5 rounded-full transition-all border shadow-sm ${isSpeaking ? 'bg-teal-600 text-white border-teal-500 animate-pulse' : 'bg-white text-teal-600 border-teal-100 hover:bg-teal-50'}`}
                                title="Listen to Result"
                             >
                                <Volume2 size={20} />
                             </button>
                        </div>
                        <GenericResult loading={loading} result={result} title="استخارہ و وظائف" />
                    </div>
                )}
                
                {loading && (
                    <div className="py-12 text-center relative z-10">
                        <div className="w-16 h-16 border-4 border-teal-600 border-t-teal-100 rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="font-bold text-teal-800">روحانی حساب لگایا جا رہا ہے...</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- Numerology Section (Fully Rebuilt & Enhanced) ---
export const NumerologySection = ({ onBack }: SectionProps) => {
    const [name, setName] = useState('');
    const [motherName, setMotherName] = useState('');
    const [partnerName, setPartnerName] = useState('');
    const [dob, setDob] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<string | null>(null);
    const [isSpeaking, setIsSpeaking] = useState(false);

    const handleSpeak = () => {
        if (!result) return;
        if (isSpeaking) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
            return;
        }
        
        // Clean markdown for speech
        const cleanText = result.replace(/[#*`_]/g, '').replace(/\[.*?\]\(.*?\)/g, '');
        
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = 'ur-PK';
        utterance.rate = 0.9; // Slightly slower for clarity in Urdu
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        
        setIsSpeaking(true);
        window.speechSynthesis.speak(utterance);
    };

    const handleAnalyze = async () => {
        if (!name.trim()) return alert("براہ کرم اپنا نام درج کریں۔");
        setLoading(true);

        const abjadName = calculateAbjad(name);
        const abjadMother = motherName ? calculateAbjad(motherName) : 0;
        const totalAbjad = abjadName + abjadMother;
        const psychicNum = getSingleDigit(abjadName);
        
        const dobInfo = dob ? `تاریخ پیدائش: ${dob}` : "";
        const partnerInfo = partnerName ? `پارٹنر کا نام: ${partnerName}` : "";

        const prompt = `بطور ایک انتہائی ماہر اور تجربہ کار ماہر علم الاعداد (Numerologist) اور روحانی سکالر، درج ذیل تفصیلات کا بہت گہرائی سے تجزیہ کریں اور اردو میں ایک نہایت تفصیلی، جامع اور معلوماتی رپورٹ تیار کریں:
        
        نام: ${name} (حسابِ ابجد کے مطابق اعداد: ${abjadName})
        والدہ کا نام: ${motherName || "ذکر نہیں کیا"} (حسابِ ابجد کے مطابق اعداد: ${abjadMother})
        مجموعی اعداد (نام + والدہ): ${totalAbjad}
        آپ کا مفرد عدد (Psychic Number): ${psychicNum}
        ${dobInfo}
        ${partnerInfo}
        
        رپورٹ میں درج ذیل پہلوؤں کو خاص طور پر تفصیل سے بیان کریں (کم از کم 500 الفاظ):
        1. **اعداد کی روحانی تاثیر:** نام اور والدہ کے نام کے اعداد کی آپ کی زندگی، مزاج اور فطرت پر پڑنے والے گہرے اثرات۔
        2. **شخصیت کا نفسیاتی خاکہ:** آپ کی خوبیاں، خامیاں، پوشیدہ صلاحیتیں اور آپ کے رویے کا تجزیہ۔
        3. **خوش قسمتی کے عوامل:** آپ کے لیے خوش قسمت نمبرز (Lucky Numbers)، سازگار رنگ (Lucky Colors)، مبارک دن (Lucky Days) اور بہترین دھات (Lucky Metals)۔
        4. **نگینہ (Stone Recommendation):** آپ کے اعداد اور ستاروں کی چال کے مطابق کون سا پتھر آپ کی ترقی، صحت اور کامیابی کے لیے موزوں رہے گا۔
        5. **مالی و کاروباری رہنمائی:** آپ کے لیے بہترین پیشے، کاروبار میں اتار چڑھاؤ اور معاشی ترقی کے حصول کے طریقے اور بہترین وقت۔
        6. **صحت و تندرستی:** وہ امراض جن کا آپ کو خطرہ ہو سکتا ہے اور ان سے بچنے کے لیے احتیاطی تدابیر اور روحانی مشورے۔
        7. **عشق و محبت اور شادی (Compatibility):** اگر پارٹنر کا نام دیا گیا ہے تو اس کے ساتھ آپ کے تعلقات کی گہرائی، باہمی مطابقت اور ازدواجی زندگی کی کامیابی کا فیصد بتائیں۔
        8. **اسمِ اعظم اور روحانی وظائف:** آپ کے نام کے اعداد کے مطابق مخصوص اسما الحسنیٰ (اسمِ اعظم) اور روزانہ پڑھنے کے لیے ایک خاص وظیفہ جو مشکلات کو دور کرنے میں مددگار ہو۔
        
        براہ کرم جواب کو نہایت خوبصورت، منظم اور دلچسپ انداز میں لکھیں تاکہ صارف کو اپنی زندگی کے بارے میں مکمل رہنمائی مل سکے۔`;

        try {
            const res = await generateSpiritualResponse(prompt);
            setResult(res);
        } catch (e) {
            setResult("معذرت، علم الاعداد کا تجزیہ کرنے میں مسئلہ پیش آیا۔ براہ کرم دوبارہ کوشش کریں۔");
        }
        setLoading(false);
    };

    return (
        <div className="max-w-4xl mx-auto animate-fade-in">
            <BackButton onClick={onBack} />
            <div className="bg-white rounded-3xl shadow-xl p-6 border-t-4 border-emerald-500 relative overflow-hidden">
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{backgroundImage: "url('https://www.transparenttextures.com/patterns/arabesque.png')"}}></div>
                
                <div className="flex items-center gap-3 mb-6 relative z-10">
                    <Calculator className="text-emerald-600" size={28} />
                    <h2 className="text-2xl font-bold text-gray-800">علم الاعداد (نام کا گہرا روحانی تجزیہ)</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 relative z-10">
                    {/* Inputs */}
                    <div className="space-y-4">
                        <div className="bg-emerald-50/30 p-5 rounded-2xl border border-emerald-100 shadow-inner space-y-4">
                             <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5 mr-2">آپ کا نام (لازمی)</label>
                                <VoiceInput value={name} onChange={setName} placeholder="اپنا پورا نام یہاں درج کریں..." />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5 mr-2">والدہ کا نام (آپشنل)</label>
                                <VoiceInput value={motherName} onChange={setMotherName} placeholder="والدہ کا نام یہاں درج کریں..." />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5 mr-2">تاریخ پیدائش (آپشنل)</label>
                                <input 
                                    type="date" 
                                    value={dob} 
                                    onChange={(e) => setDob(e.target.value)}
                                    className="w-full h-12 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none px-4 bg-white/80 text-sm" 
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="bg-emerald-50/30 p-5 rounded-2xl border border-emerald-100 shadow-inner h-full flex flex-col justify-center gap-4">
                            <div className="bg-white/80 p-4 rounded-xl border border-emerald-100 shadow-sm">
                                <p className="text-xs font-bold text-emerald-800 mb-2 opacity-70 flex items-center gap-1">
                                    <Heart size={10} className="fill-emerald-600"/> مطابقت چیک کریں:
                                </p>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5 mr-2">پارٹنر یا شریکِ حیات کا نام</label>
                                <VoiceInput value={partnerName} onChange={setPartnerName} placeholder="پارٹنر کا نام لکھیں..." />
                            </div>
                            
                            <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white p-5 rounded-2xl shadow-lg border border-white/10 relative overflow-hidden group">
                                <div className="absolute -top-6 -right-6 w-20 h-20 bg-white/10 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
                                <p className="text-xs opacity-90 mb-1 font-bold">آپ کے نام کے کل اعداد:</p>
                                <div className="text-4xl font-bold tracking-widest drop-shadow-sm">
                                    {name ? calculateAbjad(name) : '---'}
                                </div>
                                <p className="text-[10px] mt-2 opacity-70 italic">حسابِ ابجد کے مطابق نکالا گیا مجموعہ</p>
                            </div>
                        </div>
                    </div>
                </div>

                <button 
                    onClick={handleAnalyze} 
                    disabled={loading || !name} 
                    className="w-full py-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold shadow-xl transition-all flex items-center justify-center gap-3 active:scale-95 group relative z-10"
                >
                    {loading ? <Loader2 className="animate-spin" /> : <TrendingUp size={22} className="group-hover:translate-y-[-3px] transition-transform" />} 
                    <span className="text-lg">مکمل رپورٹ حاصل کریں</span>
                </button>

                {/* Result Section */}
                {result && !loading && (
                    <div className="mt-10 animate-fade-in-up">
                        <div className="flex justify-between items-center mb-4 px-2">
                             <div className="flex items-center gap-3">
                                <div className="h-6 w-1.5 bg-emerald-600 rounded-full"></div>
                                <h4 className="font-bold text-emerald-900 text-xl">علم الاعداد کی تفصیلی رپورٹ</h4>
                             </div>
                             <div className="flex items-center gap-2">
                                <span className={`text-[10px] font-bold ${isSpeaking ? 'text-emerald-600 animate-pulse' : 'text-gray-400'}`}>
                                    {isSpeaking ? 'سنا جا رہا ہے...' : 'آواز میں سنیں'}
                                </span>
                                <button 
                                    onClick={handleSpeak}
                                    className={`p-3 rounded-full transition-all border shadow-md flex items-center justify-center ${isSpeaking ? 'bg-red-500 text-white border-red-400 animate-pulse' : 'bg-white text-emerald-600 border-emerald-100 hover:bg-emerald-50 hover:scale-110 active:scale-95'}`}
                                    title={isSpeaking ? "Stop Listening" : "Listen to Analysis"}
                                >
                                    {isSpeaking ? <Pause size={20} fill="currentColor" /> : <Volume2 size={20} />}
                                </button>
                             </div>
                        </div>
                        <GenericResult loading={loading} result={result} title="علم الاعداد کا تفصیلی نتیجہ" />
                    </div>
                )}
                
                {loading && (
                    <div className="py-16 text-center relative z-10 bg-emerald-50/20 rounded-3xl border border-dashed border-emerald-100 mt-6">
                        <div className="w-20 h-20 border-4 border-emerald-600 border-t-emerald-200 rounded-full animate-spin mx-auto mb-6 shadow-lg shadow-emerald-100"></div>
                        <h4 className="font-bold text-emerald-900 text-xl mb-2">روحانی حساب جاری ہے...</h4>
                        <p className="text-emerald-700/70 text-sm max-w-xs mx-auto leading-relaxed">
                            موئکلات اور اعداد کے ماہرین آپ کے نام کی تاثیر کا گہرائی سے جائزہ لے رہے ہیں، براہ کرم چند لمحے انتظار فرمائیں۔
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- Contact Section ---
export const ContactSection = ({ onBack }: SectionProps) => {
    const [name, setName] = useState('');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');

    const handleEmailSend = (e: React.FormEvent) => {
        e.preventDefault();
        const mailtoUrl = `mailto:appstalk3@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`نام: ${name}\n\nپیغام:\n${message}`)}`;
        window.location.href = mailtoUrl;
    };

    return (
        <div className="max-w-5xl mx-auto animate-fade-in">
            <BackButton onClick={onBack} />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Email Contact Form */}
                <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100 flex flex-col h-full">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl shadow-inner border border-emerald-100">
                            <Mail size={32} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">ای میل ارسال کریں</h2>
                            <p className="text-sm text-gray-500 font-medium">appstalk3@gmail.com</p>
                        </div>
                    </div>

                    <form onSubmit={handleEmailSend} className="space-y-5 flex-grow">
                        <div>
                             <label className="block text-sm font-bold text-gray-600 mb-1.5 mr-2">آپ کا نام</label>
                            <VoiceInput 
                                value={name} 
                                onChange={setName} 
                                placeholder="اپنا مکمل نام لکھیں..." 
                                className="bg-gray-50 border-gray-100"
                            />
                        </div>
                        <div>
                             <label className="block text-sm font-bold text-gray-600 mb-1.5 mr-2">موضوع (Subject)</label>
                            <VoiceInput 
                                value={subject} 
                                onChange={setSubject} 
                                placeholder="موضوع منتخب کریں..." 
                                className="bg-gray-50 border-gray-100"
                            />
                        </div>
                        <div>
                             <label className="block text-sm font-bold text-gray-600 mb-1.5 mr-2">آپ کا پیغام</label>
                            <VoiceInput 
                                value={message} 
                                onChange={setMessage} 
                                placeholder="اپنا مسئلہ یا پیغام تفصیل سے لکھیں..." 
                                multiline 
                                className="bg-gray-50 border-gray-100"
                            />
                        </div>
                        <button 
                            type="submit" 
                            className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold shadow-lg transition-all flex items-center justify-center gap-3 group mt-4"
                        >
                            <span>ارسال کریں</span>
                            <Send size={20} className="group-hover:translate-x-[-5px] transition-transform" />
                        </button>
                    </form>
                </div>

                {/* WhatsApp & Scan Info */}
                <div className="flex flex-col gap-6">
                    {/* Direct WhatsApp Call Card */}
                    <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100 text-center flex flex-col items-center flex-grow">
                        <div className="p-5 bg-green-50 text-green-600 rounded-full mb-5 shadow-inner">
                            <MessageSquare size={40} />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-3">براہ راست وٹس ایپ</h3>
                        <p className="text-gray-500 text-sm mb-8 leading-relaxed font-medium max-w-xs">
                            حکیم غلام یاسین آرائیں (کہروڑ پکا)<br/>
                            حاجی اشفاق احمد (خانیوال)
                        </p>
                        
                        <a 
                            href="https://wa.me/923009459059" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="w-full py-4 bg-green-500 hover:bg-green-600 text-white rounded-2xl font-bold shadow-lg transition-all flex items-center justify-center gap-3 active:scale-95"
                        >
                            <Phone size={22} className="animate-pulse" />
                            <span className="text-lg">وٹس ایپ پر بات کریں</span>
                        </a>

                        <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent my-8"></div>

                        {/* WhatsApp QR Code Section */}
                        <div className="bg-gray-50 p-8 rounded-3xl border-2 border-dashed border-gray-200 w-full relative">
                            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-white px-4 py-1 rounded-full border border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                SCAN TO CHAT
                            </div>
                            
                            <div className="bg-white p-5 rounded-3xl shadow-md inline-block mx-auto mb-6 border border-gray-100 group transition-transform hover:scale-105 duration-500">
                                <img 
                                    src="https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=https://wa.me/923009459059" 
                                    alt="WhatsApp Contact QR" 
                                    className="w-44 h-44 object-contain"
                                />
                            </div>
                            
                            <div className="space-y-1">
                                <p className="text-sm font-bold text-gray-800">Appstalk Official</p>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">Contact Support</p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

// Placeholder components for the rest
export const HoroscopeSection = ({ onBack }: SectionProps) => <GeneralAISection title="زائچہ و نجوم" icon={Star} colorClass="border-orange-500" promptContext="ماہر نجوم کے طور پر جواب دیں۔" onBack={onBack} />;
