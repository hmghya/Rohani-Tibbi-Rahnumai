import React, { useState, useEffect, useRef } from 'react';
import { 
  Upload, Send, BookOpen, Heart, Moon, Sun, Clock, Eye, ChevronRight, Stethoscope, 
  ArrowRight, MapPin, Sunrise, Sunset, Bell, BellOff, Volume2, X, Gift, Calendar, 
  Zap, Users, Home, Key, Hash, ShieldCheck, Activity, AlertTriangle, Briefcase, 
  PenTool, Car, Ghost, Smile, Star, Phone, UserPlus, HelpCircle, Smartphone, 
  Shield, Save, RefreshCw, Settings as SettingsIcon, Play, Pause, RotateCcw, Calculator, FileText, 
  Edit2, Check, Fingerprint, Search, History, TrendingUp, Gem, Palette, HeartPulse, 
  CalendarDays, ChevronLeft, Pill, Mic, ThermometerSun, CloudSun, Loader2, 
  Sparkles, MessageSquare, User, Scale, SearchCheck, Globe, Navigation, 
  ChevronDown, Plus, Minus, Trash2, Code2, Watch, Camera, Mail, Info, Book, 
  HeartHandshake, Sparkle, Compass, Crosshair, Tent, Bot, Share2, Map, ExternalLink,
  Navigation2, Footprints, QrCode, Monitor, Languages, Type, Sprout
} from 'lucide-react';
import { 
  generateSpiritualResponse, getMedicalAIChatResponse, 
  getNumerologyAnalysis, analyzeImageWithText, analyzeMedicalReport,
  diagnoseSpiritualIllness
} from '../services/geminiService';
import GenericResult from './GenericResult';
import Markdown from 'react-markdown';

interface SectionProps {
  onBack: () => void;
}

// --- Helper Functions ---
const abjadMap: Record<string, number> = {
    'ا': 1, 'آ': 1, 'ء': 1, 'ب': 2, 'پ': 2, 'ت': 400, 'ٹ': 400, 'ث': 500, 'ج': 3, 'چ': 3, 'ح': 8, 'خ': 600, 'د': 4, 'ڈ': 4, 'ذ': 700, 'ر': 200, 'ڑ': 200, 'ز': 7, 'ژ': 7, 'س': 60, 'ش': 300, 'ص': 90, 'ض': 800, 'ط': 9, 'ظ': 900, 'ع': 70, 'غ': 1000, 'ف': 80, 'ق': 100, 'ک': 20, 'گ': 20, 'ل': 30, 'م': 40, 'ن': 50, 'و': 6, 'ہ': 5, 'ھ': 5, 'ی': 10, 'ے': 10, ' ': 0
};

const calculateAbjad = (text: string) => {
    let total = 0;
    for (let char of text) {
        total += abjadMap[char] || 0;
    }
    return total;
};

const getUrduDay = () => {
    const days = ['اتوار', 'پیر', 'منگل', 'بدھ', 'جمعرات', 'جمعہ', 'ہفتہ'];
    return days[new Date().getDay()];
};

const to12Hour = (time24: string) => {
    if (!time24) return "";
    let [h, m] = time24.split(':').map(Number);
    const suffix = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${suffix}`;
};

// --- Common Components ---
const BackButton = ({ onClick }: { onClick: () => void }) => (
  <div className="flex justify-start mb-6 no-print">
    <button onClick={onClick} className="flex items-center gap-2 bg-white dark:bg-slate-800 text-emerald-800 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900 px-5 py-2.5 rounded-2xl shadow-sm hover:shadow-md hover:bg-emerald-50 dark:hover:bg-slate-700 transition-all font-bold group">
      <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /> واپس ہوم پر جائیں
    </button>
  </div>
);

const VoiceInput: React.FC<{ value: string; onChange: (v: string) => void; placeholder?: string; multiline?: boolean; className?: string }> = ({ value, onChange, placeholder, multiline, className }) => {
    const [isListening, setIsListening] = useState(false);
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    const handleListen = () => {
        if (!SpeechRecognition) { alert("آپ کا براؤزر آواز کی شناخت کو سپورٹ نہیں کرتا۔"); return; }
        const recognition = new SpeechRecognition();
        recognition.lang = 'ur-PK';
        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onresult = (event: any) => onChange(value + " " + event.results[0][0].transcript);
        recognition.start();
    };

    return (
        <div className="relative w-full">
            {multiline ? (
                <textarea 
                    value={value} 
                    onChange={(e) => onChange(e.target.value)} 
                    placeholder={placeholder} 
                    className={`w-full rounded-xl border-2 border-gray-100 dark:border-slate-800 p-3 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none min-h-[70px] text-right text-sm transition-all dark:bg-slate-900 dark:text-white ${className}`} 
                />
            ) : (
                <input 
                    type="text" 
                    value={value} 
                    onChange={(e) => onChange(e.target.value)} 
                    placeholder={placeholder} 
                    className={`w-full rounded-xl border-2 border-gray-100 dark:border-slate-800 h-10 px-4 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none text-right text-sm transition-all dark:bg-slate-900 dark:text-white ${className}`} 
                />
            )}
            <button 
                type="button" 
                onClick={handleListen} 
                className={`absolute left-2 bottom-2 p-1.5 rounded-full transition-all ${isListening ? 'bg-red-500 text-white animate-pulse shadow-md shadow-red-200' : 'bg-emerald-50 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-slate-700 border border-emerald-100 dark:border-slate-700'}`}
            >
                <Mic size={16} />
            </button>
        </div>
    );
};

export const UnaniHealthSection = ({ onBack }: SectionProps) => {
  return (
    <div className="pb-10">
      <BackButton onClick={onBack} />
      <GeneralAISection 
        title="طبِ یونانی و صحت" 
        icon={Sprout} 
        colorClass="border-emerald-600" 
        promptContext="آپ ایک تجربہ کار ماہرِ طبِ یونانی (حکیم) اور ہیلتھ کنسلٹنٹ ہیں۔ صارف کے صحت، جڑی بوٹیوں، طبِ یونانی کے علاج، اور صحت مند طرزِ زندگی سے متعلق سوالات کا تفصیلی اور مستند جواب اردو میں دیں۔ جواب میں گھریلو ٹوٹکے، احتیاطی تدابیر اور طبِ قدیم کے اصولوں کو مدنظر رکھیں۔" 
        onBack={null} 
        hideBack 
      />
    </div>
  );
};

export const NumerologySection = ({ onBack }: SectionProps) => {
    const [name, setName] = useState('');
    const [motherName, setMotherName] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<string | null>(null);
    const [totals, setTotals] = useState({ name: 0, mother: 0 });

    const handleCalculate = async () => {
        if (!name.trim()) return;
        const nTotal = calculateAbjad(name);
        const mTotal = calculateAbjad(motherName);
        setTotals({ name: nTotal, mother: mTotal });
        setLoading(true);
        const analysis = await getNumerologyAnalysis(name, motherName, nTotal + mTotal);
        setResult(analysis);
        setLoading(false);
    };

    return (
        <div className="max-w-3xl mx-auto pb-10">
            <BackButton onClick={onBack} />
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-xl p-8 border border-emerald-100 dark:border-slate-800">
                <div className="flex items-center gap-5 mb-10">
                    <div className="p-5 bg-emerald-100 dark:bg-emerald-900/30 rounded-3xl text-emerald-600 dark:text-emerald-400 shadow-inner"><Calculator size={40} /></div>
                    <div>
                        <h2 className="text-3xl font-bold text-gray-800 dark:text-white ur-text">علم الاعداد (ابجد قمری)</h2>
                        <p className="text-gray-500 dark:text-slate-400 ur-text">نام کے اعداد کی روشنی میں شخصیت اور مستقبل کا گہرا تجزیہ</p>
                    </div>
                </div>
                <div className="space-y-6">
                    <div className="group">
                        <label className="block text-right mb-2 font-bold text-gray-700 dark:text-slate-300 mr-2 group-focus-within:text-emerald-600 transition-colors ur-text">صارف کا نام (اردو میں)</label>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full h-16 px-6 rounded-2xl border-2 border-gray-100 dark:border-slate-800 focus:border-emerald-500 outline-none text-right text-xl shadow-sm focus:ring-4 focus:ring-emerald-500/5 transition-all dark:bg-slate-950 dark:text-white" placeholder="مثلاً: محمد احمد" />
                    </div>
                    <div className="group">
                        <label className="block text-right mb-2 font-bold text-gray-700 dark:text-slate-300 mr-2 group-focus-within:text-emerald-600 transition-colors ur-text">والدہ کا نام (اردو میں)</label>
                        <input type="text" value={motherName} onChange={(e) => setMotherName(e.target.value)} className="w-full h-16 px-6 rounded-2xl border-2 border-gray-100 dark:border-slate-800 focus:border-emerald-500 outline-none text-right text-xl shadow-sm focus:ring-4 focus:ring-emerald-500/5 transition-all dark:bg-slate-950 dark:text-white" placeholder="مثلاً: مریم بی بی" />
                    </div>
                    <button onClick={handleCalculate} disabled={loading || !name} className="w-full py-5 bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-3xl font-bold text-xl shadow-xl shadow-emerald-200 dark:shadow-none flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50 transition-all ur-text">
                        {loading ? <Loader2 className="animate-spin" size={24} /> : <Sparkles size={24} />} اعداد نکالیں اور تجزیہ دیکھیں
                    </button>
                </div>
                {result && !loading && (
                    <div className="mt-10 p-8 bg-emerald-50 dark:bg-emerald-900/10 rounded-[2rem] border-2 border-emerald-100 dark:border-emerald-900 shadow-inner">
                        <div className="flex justify-between text-xl font-bold mb-6 text-emerald-800 dark:text-emerald-400">
                            <span className="bg-white dark:bg-slate-800 px-5 py-2 rounded-xl border border-emerald-100 dark:border-slate-700 shadow-sm">والدہ کے اعداد: {totals.mother}</span>
                            <span className="bg-white dark:bg-slate-800 px-5 py-2 rounded-xl border border-emerald-100 dark:border-slate-700 shadow-sm">نام کے اعداد: {totals.name}</span>
                        </div>
                        <div className="text-center">
                            <span className="text-gray-500 dark:text-slate-400 text-sm block mb-1 ur-text">مجموعی اعداد</span>
                            <span className="text-5xl font-black text-emerald-700 dark:text-emerald-400 drop-shadow-sm">{totals.name + totals.mother}</span>
                        </div>
                    </div>
                )}
                <GenericResult loading={loading} result={result} title="علم الاعداد کا مفصل روحانی تجزیہ" />
            </div>
        </div>
    );
};

export const BlackMagicSection = ({ onBack }: SectionProps) => {
    const [name, setName] = useState('');
    const [motherName, setMotherName] = useState('');
    const [selectedDay, setSelectedDay] = useState(getUrduDay());
    const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<string | null>(null);

    const symptomsList = [
        "سر اور کندھوں پر بوجھ رہنا", "گھبراہٹ اور بلاوجہ خوف", "خواب میں گندگی یا خون دیکھنا", "کاروبار یا کاموں میں اچانک بندش", 
        "گھر میں عجیب آوازیں یا بو آنا", "عبادت اور قرآن سے دوری محسوس کرنا", "ہر وقت شدید سستی اور تھکاوٹ", "جسم پر نیلے یا سیاہ دھبے",
        "سوتے میں جھٹکے لگنا یا دباؤ", "شادی میں بلاوجہ رکاوٹیں"
    ];

    const urduDays = ['اتوار', 'پیر', 'منگل', 'بدھ', 'جمعرات', 'جمعہ', 'ہفتہ'];

    const toggleSymptom = (s: string) => {
        setSelectedSymptoms(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
    };

    const handleDiagnose = async () => {
        if (!name.trim()) { alert("براہ کرم اپنا نام درج کریں۔"); return; }
        setLoading(true);

        const nameAbjad = calculateAbjad(name);
        const motherAbjad = calculateAbjad(motherName || 'نامعلوم');
        const dayAbjad = calculateAbjad(selectedDay);
        const totalSum = nameAbjad + motherAbjad + dayAbjad;
        const remainder = totalSum % 4;

        let numericalDiagnosis = "";
        let adviceText = "";

        if (remainder === 1) {
            numericalDiagnosis = "اندرونی بخار";
            adviceText = "**لازمی طبی ہدایت:** محترم جناب آپ کو اندرونی بخار ہے جو کہ بہت عرصہ سے ہے اس کے علاج کے لئے اپنے معالج سے یا شنگرف ہربل ایکس دواخانہ سے رابطہ کریں، یاد رہے آپ کے لئے دیسی طبی علاج بہتر ہے لیکن آپ انگریزی اور دیگر کسی بھی طب سے علاج کراسکتے ہیں ،";
        } else if (remainder === 2) {
            numericalDiagnosis = "جسمانی امراض";
            adviceText = "محترم جناب، آپ کو جسمانی اعصابی کمزوری اور پٹھوں کا کھچاؤ معلوم ہوتا ہے جو کہ نظامِ ہضم کی خرابی سے جڑا ہوا ہے۔ مناسب طبی غذا اور ورزش پر توجہ دیں اور کسی مستند معالج سے مشورہ لیں۔";
        } else if (remainder === 3) {
            numericalDiagnosis = "سایہ اور نظرِ بد";
            adviceText = "محترم جناب، آپ پر شدید نظرِ بد اور حاسدین کے حسد کا اثر معلوم ہوتا ہے۔ اس کے علاج کے لیے معوذتین اور منزل کی باقاعدگی سے تلاوت کریں اور صدقہ و خیرات کا اہتمام کریں۔";
        } else if (remainder === 0) {
            numericalDiagnosis = "کالا جادو";
            adviceText = "محترم جناب آپ پر کالا جادو کا اثر ہے، آپ اپنا علاج کسی نیک عالم دین یا ماہر عملیات سے جو باقائدہ نماز کا پابند ہو سے کرائیں ، یاد رہے کسی بھی لالچی اور بد کردار سے بچیں ورنہ علاج کی بجائے اپ کا پیسہ ختم ہو گا اور آپ کی زندگی بھی ،";
        }

        const prompt = `صارف کا نام: ${name}، والدہ کا نام: ${motherName || 'نامعلوم'}، دن: ${selectedDay}۔
        آپ کے پاس اعداد کے حساب سے تشخیص آئی ہے: "${numericalDiagnosis}"۔
        صارف کی منتخب کردہ علامات: ${selectedSymptoms.join('، ')}۔
        
        آپ کو اس تشخیص کی بنیاد پر رپورٹ تیار کرنی ہے۔ جواب میں لازمی طور پر یہ الفاظ شامل کریں اور انہیں موٹے حروف میں لکھیں:
        "${adviceText}"
        
        اس کے علاوہ قرآنی آیات (منزل، چاروں قل) اور روحانی حفاظت کے طریقے بھی اردو میں تفصیل سے بتائیں۔ اگر کالا جادو ہو تو خاص طور پر خبردار کریں۔`;

        const res = await generateSpiritualResponse(prompt);
        setResult(res);
        setLoading(false);
    };

    return (
        <div className="max-w-3xl mx-auto pb-10">
            <BackButton onClick={onBack} />
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-xl p-8 border border-red-100 dark:border-red-900/30">
                <div className="flex items-center gap-5 mb-10">
                    <div className="p-5 bg-red-100 dark:bg-red-900/20 rounded-3xl text-red-600 dark:text-red-400 shadow-inner"><Shield size={40} /></div>
                    <div>
                        <h2 className="text-3xl font-bold text-gray-800 dark:text-white ur-text">روحانی تشخیص (جادو و نظرِ بد)</h2>
                        <p className="text-gray-500 dark:text-slate-400 ur-text">نام اور علامات کی روشنی میں علمی و حسابی تشخیص</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10 text-right">
                    <div className="group">
                        <label className="block text-right mb-2 font-bold text-gray-700 dark:text-slate-300 mr-2 group-focus-within:text-red-600 transition-colors ur-text">صارف کا نام (اردو میں)</label>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full h-14 px-5 rounded-2xl border-2 border-gray-100 dark:border-slate-800 focus:border-red-500 outline-none text-right text-lg transition-all dark:bg-slate-950 dark:text-white" placeholder="محمد احمد" />
                    </div>
                    <div className="group">
                        <label className="block text-right mb-2 font-bold text-gray-700 dark:text-slate-300 mr-2 group-focus-within:text-red-600 transition-colors ur-text">والدہ کا نام (اردو میں)</label>
                        <input type="text" value={motherName} onChange={(e) => setMotherName(e.target.value)} className="w-full h-14 px-5 rounded-2xl border-2 border-gray-100 dark:border-slate-800 focus:border-red-500 outline-none text-right text-lg transition-all dark:bg-slate-950 dark:text-white" placeholder="مریم بی بی" />
                    </div>
                    <div className="group md:col-span-2">
                        <label className="block text-right mb-2 font-bold text-gray-700 dark:text-slate-300 mr-2 ur-text">دن کا نام</label>
                        <select value={selectedDay} onChange={(e) => setSelectedDay(e.target.value)} className="w-full h-14 px-5 rounded-2xl border-2 border-gray-100 dark:border-slate-800 focus:border-red-500 outline-none text-right text-lg transition-all appearance-none cursor-pointer dark:bg-slate-950 dark:text-white">
                            {urduDays.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>
                </div>

                <div className="mb-6">
                    <h3 className="text-right font-black mb-4 text-gray-800 dark:text-slate-200 ur-text">علامات منتخب کریں:</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {symptomsList.map(s => (
                            <button key={s} onClick={() => toggleSymptom(s)} className={`p-5 rounded-2xl border-2 transition-all text-right font-bold text-lg flex items-center justify-between gap-3 ur-text ${selectedSymptoms.includes(s) ? 'border-red-500 bg-red-50 dark:bg-red-900/10 text-red-900 dark:text-red-400 shadow-md shadow-red-100 dark:shadow-none' : 'border-gray-50 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/20 hover:border-red-200 text-gray-600 dark:text-slate-400'}`}>
                                <span className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${selectedSymptoms.includes(s) ? 'bg-red-500 border-red-500 text-white' : 'border-gray-300 dark:border-slate-600'}`}>
                                    {selectedSymptoms.includes(s) && <Check size={14} />}
                                </span>
                                {s}
                            </button>
                        ))}
                    </div>
                </div>

                <button onClick={handleDiagnose} disabled={loading || !name} className="w-full py-5 bg-gradient-to-r from-red-700 to-red-900 text-white rounded-3xl font-bold text-xl shadow-xl shadow-red-200 dark:shadow-none flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50 transition-all ur-text">
                    {loading ? <Loader2 className="animate-spin" size={24} /> : <Ghost size={24} />} حسابی و روحانی معائنہ کریں
                </button>
                <GenericResult loading={loading} result={result} title="حسابی و روحانی تشخیص کی مفصل رپورٹ" />
            </div>
        </div>
    );
};

export const DocumentSection = ({ onBack }: SectionProps) => {
    const [image, setImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setImage(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleAnalyze = async () => {
        if (!image) return;
        setLoading(true);
        const res = await analyzeMedicalReport(image);
        setResult(res);
        setLoading(false);
    };

    return (
        <div className="max-w-xl mx-auto pb-10">
            <BackButton onClick={onBack} />
            <div className="bg-white dark:bg-slate-900 rounded-[1.5rem] shadow-xl p-5 border border-blue-100 dark:border-slate-800">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-xl text-blue-600 dark:text-blue-400 shadow-inner">
                        <FileText size={28} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 dark:text-white ur-text leading-tight">میڈیکل رپورٹ ریڈر</h2>
                        <p className="text-xs text-gray-500 dark:text-slate-400 ur-text">خون کے ٹیسٹ یا ایکس رے رپورٹ اپلوڈ کریں</p>
                    </div>
                </div>
                
                <div className="border-2 border-dashed border-gray-100 dark:border-slate-800 rounded-[1rem] p-4 text-center mb-4 hover:border-blue-300 hover:bg-blue-50/30 dark:hover:bg-slate-800/30 transition-all cursor-pointer group" onClick={() => fileInputRef.current?.click()}>
                    {image ? (
                        <div className="relative inline-block">
                            <img src={image} className="max-h-40 mx-auto rounded-xl shadow-md border-2 border-white dark:border-slate-800" alt="Report" />
                            <button onClick={(e) => { e.stopPropagation(); setImage(null); }} className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-lg hover:bg-red-600 transition-colors">
                                <X size={14} />
                            </button>
                        </div>
                    ) : (
                        <div className="py-2">
                            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/10 text-blue-300 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:scale-110 group-hover:text-blue-500 transition-all shadow-inner">
                                <Upload size={24} />
                            </div>
                            <p className="text-sm font-bold text-gray-400 dark:text-slate-500 group-hover:text-blue-600 transition-colors ur-text">رپورٹ کی تصویر منتخب کریں</p>
                        </div>
                    )}
                    <input type="file" ref={fileInputRef} onChange={handleImageUpload} hidden accept="image/*" />
                </div>

                <button onClick={handleAnalyze} disabled={loading || !image} className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl font-bold text-lg shadow-md flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50 transition-all ur-text">
                    {loading ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />} خلاصہ دیکھیں
                </button>
                
                <GenericResult loading={loading} result={result} title="میڈیکل رپورٹ کا خلاصہ" />
            </div>
        </div>
    );
};

export const WazaifSection = ({ onBack }: SectionProps) => {
    const wazaif = [
        { title: "رزق میں خیر و برکت", desc: "سورہ واقعہ روزانہ مغرب کی نماز کے بعد تلاوت کریں۔", icon: Gift },
        { title: "ہر قسم کی بیماری سے شفا", desc: "سورہ فاتحہ 41 بار دم کر کے پانی پلائیں اور خود بھی پئیں۔", icon: HeartPulse },
        { title: "جادو اور بندش کا توڑ", desc: "چاروں قل اور منزل کی روزانہ صبح و شام تلاوت کریں۔", icon: ShieldCheck }
    ];

    return (
        <div className="max-w-3xl mx-auto pb-10">
            <BackButton onClick={onBack} />
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-xl p-8 border border-teal-100 dark:border-slate-800">
                <div className="flex items-center gap-5 mb-10">
                    <div className="p-5 bg-teal-100 dark:bg-teal-900/20 rounded-3xl text-teal-600 dark:text-teal-400 shadow-inner"><BookOpen size={40} /></div>
                    <div>
                        <h2 className="text-3xl font-bold text-gray-800 dark:text-white ur-text">وظائف و استخارہ</h2>
                        <p className="text-gray-500 dark:text-slate-400 ur-text">مشکلات کے حل کے لیے مستند وظائف اور رہنمائی</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 gap-4 mb-12">
                    {wazaif.map((w, i) => (
                        <div key={i} className="p-6 bg-gradient-to-l from-teal-50 to-white dark:from-slate-800 dark:to-slate-900 rounded-[2rem] border border-teal-100 dark:border-slate-800 shadow-sm flex items-center gap-6 text-right group hover:shadow-md transition-all">
                            <div className="p-4 bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-400 rounded-2xl shadow-sm group-hover:scale-110 transition-transform"><w.icon size={28} /></div>
                            <div className="flex-grow">
                                <h3 className="font-black text-teal-900 dark:text-teal-300 text-xl mb-1 ur-text">{w.title}</h3>
                                <p className="text-teal-700 dark:text-slate-400 text-lg leading-relaxed ur-text">{w.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="border-t-2 border-dashed border-teal-100 dark:border-slate-800 pt-10">
                    <GeneralAISection title="آن لائن استخارہ و رہنمائی" icon={Sparkles} colorClass="border-teal-600" promptContext="صارف اپنے کسی شرعی یا دنیاوی معاملے میں استخارہ اور رہنمائی چاہتا ہے۔ اسے سنت کے مطابق استخارہ کا طریقہ بتائیں اور اس کے مخصوص مسئلے پر دعا اور مشورہ دیں۔" onBack={null} hideBack />
                </div>
            </div>
        </div>
    );
};

export const PrayerTimesSection = ({ onBack }: SectionProps) => {
    const [loading, setLoading] = useState(true);
    const [times, setTimes] = useState<any>(null);
    const [locationName, setLocationName] = useState('مقامی جگہ تلاش کی جا رہی ہے...');
    const [userCoords, setUserCoords] = useState<{lat: number, lng: number} | null>(null);
    const [nearbyMosques, setNearbyMosques] = useState<any[]>([]);
    const [selectedMosque, setSelectedMosque] = useState<any>(null);
    const [routeInfo, setRouteInfo] = useState<{walk: string, drive: string} | null>(null);
    const [mapError, setMapError] = useState<string | null>(null);
    
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<any>(null);

    useEffect(() => {
        // Global handler for Google Maps Auth Failures (Billing/Authentication)
        (window as any).gm_authFailure = () => {
          setMapError("گوگل میپس کی بلنگ (Billing) فعال نہیں ہے یا اے پی آئی کی (API Key) میں مسئلہ ہے۔ براہ کرم گوگل کنسول چیک کریں۔");
        };

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(async (pos) => {
                const { latitude, longitude } = pos.coords;
                setUserCoords({lat: latitude, lng: longitude});
                try {
                    const response = await fetch(`https://api.aladhan.com/v1/timings?latitude=${latitude}&longitude=${longitude}&method=1`);
                    const data = await response.json();
                    if (data.code === 200) {
                        setTimes(data.data.timings);
                        const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=ur`);
                        const geoData = await geoRes.json();
                        setLocationName(geoData.address.city || geoData.address.town || geoData.address.village || 'آپ کا علاقہ');
                    }
                } catch (err) {
                    setLocationName('لوکیشن ایرر');
                } finally {
                    setLoading(false);
                }
            }, () => {
                setLocationName('لوکیشن کی اجازت نہیں ملی');
                setLoading(false);
            });
        }
    }, []);

    useEffect(() => {
        if (!loading && userCoords && mapRef.current && (window as any).google) {
            try {
                const google = (window as any).google;
                const map = new google.maps.Map(mapRef.current, {
                    center: userCoords,
                    zoom: 15,
                    disableDefaultUI: true,
                    zoomControl: true,
                    styles: [
                        { "featureType": "poi.place_of_worship", "elementType": "labels.icon", "stylers": [{ "visibility": "on" }] }
                    ]
                });
                mapInstance.current = map;

                new google.maps.Marker({
                    position: userCoords,
                    map: map,
                    icon: {
                        path: google.maps.SymbolPath.CIRCLE,
                        scale: 10,
                        fillColor: "#3B82F6",
                        fillOpacity: 1,
                        strokeWeight: 2,
                        strokeColor: "#FFFFFF",
                    },
                    title: "آپ کی جگہ"
                });

                const service = new google.maps.places.PlacesService(map);
                service.nearbySearch({
                    location: userCoords,
                    radius: 2000,
                    type: 'mosque'
                }, (results: any, status: any) => {
                    if (status === google.maps.places.PlacesServiceStatus.OK && results) {
                        setNearbyMosques(results);
                        results.forEach((place: any) => {
                            const marker = new google.maps.Marker({
                                position: place.geometry.location,
                                map: map,
                                icon: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
                                title: place.name
                            });

                            marker.addListener('click', () => {
                                setSelectedMosque(place);
                                calculateRoute(place.geometry.location);
                            });
                        });
                    } else if (status === 'REQUEST_DENIED') {
                        setMapError("پلیسز اے پی آئی (Places API) تک رسائی مسترد کر دی گئی ہے۔ براہ کرم کنسول میں 'Places API' اور 'Places API (New)' فعال کریں۔");
                    }
                });
            } catch (err) {
                console.error("Map initialization failed", err);
                setMapError("میپ لوڈ کرنے میں فنی خرابی پیش آئی ہے۔");
            }
        }
    }, [loading, userCoords]);

    const calculateRoute = (dest: any) => {
        const google = (window as any).google;
        const ds = new google.maps.DirectionsService();
        
        ds.route({
            origin: userCoords,
            destination: dest,
            travelMode: google.maps.TravelMode.WALKING
        }, (res: any, status: any) => {
            if (status === 'OK') {
                const walkTime = res.routes[0].legs[0].duration.text;
                ds.route({
                    origin: userCoords,
                    destination: dest,
                    travelMode: google.maps.TravelMode.DRIVING
                }, (resD: any, statusD: any) => {
                    if (statusD === 'OK') {
                        setRouteInfo({
                            walk: walkTime.replace('mins', 'منٹ').replace('hours', 'گھنتوں'),
                            drive: resD.routes[0].legs[0].duration.text.replace('mins', 'منٹ').replace('hours', 'گھنتوں')
                        });
                    }
                });
            }
        });
    };

    const fardPrayers = [
        { key: 'Fajr', label: 'فجر' },
        { key: 'Dhuhr', label: 'ظہر' },
        { key: 'Asr', label: 'عصر' },
        { key: 'Maghrib', label: 'مغرب' },
        { key: 'Isha', label: 'عشاء' }
    ];

    if (loading) return (
        <div className="max-w-3xl mx-auto py-20 text-center">
            <Loader2 className="animate-spin mx-auto text-teal-600 mb-6" size={60} />
            <h2 className="text-2xl font-bold text-teal-900 ur-text">لوکیشن کے مطابق اوقاتِ نماز تلاش کیے جا رہے ہیں...</h2>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto pb-10">
            <BackButton onClick={onBack} />
            
            <div className="bg-white rounded-[2.5rem] shadow-xl p-8 border border-teal-100 mb-8 overflow-hidden relative">
                <div className="absolute top-0 right-0 p-10 opacity-5 -mr-10 -mt-10"><Clock size={200} /></div>
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <div className="p-5 bg-teal-100 rounded-3xl text-teal-600 shadow-inner"><Clock size={40} /></div>
                        <div>
                            <h2 className="text-3xl font-black text-gray-800 ur-text">اوقاتِ نماز و قریبی مساجد</h2>
                            <p className="text-gray-500 font-bold flex items-center gap-2 ur-text">
                                <MapPin size={16} className="text-teal-600" /> {locationName}
                            </p>
                        </div>
                    </div>
                    <div className="bg-teal-50 px-6 py-4 rounded-3xl border border-teal-100 text-center md:text-right">
                        <span className="text-teal-600 text-sm font-bold block mb-1 ur-text">آج کی تاریخ</span>
                        <span className="text-xl font-black text-teal-900">{new Date().toLocaleDateString('ur-PK', { day:'numeric', month:'long', year:'numeric' })}</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white rounded-[2.5rem] shadow-xl p-6 border border-emerald-100">
                        <h3 className="text-xl font-black text-emerald-900 mb-6 flex items-center gap-3 border-r-4 border-emerald-500 pr-4 ur-text">
                            آج کے اوقاتِ نماز
                        </h3>
                        <div className="space-y-4">
                            {fardPrayers.map((p) => (
                                <div key={p.key} className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-50 flex items-center justify-between">
                                    <span className="text-xl font-black text-emerald-900 tracking-tighter" dir="ltr">{to12Hour(times?.[p.key])}</span>
                                    <span className="text-lg font-black text-emerald-800 ur-text">{p.label}</span>
                                </div>
                            ))}
                        </div>
                        <div className="mt-8 pt-6 border-t border-emerald-100">
                             <div className="flex items-center justify-between p-3 rounded-xl bg-red-50 text-red-700">
                                <span className="text-lg font-black tracking-tighter" dir="ltr">{to12Hour(times?.Sunrise)}</span>
                                <span className="font-bold ur-text">طلوعِ آفتاب</span>
                             </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-8 flex flex-col gap-6">
                    <div className="bg-white rounded-[2.5rem] shadow-xl overflow-hidden border border-blue-100 flex flex-col h-[500px] relative">
                        <div className="p-4 bg-blue-50 border-b border-blue-100 flex justify-between items-center z-10">
                            <h3 className="font-black text-blue-900 flex items-center gap-2 ur-text">
                                <Globe size={20} /> قریبی مساجد (2 کلومیٹر کے اندر)
                            </h3>
                            {nearbyMosques.length > 0 && <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold">{nearbyMosques.length} مساجد ملی ہیں</span>}
                        </div>
                        
                        {mapError ? (
                            <div className="flex-grow flex flex-col items-center justify-center p-8 text-center bg-gray-50">
                                <AlertTriangle className="text-red-500 mb-4" size={48} />
                                <h4 className="text-xl font-black text-red-700 mb-2 ur-text">گوگل میپس میں خرابی</h4>
                                <p className="text-gray-600 max-w-xs ur-text leading-relaxed">{mapError}</p>
                                <div className="mt-6 p-4 bg-white border rounded-2xl text-xs text-gray-400 text-right ur-text">
                                    <strong>حل:</strong> براہ کرم گوگل کلاؤڈ کنسول میں جائیں اور 'Places API (New)' کو فعال کریں اور بلنگ چیک کریں۔
                                </div>
                            </div>
                        ) : (
                            <div ref={mapRef} className="flex-grow"></div>
                        )}
                    </div>

                    {selectedMosque && (
                        <div className="bg-white rounded-[2.5rem] shadow-2xl p-6 border-2 border-emerald-500 animate-fade-in-up">
                            <div className="flex flex-col md:flex-row justify-between gap-6">
                                <div className="flex-grow text-right order-2 md:order-1">
                                    <h4 className="text-2xl font-black text-emerald-900 mb-2 ur-text">{selectedMosque.name}</h4>
                                    <p className="text-gray-500 font-bold flex items-center justify-end gap-2 mb-4 ur-text">
                                        {selectedMosque.vicinity} <MapPin size={16} />
                                    </p>
                                    
                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        <div className="p-4 bg-gray-50 rounded-2xl border flex flex-col items-center gap-1">
                                            <Car className="text-blue-600" />
                                            <span className="text-xs font-bold text-gray-400 ur-text">گاڑی پر</span>
                                            <span className="font-black text-gray-800 ur-text">{routeInfo?.drive || '--'}</span>
                                        </div>
                                        <div className="p-4 bg-gray-50 rounded-2xl border flex flex-col items-center gap-1">
                                            <Footprints className="text-emerald-600" />
                                            <span className="text-xs font-bold text-gray-400 ur-text">پیدل راستہ</span>
                                            <span className="font-black text-gray-800 ur-text">{routeInfo?.walk || '--'}</span>
                                        </div>
                                    </div>
                                    
                                    <a 
                                        href={`https://www.google.com/maps/dir/?api=1&destination=${selectedMosque.geometry.location.lat()},${selectedMosque.geometry.location.lng()}`} 
                                        target="_blank" 
                                        className="inline-flex items-center gap-3 bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-2xl font-black shadow-lg transition-all ur-text"
                                    >
                                        راستہ دکھائیں (Directions) <Navigation2 size={20} />
                                    </a>
                                </div>
                                <div className="w-full md:w-32 h-32 bg-emerald-50 rounded-3xl flex items-center justify-center text-emerald-600 shrink-0 order-1 md:order-2 self-center md:self-start">
                                    <MapPin size={60} />
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {!selectedMosque && !mapError && (
                        <div className="p-10 bg-blue-50/50 rounded-[2.5rem] border border-blue-100 text-center border-dashed">
                             <Navigation className="mx-auto text-blue-300 mb-4 animate-bounce-slow" size={48} />
                             <p className="text-blue-900 font-black ur-text text-xl">کسی بھی مسجد پر کلک کریں</p>
                             <p className="text-blue-600 ur-text">پیدل اور گاڑی کا وقت معلوم کرنے کے لیے نقشے پر مسجد سلیکٹ کریں</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export const SpiritualSection = ({ onBack }: SectionProps) => (
    <div className="pb-10">
        <BackButton onClick={onBack} />
        <GeneralAISection title="روحانی رہنمائی و سوالات" icon={Moon} colorClass="border-emerald-700" promptContext="آپ ایک روحانی مرشد اور عالمِ دین ہیں۔ صارف کے کسی بھی مذہبی, اخلاقی یا روحانی سوال کا قرآن و سنت کی روشنی میں ہمدردانہ جواب دیں۔" onBack={null} hideBack />
    </div>
);

export const ContactSection = ({ onBack }: SectionProps) => {
    const waLinkYaasin = "https://wa.me/923009459059";
    const waLinkAshfaq = "https://wa.me/923394747597";
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(waLinkYaasin)}`;

    return (
        <div className="max-w-3xl mx-auto pb-10">
            <BackButton onClick={onBack} />
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-xl p-10 border border-emerald-100 text-center">
                <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner animate-bounce-slow">
                    <MessageSquare size={36} />
                </div>
                <h2 className="text-3xl font-black text-gray-800 mb-2 ur-text">رابطہ کی معلومات</h2>
                <p className="text-gray-500 text-lg mb-10 ur-text">ہم سے براہِ راحت رابطہ کریں</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-right mb-10">
                    {/* WhatsApp Button Section */}
                    <div className="p-8 bg-emerald-50 rounded-[2rem] border-2 border-emerald-100 flex flex-col items-center justify-center gap-4 group hover:bg-emerald-100 transition-all shadow-sm">
                        <div className="p-4 bg-white text-emerald-600 rounded-2xl shadow-sm mb-2 group-hover:scale-110 transition-transform">
                            <Smartphone size={40} />
                        </div>
                        <h3 className="text-xl font-black text-emerald-900 ur-text">وٹس ایپ میسج</h3>
                        <p className="text-sm text-emerald-700 font-bold mb-4 ur-text">براہ راست میسج بھیجنے کے لیے کلک کریں</p>
                        <a 
                            href={waLinkYaasin} 
                            target="_blank" 
                            className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black shadow-lg transition-all flex items-center justify-center gap-3 ur-text text-xl"
                        >
                            واٹس ایپ چیٹ <ExternalLink size={20} />
                        </a>
                    </div>

                    {/* QR Code Section */}
                    <div className="p-8 bg-white rounded-[2rem] border-2 border-emerald-100 flex flex-col items-center justify-center gap-4 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5 text-emerald-900">
                            <QrCode size={100} />
                        </div>
                        <h3 className="text-xl font-black text-emerald-900 ur-text relative z-10">سکین کریں (QR Code)</h3>
                        <div className="p-3 bg-white border-4 border-emerald-50 rounded-2xl shadow-inner relative z-10">
                            <img 
                                src={qrCodeUrl} 
                                alt="WhatsApp QR Code" 
                                className="w-48 h-48 object-contain rounded-lg"
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = 'https://via.placeholder.com/300?text=QR+Code';
                                }}
                            />
                        </div>
                        <p className="text-xs text-emerald-600 font-bold mt-2 ur-text">موبائل کیمرے سے سکین کریں</p>
                    </div>
                </div>

                <div className="bg-gray-50 p-6 rounded-[2rem] border border-gray-100 text-right">
                    <h3 className="font-black text-xl text-gray-800 mb-4 flex items-center justify-end gap-2 border-b pb-2 ur-text">ٹیم ممبران <Users size={20}/></h3>
                    <div className="space-y-4">
                        <a 
                          href={waLinkYaasin} 
                          target="_blank" 
                          className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm hover:bg-emerald-50 transition-colors group border border-transparent hover:border-emerald-200"
                        >
                            <span className="text-emerald-700 font-bold ur-text">کہروڑ پکا</span>
                            <span className="text-gray-800 font-black ur-text flex items-center gap-2 group-hover:text-emerald-800 transition-colors">
                                حکیم غلام یاسین آرائیں <MessageSquare size={18} className="text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </span>
                        </a>
                        <a 
                          href={waLinkAshfaq} 
                          target="_blank" 
                          className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm hover:bg-blue-50 transition-colors group border border-transparent hover:border-blue-200"
                        >
                            <span className="text-blue-700 font-bold ur-text">خانیوال</span>
                            <span className="text-gray-800 font-black ur-text flex items-center gap-2 group-hover:text-blue-800 transition-colors">
                                حاجی اشفاق احمد <MessageSquare size={18} className="text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </span>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const SettingsSection = ({ onBack }: SectionProps) => {
    const [isDark, setIsDark] = useState(() => localStorage.getItem('theme') === 'dark');
    const [fontSize, setFontSize] = useState(() => localStorage.getItem('font-size') || 'normal');
    const [isClearing, setIsClearing] = useState(false);

    // Effect to apply settings on change
    useEffect(() => {
        // Theme Apply
        if (isDark) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }

        // Font Size Apply
        const sizeMap: Record<string, string> = {
            'small': '0.9rem',
            'normal': '1.1rem',
            'large': '1.3rem'
        };
        document.documentElement.style.fontSize = sizeMap[fontSize] || '1.1rem';
        localStorage.setItem('font-size', fontSize);
    }, [isDark, fontSize]);

    const handleClearData = () => {
        if (window.confirm("کیا آپ واقعی اپنا تمام محفوظ کردہ ڈیٹا (ترتیبات اور پرائیویسی قبولیت) ختم کرنا چاہتے ہیں؟")) {
            setIsClearing(true);
            setTimeout(() => {
                localStorage.clear();
                window.location.reload();
            }, 800);
        }
    };

    return (
        <div className="max-w-3xl mx-auto pb-10">
            <BackButton onClick={onBack} />
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-xl p-8 md:p-10 border border-gray-100 dark:border-slate-800 transition-colors">
                <div className="flex items-center gap-5 mb-10">
                    <div className="p-5 bg-gray-100 dark:bg-slate-800 rounded-3xl text-gray-600 dark:text-slate-400 shadow-inner"><SettingsIcon size={40} /></div>
                    <div>
                        <h2 className="text-3xl font-black text-gray-800 dark:text-white ur-text">ترتیبات (Settings)</h2>
                        <p className="text-gray-500 dark:text-slate-400 ur-text">ایپلیکیشن کو اپنی ضرورت کے مطابق ترتیب دیں</p>
                    </div>
                </div>

                <div className="space-y-8">
                    {/* Dark Mode Toggle */}
                    <div className="p-6 bg-gray-50 dark:bg-slate-800/50 rounded-[2rem] flex items-center justify-between border border-transparent hover:border-emerald-100 dark:hover:border-slate-700 transition-all">
                        <div className="flex items-center gap-5">
                             <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm transition-colors ${isDark ? 'bg-slate-700 text-yellow-400' : 'bg-white text-emerald-600'}`}>
                                {isDark ? <Moon size={28}/> : <Sun size={28}/>}
                             </div>
                             <div>
                                <span className="font-black text-xl text-gray-800 dark:text-white ur-text">نائٹ موڈ (Dark Mode)</span>
                                <p className="text-sm text-gray-500 dark:text-slate-400 ur-text">آنکھوں کی حفاظت کے لیے ڈارک تھیم</p>
                             </div>
                        </div>
                        <button 
                            onClick={() => setIsDark(!isDark)}
                            className={`w-16 h-8 rounded-full relative transition-all shadow-inner border ${isDark ? 'bg-emerald-600 border-emerald-700' : 'bg-gray-300 border-gray-200'}`}
                        >
                            <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all ${isDark ? 'right-9' : 'right-1'}`}></div>
                        </button>
                    </div>

                    {/* Font Size Selector */}
                    <div className="p-6 bg-gray-50 dark:bg-slate-800/50 rounded-[2rem] border border-transparent transition-all">
                        <div className="flex items-center gap-5 mb-6">
                             <div className="w-14 h-14 bg-white dark:bg-slate-700 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm"><Type size={28}/></div>
                             <div>
                                <span className="font-black text-xl text-gray-800 dark:text-white ur-text">تحریر کا سائز (Text Size)</span>
                                <p className="text-sm text-gray-500 dark:text-slate-400 ur-text">پڑھنے میں آسانی کے لیے فونٹ سائز تبدیل کریں</p>
                             </div>
                        </div>
                        <div className="flex gap-3 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-gray-100 dark:border-slate-800">
                            {['small', 'normal', 'large'].map((size) => (
                                <button 
                                    key={size}
                                    onClick={() => setFontSize(size)}
                                    className={`flex-1 py-3 rounded-xl font-bold transition-all ur-text ${fontSize === size ? 'bg-emerald-600 text-white shadow-lg' : 'text-gray-500 dark:text-slate-400 hover:bg-emerald-50 dark:hover:bg-slate-800'}`}
                                >
                                    {size === 'small' ? 'چھوٹا' : size === 'normal' ? 'نارمل' : 'بڑا'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Clear Data */}
                    <div className="p-6 bg-red-50 dark:bg-red-900/10 rounded-[2rem] border border-red-100 dark:border-red-900/30 flex items-center justify-between group">
                        <div className="flex items-center gap-5">
                             <div className="w-14 h-14 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center text-red-500 shadow-sm group-hover:rotate-12 transition-transform"><Trash2 size={28}/></div>
                             <div>
                                <span className="font-black text-xl text-red-700 dark:text-red-400 ur-text">ڈیٹا صاف کریں</span>
                                <p className="text-sm text-red-500/70 dark:text-red-400/60 ur-text">تمام محفوظ ترتیبات کو ختم کریں</p>
                             </div>
                        </div>
                        <button 
                            onClick={handleClearData}
                            disabled={isClearing}
                            className={`px-8 py-3 bg-red-600 text-white rounded-2xl font-black shadow-lg shadow-red-200 dark:shadow-none hover:bg-red-700 active:scale-95 transition-all ur-text ${isClearing ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {isClearing ? <Loader2 className="animate-spin"/> : 'ڈیلیٹ کریں'}
                        </button>
                    </div>

                    {/* About Section */}
                    <div className="mt-8 pt-8 border-t dark:border-slate-800 text-center">
                        <div className="flex justify-center gap-2 mb-4 opacity-70">
                            <ShieldCheck className="text-emerald-600" size={20} />
                            <span className="text-xs font-bold text-gray-500 dark:text-slate-500 ur-text">یہ ایپلیکیشن مکمل طور پر محفوظ ہے اور آپ کا ڈیٹا کہیں شیئر نہیں کرتی</span>
                        </div>
                        <p className="text-[10px] text-gray-400 ur-text">Version 2.5.0 Build 2024.12 • Apps Talk SMC Pvt Ltd</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const TimeScienceSection = ({ onBack }: SectionProps) => {
    const [name, setName] = useState('');
    const [motherName, setMotherName] = useState('');
    const [dobOrAge, setDobOrAge] = useState('');
    const [dayOfQuestion, setDayOfQuestion] = useState(getUrduDay());
    const [question, setQuestion] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<string | null>(null);

    const urduDays = ['اتوار', 'پیر', 'منگل', 'بدھ', 'جمعرات', 'جمعہ', 'ہفتہ'];

    const handleCalculateTime = async () => {
        if (!name.trim()) { alert("براہ کرم اپنا نام درج کریں۔"); return; }
        setLoading(true);
        const prompt = `آپ علم الساعات (وقت کے علم) کے ماہر ہیں۔ درج ذیل معلومات کی روشنی میں 'ساعت' کا تجزیہ کریں:
صارف کا نام: ${name}
والدہ کا نام: ${motherName || 'نامعلوم'}
تاریخ پیدائش یا عمر: ${dobOrAge || 'نامعلوم'}
سوال کرنے کا دن: ${dayOfQuestion}
سوال: ${question || 'صارف اس وقت کی سعد یا نحس ساعت اور موزوں کاموں کے بارے میں جاننا چاہتا ہے۔'}

ان معلومات کی روشنی میں بتائیں کہ اس وقت کون سی 'ساعت' چل رہی ہے اور کسی بھی نئے کام یا مقصد کے لیے یہ وقت کیسا ہے۔ تفصیل اردو میں فراہم کریں۔`;
        
        const res = await generateSpiritualResponse(prompt);
        setResult(res);
        setLoading(false);
    };

    return (
        <div className="max-w-3xl mx-auto pb-10">
            <BackButton onClick={onBack} />
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-xl p-8 border border-purple-100 dark:border-slate-800">
                <div className="flex items-center gap-5 mb-10">
                    <div className="p-5 bg-purple-100 dark:bg-purple-900/30 rounded-3xl text-purple-600 dark:text-purple-400 shadow-inner"><Watch size={40} /></div>
                    <div>
                        <h2 className="text-3xl font-bold text-gray-800 dark:text-white ur-text">علم الساعات</h2>
                        <p className="text-gray-500 dark:text-slate-400 ur-text">وقت کی تاثیر اور سعد و نحس ساعتوں کا علمی تجزیہ</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 text-right">
                    <div className="group">
                        <label className="block text-right mb-2 font-bold text-gray-700 dark:text-slate-300 mr-2 ur-text">آپ کا نام (اردو میں)</label>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full h-14 px-5 rounded-2xl border-2 border-gray-100 dark:border-slate-800 focus:border-purple-500 outline-none text-right text-lg transition-all dark:bg-slate-950 dark:text-white" placeholder="محمد احمد" />
                    </div>
                    <div className="group">
                        <label className="block text-right mb-2 font-bold text-gray-700 dark:text-slate-300 mr-2 ur-text">والدہ کا نام (اردو میں)</label>
                        <input type="text" value={motherName} onChange={(e) => setMotherName(e.target.value)} className="w-full h-14 px-5 rounded-2xl border-2 border-gray-100 dark:border-slate-800 focus:border-purple-500 outline-none text-right text-lg transition-all dark:bg-slate-950 dark:text-white" placeholder="مریم بی بی" />
                    </div>
                </div>

                <button onClick={handleCalculateTime} disabled={loading || !name} className="w-full py-5 bg-gradient-to-r from-purple-600 to-indigo-700 text-white rounded-3xl font-bold text-xl shadow-xl shadow-purple-200 flex items-center justify-center gap-3 ur-text">
                    {loading ? <Loader2 className="animate-spin" size={24} /> : <SearchCheck size={24} />} ساعت معلوم کریں
                </button>

                <GenericResult loading={loading} result={result} title="علم الساعات کی روشنی میں وقت کا تجزیہ" />
            </div>
        </div>
    );
};

export const HoroscopeSection = ({ onBack }: SectionProps) => {
    const [name, setName] = useState('');
    const [motherName, setMotherName] = useState('');
    const [dob, setDob] = useState('');
    const [birthDay, setBirthDay] = useState('پیر');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<string | null>(null);

    const days = ['پیر', 'منگل', 'بدھ', 'جمعرات', 'جمعہ', 'ہفتہ', 'اتوار'];

    const handleGenerateHoroscope = async () => {
        if (!name.trim()) return;
        setLoading(true);
        const prompt = `آپ ایک تجربہ کار نجومی (Astrologer) ہیں۔ درج ذیل معلومات کی روشنی میں صارف کا مکمل زائچہ تیار کریں:
نام: ${name}
والدہ کا نام: ${motherName || 'نامعلوم'}
تاریخ پیدائش: ${dob || 'نامعلوم'}
پیدائش کا دن: ${birthDay}
ان معلومات کی روشنی میں شخصیت, برج (Zodiac Sign), ستارہ, مستقبل, صحت, محبت اور کاروبار کے بارے میں تفصیلی پیشگوئی اردو میں فراہم کریں۔`;
        
        const res = await generateSpiritualResponse(prompt);
        setResult(res);
        setLoading(false);
    };

    return (
        <div className="max-w-3xl mx-auto pb-10">
            <BackButton onClick={onBack} />
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-xl p-8 border border-orange-100 dark:border-slate-800">
                <div className="flex items-center gap-5 mb-10">
                    <div className="p-5 bg-orange-100 dark:bg-orange-900/20 rounded-3xl text-orange-600 dark:text-orange-400 shadow-inner"><Star size={40} /></div>
                    <div>
                        <h2 className="text-3xl font-bold text-gray-800 dark:text-white ur-text">زائچہ و نجوم</h2>
                        <p className="text-gray-500 dark:text-slate-400 ur-text">اپنی پیدائشی تفصیلات درج کریں تاکہ آپ کا درست زائچہ تیار کیا جا سکے</p>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-right">
                    <div className="group">
                        <label className="block mb-2 font-bold text-gray-700 dark:text-slate-300 mr-2 ur-text">آپ کا نام (اردو میں)</label>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full h-14 px-5 rounded-2xl border-2 border-gray-100 dark:border-slate-800 focus:border-orange-500 outline-none text-right text-lg transition-all dark:bg-slate-950 dark:text-white" placeholder="محمد احمد" />
                    </div>
                    <div className="group">
                        <label className="block mb-2 font-bold text-gray-700 dark:text-slate-300 mr-2 ur-text">والدہ کا نام (اردو میں)</label>
                        <input type="text" value={motherName} onChange={(e) => setMotherName(e.target.value)} className="w-full h-14 px-5 rounded-2xl border-2 border-gray-100 dark:border-slate-800 focus:border-orange-500 outline-none text-right text-lg transition-all dark:bg-slate-950 dark:text-white" placeholder="مریم بی بی" />
                    </div>
                </div>

                <button onClick={handleGenerateHoroscope} disabled={loading || !name} className="w-full py-5 mt-8 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-3xl font-bold text-xl shadow-xl ur-text">
                    {loading ? <Loader2 className="animate-spin" size={24} /> : <Sparkle size={24} />} زائچہ تیار کریں
                </button>

                <GenericResult loading={loading} result={result} title="آپ کا مفصل زائچہ و نجومی پیشگوئی" />
            </div>
        </div>
    );
};

export const GeneralAISection = ({ title, icon: Icon, colorClass, promptContext, onBack, hideBack }: any) => {
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
        <div className="max-w-xl mx-auto">
             {!hideBack && <BackButton onClick={onBack} />}
             <div className={`bg-white rounded-[1rem] shadow-md p-4 border-t-[4px] ${colorClass}`}>
                <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 rounded-lg shadow-inner ${colorClass.replace('border-', 'bg-').replace('-700', '-50').replace('-600', '-50')} ${colorClass.replace('border-', 'text-')}`}><Icon size={20} /></div>
                    <h2 className="text-lg font-black text-gray-800 dark:text-white ur-text leading-none">{title}</h2>
                </div>
                <div className="space-y-3">
                    <VoiceInput value={input} onChange={setInput} placeholder="اپنا سوال لکھیں..." multiline />
                    <button 
                        onClick={handleAsk} 
                        disabled={loading || !input} 
                        className={`w-full py-2.5 bg-gradient-to-r ${colorClass.replace('border-', 'from-').replace('600', '700').replace('700', '900')} to-gray-800 text-white rounded-lg font-bold text-base shadow-sm flex items-center justify-center gap-2 active:scale-95 transition-all ur-text`}
                    >
                        {loading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />} جواب حاصل کریں
                    </button>
                </div>
                <GenericResult loading={loading} result={result} title={title} />
             </div>
        </div>
    );
};
