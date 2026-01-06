
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
                setTimeout(() => setStatus('idle'), 2000);
            }
        };

        recognition.onerror = (event: any) => {
            setIsListening(false);
            setStatus('error');
            alert("آواز کی شناخت میں مسئلہ پیش آیا۔");
            setTimeout(() => setStatus('idle'), 3000);
        };

        try {
            recognition.start();
        } catch (e) {
            setIsListening(false);
        }
    };

    const getStatusClasses = () => {
        if (status === 'success') return 'border-emerald-500 ring-2 ring-emerald-100';
        if (status === 'error') return 'border-red-500 ring-2 ring-red-100';
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
                className={`absolute left-2 bottom-2 p-2.5 rounded-full transition-all shadow-md z-10 flex items-center justify-center ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-white text-emerald-600 border border-emerald-100 hover:bg-emerald-50 active:scale-95'}`}
            >
                <Mic size={18} />
            </button>
        </div>
    );
};

// --- Tasbeeh Counter Section ---
export const TasbeehCounterSection = ({ onBack }: SectionProps) => {
  const [count, setCount] = useState(0);
  const [goal, setGoal] = useState(33);
  const [history, setHistory] = useState<{label: string, count: number, date: string}[]>(() => {
    const saved = localStorage.getItem('tasbeeh_history');
    return saved ? JSON.parse(saved) : [];
  });
  const [activeDhikr, setActiveDhikr] = useState('سبحان اللہ');

  const dhikrs = ['سبحان اللہ', 'الحمد للہ', 'اللہ اکبر', 'استغفر اللہ', 'لا الہ الا اللہ', 'درود شریف'];

  const handleIncrement = () => {
    const newCount = count + 1;
    setCount(newCount);
    
    // Haptic Feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }

    if (newCount === goal) {
      if ('vibrate' in navigator) {
        navigator.vibrate([100, 50, 100]);
      }
      alert(`${activeDhikr} کا ہدف مکمل ہو گیا!`);
    }
  };

  const handleReset = () => {
    if (count > 0) {
      const entry = { label: activeDhikr, count, date: new Date().toLocaleString('ur-PK') };
      const newHistory = [entry, ...history].slice(0, 10);
      setHistory(newHistory);
      localStorage.setItem('tasbeeh_history', JSON.stringify(newHistory));
    }
    setCount(0);
  };

  return (
    <div className="max-w-md mx-auto animate-fade-in flex flex-col gap-6">
      <BackButton onClick={onBack} />
      
      <div className="bg-white rounded-[2.5rem] shadow-2xl p-8 border border-gray-100 text-center relative overflow-hidden flex flex-col items-center">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
        
        <h2 className="text-2xl font-bold text-gray-800 mb-6">تسبیح کاؤنٹر</h2>
        
        <select 
          value={activeDhikr} 
          onChange={(e) => { handleReset(); setActiveDhikr(e.target.value); }}
          className="w-full p-3 rounded-2xl bg-emerald-50 border-none text-emerald-800 font-bold text-center mb-8 outline-none appearance-none shadow-inner"
        >
          {dhikrs.map(d => <option key={d} value={d}>{d}</option>)}
        </select>

        {/* Counter Circle */}
        <div 
          onClick={handleIncrement}
          className="relative w-64 h-64 rounded-full bg-gradient-to-br from-emerald-50 to-white shadow-2xl border-8 border-emerald-100 flex flex-col items-center justify-center cursor-pointer active:scale-95 transition-all group overflow-hidden"
        >
          {/* Progress Ring */}
          <svg className="absolute inset-0 w-full h-full -rotate-90">
            <circle 
              cx="128" cy="128" r="120" 
              fill="none" 
              stroke="#10b981" 
              strokeWidth="8" 
              strokeDasharray="754" 
              strokeDashoffset={754 - (754 * Math.min(count, goal)) / goal}
              className="transition-all duration-300 ease-out"
            />
          </svg>
          
          <div className="relative z-10 flex flex-col items-center">
            <span className="text-6xl font-bold text-gray-800 tracking-tighter font-mono">{count}</span>
            <span className="text-xs text-emerald-600 font-bold uppercase tracking-widest mt-2">TAP TO COUNT</span>
          </div>
          
          <div className="absolute bottom-6 text-[10px] font-bold text-gray-400">ہدف: {goal}</div>
        </div>

        <div className="flex gap-4 w-full mt-10">
          <button onClick={handleReset} className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition-all flex items-center justify-center gap-2">
            <RotateCcw size={18} /> ری سیٹ
          </button>
          <div className="flex-1 flex gap-2">
            {[33, 100, 1000].map(val => (
              <button key={val} onClick={() => { handleReset(); setGoal(val); }} className={`flex-1 py-4 rounded-2xl font-bold transition-all text-xs ${goal === val ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-700'}`}>
                {val}
              </button>
            ))}
          </div>
        </div>
      </div>

      {history.length > 0 && (
        <div className="bg-white rounded-3xl shadow-lg p-6 border border-gray-100">
           <div className="flex items-center gap-2 mb-4">
              <History size={18} className="text-emerald-600" />
              <h3 className="font-bold text-gray-800">حالیہ ریکارڈ</h3>
           </div>
           <div className="space-y-3">
              {history.map((h, i) => (
                <div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="text-right">
                    <p className="font-bold text-sm text-gray-800">{h.label}</p>
                    <p className="text-[10px] text-gray-400">{h.date}</p>
                  </div>
                  <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-xs font-bold">{h.count}</span>
                </div>
              ))}
           </div>
        </div>
      )}
    </div>
  );
};

// --- Horoscope Section (Improved) ---
export const HoroscopeSection = ({ onBack }: SectionProps) => {
    const [name, setName] = useState('');
    const [dob, setDob] = useState('');
    const [tob, setTob] = useState('');
    const [pob, setPob] = useState('');
    const [question, setQuestion] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<string | null>(null);

    const handleGenerate = async () => {
        if (!name || !dob) return alert("براہ کرم نام اور تاریخ پیدائش درج کریں۔");
        setLoading(true);
        const prompt = `بطور ایک ماہر علم نجوم (Astrologer)، درج ذیل پیدائشی تفصیلات کی بنیاد پر زائچہ تیار کریں اور صارف کے سوال کا جواب دیں:
        نام: ${name}
        تاریخ پیدائش: ${dob}
        وقتِ پیدائش: ${tob || "نامعلوم"}
        مقامِ پیدائش: ${pob || "پاکستان"}
        سوال: ${question || "عام زائچہ اور مستقبل کے حالات"}
        براہ کرم اردو میں تفصیلی جواب فراہم کریں جس میں برج، ستارہ، لکی نمبر، اور مخصوص مشورے شامل ہوں۔`;

        try {
            const res = await generateSpiritualResponse(prompt);
            setResult(res);
        } catch (e) {
            setResult("معذرت، زائچہ تیار کرنے میں مسئلہ پیش آیا۔");
        }
        setLoading(false);
    };

    return (
        <div className="max-w-3xl mx-auto animate-fade-in">
             <BackButton onClick={onBack} />
             <div className="bg-white rounded-3xl shadow-xl p-6 border-t-4 border-orange-500 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-100 rounded-full blur-3xl opacity-20 -translate-y-10 translate-x-10"></div>
                
                <div className="flex items-center gap-3 mb-6 relative z-10">
                    <div className="p-3 bg-orange-50 text-orange-600 rounded-xl shadow-inner"><Star size={28} /></div>
                    <h2 className="text-2xl font-bold text-gray-800">زائچہ و نجوم</h2>
                </div>

                <div className="space-y-4 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1.5 mr-1">آپ کا نام</label>
                            <VoiceInput value={name} onChange={setName} placeholder="نام لکھیں..." />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1.5 mr-1">تاریخ پیدائش</label>
                            <input type="date" value={dob} onChange={e => setDob(e.target.value)} className="w-full h-12 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 outline-none px-4 bg-white/80" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1.5 mr-1">وقت پیدائش (اگر معلوم ہو)</label>
                            <input type="time" value={tob} onChange={e => setTob(e.target.value)} className="w-full h-12 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 outline-none px-4 bg-white/80" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1.5 mr-1">مقامِ پیدائش</label>
                            <VoiceInput value={pob} onChange={setPob} placeholder="شہر یا گاؤں..." />
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5 mr-1">کوئی مخصوص سوال؟</label>
                        <VoiceInput value={question} onChange={setQuestion} placeholder="مثلاً: شادی، ملازمت، صحت..." multiline />
                    </div>

                    <button 
                        onClick={handleGenerate} 
                        disabled={loading || !name} 
                        className="w-full py-4 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl font-bold shadow-lg transition-all flex items-center justify-center gap-3 active:scale-95 group"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : <Sparkle size={20} className="group-hover:rotate-45 transition-transform" />} 
                        <span>زائچہ تیار کریں</span>
                    </button>
                </div>
                
                <GenericResult loading={loading} result={result} title="نجومی تجزیہ" />
             </div>
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

    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date();
            setCurrentTime(now);
            checkPrayerAlert(now);
        }, 1000);
        return () => clearInterval(timer);
    }, [prayerData, adjustments, isAlertEnabled]);

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    setLocation({lat: pos.coords.latitude, lon: pos.coords.longitude});
                },
                (err) => {
                    fetchTimes();
                },
                { timeout: 8000 }
            );
        } else {
            fetchTimes();
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

            if (nowH === h && nowM === m && lastAlertedPrayerRef.current !== p.id) {
                lastAlertedPrayerRef.current = p.id;
                triggerAlert(p.urdu);
            }
        });
    };

    const triggerAlert = (prayerName: string) => {
        if (Notification.permission === "granted") {
            new Notification(`نماز کا وقت: ${prayerName}`, {
                body: `اب ${prayerName} کا وقت شروع ہو چکا ہے۔`,
                icon: "https://cdn-icons-png.flaticon.com/512/2618/2618254.png"
            });
        }
        const utterance = new SpeechSynthesisUtterance(`توجہ فرمائیں، ${prayerName} کا وقت ہو گیا ہے۔`);
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

    const fetchTimes = async () => {
        setLoading(true);
        const locPrompt = location ? `for coordinates ${location.lat}, ${location.lon}` : `for Lahore, Pakistan`;
        const prompt = `Provide today's Islamic prayer times (Hanafi/Sunni) ${locPrompt} in JSON format. Return ONLY the JSON object. { "city": "City Name in Urdu", "fajr": "HH:MM AM/PM", "sunrise": "HH:MM AM/PM", "dhuhr": "HH:MM AM/PM", "asr": "HH:MM AM/PM", "maghrib": "HH:MM AM/PM", "isha": "HH:MM AM/PM", "sunset": "HH:MM AM/PM" }`;

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
        } catch (e) { }
        setLoading(false);
    };

    useEffect(() => {
        if (location) fetchTimes();
    }, [location]);

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

    useEffect(() => {
        if (!prayerData) return;
        const prayers = [{ id: 'fajr', urdu: 'فجر' }, { id: 'dhuhr', urdu: 'ظہر' }, { id: 'asr', urdu: 'عصر' }, { id: 'maghrib', urdu: 'مغرب' }, { id: 'isha', urdu: 'عشاء' }];
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
            setNextPrayer({ name: closest.name, time: closest.time, id: closest.id, diff: `${h} گھنٹے، ${m} منٹ، ${s} سیکنڈ` });
        }
    }, [prayerData, currentTime, adjustments]);

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
                        </div>
                        <span className="text-2xl font-bold text-gray-900 font-mono tracking-tighter" dir="ltr">{adjusted}</span>
                    </div>
                </div>
                <div className="flex flex-col gap-1 items-end">
                    <div className="flex items-center bg-gray-50 rounded-lg border border-gray-100 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => { const newAdj = { ...adjustments, [id]: (adjustments[id] || 0) - 1 }; setAdjustments(newAdj); localStorage.setItem('prayer_adjustments', JSON.stringify(newAdj)); }} className="p-1 hover:text-emerald-600"><Minus size={14}/></button>
                        <span className="px-2 text-[10px] font-bold text-gray-400">{(adjustments[id] || 0) > 0 ? `+${adjustments[id]}` : (adjustments[id] || 0)}</span>
                        <button onClick={() => { const newAdj = { ...adjustments, [id]: (adjustments[id] || 0) + 1 }; setAdjustments(newAdj); localStorage.setItem('prayer_adjustments', JSON.stringify(newAdj)); }} className="p-1 hover:text-emerald-600"><Plus size={14}/></button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="max-w-4xl mx-auto animate-fade-in space-y-6">
            <BackButton onClick={onBack} />
            <div className="bg-gradient-to-br from-emerald-900 to-teal-950 text-white p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden ring-4 ring-emerald-50 text-center">
                <h2 className="text-4xl font-bold mb-4 drop-shadow-md">اوقاتِ نماز</h2>
                <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20">
                    <Clock size={20} className="text-yellow-400" />
                    <span className="text-2xl font-bold tracking-widest font-mono" dir="ltr">{currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}</span>
                </div>
                <div className="flex justify-center mt-6 gap-3">
                    <button onClick={fetchTimes} className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all border border-white/20 active:scale-95"><RefreshCw size={20} className={loading ? 'animate-spin' : ''} /></button>
                    <button onClick={toggleAlerts} className={`p-3 rounded-2xl transition-all border active:scale-95 flex items-center gap-2 ${isAlertEnabled ? 'bg-emerald-500 text-white border-emerald-400' : 'bg-white/10 text-white border-white/20'}`}>
                        {isAlertEnabled ? <Bell size={20} /> : <BellOff size={20} />}
                        <span className="text-xs font-bold">{isAlertEnabled ? 'الرٹ آن ہے' : 'الرٹ آن کریں'}</span>
                    </button>
                </div>
            </div>
            {loading ? <div className="p-12 text-center">لوڈنگ...</div> : prayerData && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <PrayerRow id="fajr" urdu="فجر" baseTime={prayerData.fajr} icon={CloudSun} color="bg-indigo-600" />
                    <PrayerRow id="sunrise" urdu="طلوع آفتاب" baseTime={prayerData.sunrise} icon={Sunrise} color="bg-orange-500" isForbidden />
                    <PrayerRow id="dhuhr" urdu="ظہر" baseTime={prayerData.dhuhr} icon={Sun} color="bg-yellow-500" />
                    <PrayerRow id="asr" urdu="عصر" baseTime={prayerData.asr} icon={ThermometerSun} color="bg-amber-600" />
                    <PrayerRow id="maghrib" urdu="مغرب" baseTime={prayerData.maghrib} icon={Sunset} color="bg-purple-700" />
                    <PrayerRow id="isha" urdu="عشاء" baseTime={prayerData.isha} icon={Moon} color="bg-slate-800" />
                </div>
            )}
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

// --- Spiritual & Islamic Education Section ---
export const SpiritualSection = ({ onBack }: SectionProps) => {
    const [view, setView] = useState<'menu' | 'category' | 'detail' | 'ai'>('menu');
    const [category, setCategory] = useState<any>(null);
    const [selectedItem, setSelectedItem] = useState<any>(null);

    const categories = [
        { id: 'kalima', title: 'کلمہ جات', icon: Star, color: 'bg-emerald-500', items: [{ name: 'پہلا کلمہ (طیب)', content: 'لَا إِلٰهَ إِلَّا اللهُ مُحَمَّدٌ رَسُولُ اللهِ\n\n**ترجمہ:** اللہ کے سوا کوئی معبود نہیں اور محمد (صلی اللہ علیہ وآلہ وسلم) اللہ کے رسول ہیں۔' }] },
        { id: 'dua', title: 'مسنون دعائیں', icon: Moon, color: 'bg-cyan-500', items: [{ name: 'کھانا کھانے کی دعا', content: 'بِسْمِ اللَّهِ وَعَلَى بَرَكَةِ اللَّهِ' }] }
    ];

    return (
        <div className="max-w-4xl mx-auto animate-fade-in">
            <BackButton onClick={onBack} />
            <div className="bg-emerald-900 text-white p-8 rounded-[2.5rem] shadow-2xl mb-8 text-center">
                <h2 className="text-4xl font-bold mb-2">روحانی و اسلامی تعلیمات</h2>
            </div>
            {view === 'menu' && (
                <div className="grid grid-cols-2 gap-4">
                    {categories.map((cat) => (
                        <button key={cat.id} onClick={() => { setCategory(cat); setView('category'); }} className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm hover:scale-[1.03] transition-all flex flex-col items-center gap-3">
                            <div className={`p-4 rounded-2xl ${cat.color} text-white`}><cat.icon size={32} /></div>
                            <span className="font-bold text-xl">{cat.title}</span>
                        </button>
                    ))}
                    <button onClick={() => setView('ai')} className="col-span-2 p-6 bg-emerald-50 rounded-3xl border border-emerald-100 shadow-sm flex items-center justify-center gap-3">
                        <Sparkles className="text-emerald-600" />
                        <span className="font-bold text-xl text-emerald-800">روحانی مشورہ (AI)</span>
                    </button>
                </div>
            )}
            {view === 'category' && (
                <div className="space-y-4">
                    <button onClick={() => setView('menu')} className="text-emerald-600 font-bold mb-4 flex items-center gap-2"><ArrowRight size={18}/> واپسی</button>
                    <h3 className="text-2xl font-bold text-gray-800 mb-6">{category?.title}</h3>
                    {category?.items.map((item: any, idx: number) => (
                        <button key={idx} onClick={() => { setSelectedItem(item); setView('detail'); }} className="w-full text-right p-4 bg-white rounded-2xl border border-gray-100 shadow-sm flex justify-between items-center">
                            <span className="font-bold text-lg">{item.name}</span>
                            <ChevronLeft size={20} className="text-gray-300" />
                        </button>
                    ))}
                </div>
            )}
            {view === 'detail' && (
                <div className="space-y-6">
                    <button onClick={() => setView('category')} className="text-emerald-600 font-bold flex items-center gap-2"><ArrowRight size={18}/> واپسی</button>
                    <div className="bg-white rounded-[2rem] shadow-xl border overflow-hidden">
                        <div className={`p-6 ${category?.color} text-white text-center`}><h4 className="text-2xl font-bold">{selectedItem?.name}</h4></div>
                        <div className="p-8 text-center bg-[#fffdf5]"><div className="text-3xl leading-[3] text-emerald-900 font-serif" dir="rtl">{selectedItem?.content}</div></div>
                    </div>
                </div>
            )}
            {view === 'ai' && <GeneralAISection title="روحانی مشورہ" icon={Sparkles} colorClass="border-emerald-500" promptContext="بطور ماہر روحانی معالج جواب دیں۔" onBack={() => setView('menu')} />}
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
                <div className="flex items-center gap-3 mb-6"><Stethoscope className="text-blue-600" size={28} /><h2 className="text-2xl font-bold text-gray-800">امراض کی تشخیص</h2></div>
                <VoiceInput value={symptoms} onChange={setSymptoms} placeholder="اپنی علامات تفصیل سے لکھیں..." multiline className="mb-4" />
                <button onClick={handleDiagnose} disabled={loading || !symptoms} className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg flex items-center justify-center gap-2">{loading ? <Loader2 className="animate-spin" /> : <Activity size={18} />} تشخیص کریں</button>
                <GenericResult loading={loading} result={result} title="تشخیص" />
             </div>
        </div>
    );
};

// --- Document Section ---
export const DocumentSection = ({ onBack }: SectionProps) => {
    const [image, setImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<string | null>(null);
    const handleProcessImage = async (base64: string) => {
        setImage(base64);
        setLoading(true);
        try { const res = await scanDocument(base64); setResult(res); } catch (e) { }
        setLoading(false);
    };
    return (
        <div className="max-w-3xl mx-auto animate-fade-in">
            <BackButton onClick={onBack} />
            <div className="bg-white rounded-3xl shadow-xl p-6 border-t-4 border-gray-600">
                <div className="flex items-center gap-3 mb-6"><FileText size={28} /><h2 className="text-2xl font-bold text-gray-800">دستاویز ریڈر</h2></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    <FileUploader label="دستاویز اپ لوڈ کریں" icon={Upload} onSelect={handleProcessImage} />
                    <FileUploader label="تصویر کھینچیں" icon={Camera} onSelect={handleProcessImage} />
                </div>
                {image && <img src={image} alt="Selected" className="max-h-48 mx-auto rounded-xl mb-6" />}
                <GenericResult loading={loading} result={result} title="خلاصہ" />
            </div>
        </div>
    );
};

// --- Black Magic Section ---
export const BlackMagicSection = ({ onBack }: SectionProps) => {
    const [name, setName] = useState('');
    const [motherName, setMotherName] = useState('');
    const [selectedDayId, setSelectedDayId] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<string | null>(null);
    const weekDays = [{ id: 6, urdu: 'ہفتہ' }, { id: 0, urdu: 'اتوار' }, { id: 1, urdu: 'پیر' }, { id: 2, urdu: 'منگل' }, { id: 3, urdu: 'بدھ' }, { id: 4, urdu: 'جمعرات' }, { id: 5, urdu: 'جمعہ' }];
    const handleDiagnosis = async () => {
        if (!name || selectedDayId === null) return alert("معلومات درج کریں۔");
        setLoading(true);
        const grandTotal = calculateAbjad(name) + calculateAbjad(motherName) + calculateAbjad(weekDays.find(d => d.id === selectedDayId)?.urdu || '');
        const remainder = grandTotal % 4;
        setTimeout(() => {
            setResult(remainder === 3 ? "آپ جادو اور سایہ میں مبتلا ہیں ، آپ اپنا علاج کسی ماہر عملیات سے کرائیں یا اسی ایپ میں موجود رابطہ کے سیکشن میں رابطہ کریں ۔" : "آپ کو کالا جادو نہیں ہے، یہ جسمانی مرض ہے۔");
            setLoading(false);
        }, 1200);
    };
    return (
        <div className="max-w-4xl mx-auto animate-fade-in">
            <BackButton onClick={onBack} />
            <div className="bg-white rounded-3xl shadow-xl p-6 border-t-4 border-red-600">
                <h2 className="text-2xl font-bold mb-6">کالا جادو کی تشخیص</h2>
                <div className="space-y-4 mb-6">
                    <VoiceInput value={name} onChange={setName} placeholder="آپ کا نام" />
                    <VoiceInput value={motherName} onChange={setMotherName} placeholder="والدہ کا نام" />
                    <div className="grid grid-cols-4 gap-2">
                        {weekDays.map(d => <button key={d.id} onClick={() => setSelectedDayId(d.id)} className={`p-2 rounded-xl border text-xs ${selectedDayId === d.id ? 'bg-red-600 text-white' : 'bg-gray-50'}`}>{d.urdu}</button>)}
                    </div>
                </div>
                <button onClick={handleDiagnosis} className="w-full py-4 bg-red-600 text-white rounded-2xl font-bold">تشخیص کریں</button>
                <GenericResult loading={loading} result={result} title="روحانی تشخیص" />
            </div>
        </div>
    );
};

// --- Time Science Section ---
export const TimeScienceSection = ({ onBack }: SectionProps) => {
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<string | null>(null);
    const handleAnalyze = async () => {
        if (!name) return;
        setLoading(true);
        const res = await generateSpiritualResponse(`بطور ماہر علم الساعات، ${name} کے لیے وقت کی تاثیر بتائیں۔`);
        setResult(res);
        setLoading(false);
    };
    return (
        <div className="max-w-3xl mx-auto animate-fade-in">
            <BackButton onClick={onBack} />
            <div className="bg-white rounded-3xl shadow-xl p-6 border-t-4 border-purple-600">
                <h2 className="text-2xl font-bold mb-6">علم الساعات</h2>
                <VoiceInput value={name} onChange={setName} placeholder="نام لکھیں..." className="mb-4" />
                <button onClick={handleAnalyze} className="w-full py-4 bg-purple-600 text-white rounded-2xl font-bold">تجزیہ کریں</button>
                <GenericResult loading={loading} result={result} title="ساعات کا نتیجہ" />
            </div>
        </div>
    );
};

// --- Wazaif Section ---
export const WazaifSection = ({ onBack }: SectionProps) => <GeneralAISection title="استخارہ و وظائف" icon={BookOpen} colorClass="border-teal-600" promptContext="ماہر استخارہ کے طور پر جواب دیں۔" onBack={onBack} />;

// --- Numerology Section ---
export const NumerologySection = ({ onBack }: SectionProps) => {
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<string | null>(null);
    const handleAnalyze = async () => {
        if (!name) return;
        setLoading(true);
        const res = await generateSpiritualResponse(`بطور ماہر علم الاعداد، ${name} کا تفصیلی تجزیہ کریں۔`);
        setResult(res);
        setLoading(false);
    };
    return (
        <div className="max-w-3xl mx-auto animate-fade-in">
            <BackButton onClick={onBack} />
            <div className="bg-white rounded-3xl shadow-xl p-6 border-t-4 border-emerald-500">
                <h2 className="text-2xl font-bold mb-6">علم الاعداد</h2>
                <VoiceInput value={name} onChange={setName} placeholder="نام لکھیں..." className="mb-4" />
                <button onClick={handleAnalyze} className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold">رپورٹ حاصل کریں</button>
                <GenericResult loading={loading} result={result} title="علم الاعداد رپورٹ" />
            </div>
        </div>
    );
};

// --- Contact Section ---
export const ContactSection = ({ onBack }: SectionProps) => {
    return (
        <div className="max-w-4xl mx-auto animate-fade-in">
            <BackButton onClick={onBack} />
            <div className="bg-white rounded-3xl shadow-xl p-8 border text-center">
                <Phone size={48} className="mx-auto text-emerald-600 mb-6" />
                <h2 className="text-3xl font-bold mb-8">رابطہ کریں</h2>
                <a href="https://wa.me/923009459059" target="_blank" className="block w-full py-4 bg-green-500 text-white rounded-2xl font-bold text-xl mb-4">وٹس ایپ (WhatsApp)</a>
                <p className="text-gray-500">appstalk3@gmail.com</p>
            </div>
        </div>
    );
};
