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
  <div className="flex justify-start mb-4 no-print">
    <button onClick={onClick} className="flex items-center gap-2 bg-white dark:bg-slate-800 text-emerald-800 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900 px-4 py-2 rounded-xl shadow-sm hover:shadow-md hover:bg-emerald-50 dark:hover:bg-slate-700 transition-all font-bold group text-sm">
      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /> واپس ہوم پر جائیں
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
    <div className="pb-8">
      <BackButton onClick={onBack} />
      <GeneralAISection 
        title="طبِ یونانی و صحت" 
        icon={Sprout} 
        colorClass="border-emerald-600" 
        promptContext="آپ ایک تجربہ کار ماہرِ طبِ یونانی (حکیم) اور ہیلتھ کنسلٹنٹ ہیں۔ صارف اپنی علامات بتائے گا، آپ کو ان علامات کی روشنی میں 3 سے 5 ممکنہ امراض کی فہرست دینی ہے، پھر سب سے قوی مرض کی تشخیص کرنی ہے اور اس کا تفصیلی علاج (طبِ یونانی مرکبات، جڑی بوٹیاں، روغن، حجامہ، اروما تھراپی، ہومیو پیتھک، ایلو پیتھک، ٹیسٹ اور پرہیز) فراہم کرنا ہے۔" 
        onBack={null} 
        hideBack 
      />
    </div>
  );
};

export const NumerologySection = ({ onBack }: SectionProps) => {
    const [name, setName] = useState('');
    const [motherName, setMotherName] = useState('');
    const [fatherName, setFatherName] = useState('');
    const [spouseName, setSpouseName] = useState('');
    const [friendName, setFriendName] = useState('');
    const [businessName, setBusinessName] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<string | null>(null);
    const [totals, setTotals] = useState<Record<string, number>>({});

    const handleCalculate = async () => {
        if (!name.trim()) return;
        
        const nTotal = calculateAbjad(name);
        const mTotal = calculateAbjad(motherName);
        const fTotal = calculateAbjad(fatherName);
        const sTotal = calculateAbjad(spouseName);
        const frTotal = calculateAbjad(friendName);
        const bTotal = calculateAbjad(businessName);

        setTotals({ 
            name: nTotal, 
            mother: mTotal, 
            father: fTotal, 
            spouse: sTotal, 
            friend: frTotal, 
            business: bTotal 
        });

        setLoading(true);
        
        const prompt = `آپ علم الاعداد (ابجد قمری) کے ماہر ہیں۔ درج ذیل معلومات کی روشنی میں تفصیلی تجزیہ کریں:
صارف کا نام: ${name} (اعداد: ${nTotal})
والدہ کا نام: ${motherName || 'نامعلوم'} (اعداد: ${mTotal})
والد کا نام: ${fatherName || 'نامعلوم'} (اعداد: ${fTotal})
شریک حیات کا نام: ${spouseName || 'نامعلوم'} (اعداد: ${sTotal})
دوست کا نام: ${friendName || 'نامعلوم'} (اعداد: ${frTotal})
کاروبار کا نام: ${businessName || 'نامعلوم'} (اعداد: ${bTotal})

ان تمام اعداد کی روشنی میں شخصیت، مستقبل، موافق رنگ، پتھر، دن، اور کاروباری و ازدواجی زندگی کا گہرا تجزیہ اردو میں فراہم کریں۔`;
        
        const analysis = await generateSpiritualResponse(prompt);
        setResult(analysis);
        setLoading(false);
    };

    return (
        <div className="max-w-xl mx-auto pb-8">
            <BackButton onClick={onBack} />
            <div className="bg-white dark:bg-slate-900 rounded-[1rem] shadow-lg p-5 border border-emerald-100 dark:border-slate-800">
                <div className="flex items-center gap-3 mb-5">
                    <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl text-emerald-600 dark:text-emerald-400 shadow-inner"><Calculator size={24} /></div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 dark:text-white ur-text leading-tight">علم الاعداد (ابجد قمری)</h2>
                        <p className="text-[10px] text-gray-500 dark:text-slate-400 ur-text">نام کے اعداد کی روشنی میں شخصیت اور مستقبل کا گہرا تجزیہ</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-right">
                    <div className="group">
                        <label className="block mb-1 font-bold text-gray-700 dark:text-slate-300 mr-2 ur-text text-xs">صارف کا نام (اردو میں)</label>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full h-10 px-4 rounded-lg border-2 border-gray-100 dark:border-slate-800 focus:border-emerald-500 outline-none text-right text-base transition-all dark:bg-slate-950 dark:text-white" placeholder="مثلاً: محمد احمد" />
                    </div>
                    <div className="group">
                        <label className="block mb-1 font-bold text-gray-700 dark:text-slate-300 mr-2 ur-text text-xs">والدہ کا نام (اردو میں)</label>
                        <input type="text" value={motherName} onChange={(e) => setMotherName(e.target.value)} className="w-full h-10 px-4 rounded-lg border-2 border-gray-100 dark:border-slate-800 focus:border-emerald-500 outline-none text-right text-base transition-all dark:bg-slate-950 dark:text-white" placeholder="مثلاً: مریم بی بی" />
                    </div>
                    <div className="group">
                        <label className="block mb-1 font-bold text-gray-700 dark:text-slate-300 mr-2 ur-text text-xs">والد کا نام (اختیاری)</label>
                        <input type="text" value={fatherName} onChange={(e) => setFatherName(e.target.value)} className="w-full h-10 px-4 rounded-lg border-2 border-gray-100 dark:border-slate-800 focus:border-emerald-500 outline-none text-right text-base transition-all dark:bg-slate-950 dark:text-white" placeholder="والد کا نام" />
                    </div>
                    <div className="group">
                        <label className="block mb-1 font-bold text-gray-700 dark:text-slate-300 mr-2 ur-text text-xs">شریک حیات کا نام (اختیاری)</label>
                        <input type="text" value={spouseName} onChange={(e) => setSpouseName(e.target.value)} className="w-full h-10 px-4 rounded-lg border-2 border-gray-100 dark:border-slate-800 focus:border-emerald-500 outline-none text-right text-base transition-all dark:bg-slate-950 dark:text-white" placeholder="شریک حیات کا نام" />
                    </div>
                    <div className="group">
                        <label className="block mb-1 font-bold text-gray-700 dark:text-slate-300 mr-2 ur-text text-xs">دوست کا نام (اختیاری)</label>
                        <input type="text" value={friendName} onChange={(e) => setFriendName(e.target.value)} className="w-full h-10 px-4 rounded-lg border-2 border-gray-100 dark:border-slate-800 focus:border-emerald-500 outline-none text-right text-base transition-all dark:bg-slate-950 dark:text-white" placeholder="دوست کا نام" />
                    </div>
                    <div className="group">
                        <label className="block mb-1 font-bold text-gray-700 dark:text-slate-300 mr-2 ur-text text-xs">کاروبار کا نام (اختیاری)</label>
                        <input type="text" value={businessName} onChange={(e) => setBusinessName(e.target.value)} className="w-full h-10 px-4 rounded-lg border-2 border-gray-100 dark:border-slate-800 focus:border-emerald-500 outline-none text-right text-base transition-all dark:bg-slate-950 dark:text-white" placeholder="کاروبار کا نام" />
                    </div>
                </div>
                <button onClick={handleCalculate} disabled={loading || !name} className="w-full py-2.5 mt-5 bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-xl font-bold text-base shadow-md active:scale-95 transition-all ur-text flex items-center justify-center gap-2">
                    {loading ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />} اعداد نکالیں اور تجزیہ دیکھیں
                </button>
                
                {result && !loading && (
                    <div className="mt-5 p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl border-2 border-emerald-100 dark:border-emerald-900 shadow-inner">
                        <div className="grid grid-cols-2 gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-400">
                            <div className="bg-white dark:bg-slate-800 p-2 rounded-lg border border-emerald-100 dark:border-slate-700 shadow-sm text-center">نام: {totals.name}</div>
                            <div className="bg-white dark:bg-slate-800 p-2 rounded-lg border border-emerald-100 dark:border-slate-700 shadow-sm text-center">والدہ: {totals.mother}</div>
                            {totals.father > 0 && <div className="bg-white dark:bg-slate-800 p-2 rounded-lg border border-emerald-100 dark:border-slate-700 shadow-sm text-center">والد: {totals.father}</div>}
                            {totals.spouse > 0 && <div className="bg-white dark:bg-slate-800 p-2 rounded-lg border border-emerald-100 dark:border-slate-700 shadow-sm text-center">شریک حیات: {totals.spouse}</div>}
                            {totals.friend > 0 && <div className="bg-white dark:bg-slate-800 p-2 rounded-lg border border-emerald-100 dark:border-slate-700 shadow-sm text-center">دوست: {totals.friend}</div>}
                            {totals.business > 0 && <div className="bg-white dark:bg-slate-800 p-2 rounded-lg border border-emerald-100 dark:border-slate-700 shadow-sm text-center">کاروبار: {totals.business}</div>}
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
        <div className="max-w-2xl mx-auto pb-8">
            <BackButton onClick={onBack} />
            <div className="bg-white dark:bg-slate-900 rounded-[1.5rem] shadow-lg p-6 border border-red-100 dark:border-red-900/30">
                <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-2xl text-red-600 dark:text-red-400 shadow-inner"><Shield size={32} /></div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white ur-text">روحانی تشخیص (جادو و نظرِ بد)</h2>
                        <p className="text-sm text-gray-500 dark:text-slate-400 ur-text">نام اور علامات کی روشنی میں علمی و حسابی تشخیص</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-right">
                    <div className="group">
                        <label className="block text-right mb-1 font-bold text-gray-700 dark:text-slate-300 mr-2 group-focus-within:text-red-600 transition-colors ur-text text-sm">صارف کا نام (اردو میں)</label>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full h-12 px-4 rounded-xl border-2 border-gray-100 dark:border-slate-800 focus:border-red-500 outline-none text-right text-lg transition-all dark:bg-slate-950 dark:text-white" placeholder="محمد احمد" />
                    </div>
                    <div className="group">
                        <label className="block text-right mb-1 font-bold text-gray-700 dark:text-slate-300 mr-2 group-focus-within:text-red-600 transition-colors ur-text text-sm">والدہ کا نام (اردو میں)</label>
                        <input type="text" value={motherName} onChange={(e) => setMotherName(e.target.value)} className="w-full h-12 px-4 rounded-xl border-2 border-gray-100 dark:border-slate-800 focus:border-red-500 outline-none text-right text-lg transition-all dark:bg-slate-950 dark:text-white" placeholder="مریم بی بی" />
                    </div>
                    <div className="group md:col-span-2">
                        <label className="block text-right mb-1 font-bold text-gray-700 dark:text-slate-300 mr-2 ur-text text-sm">دن کا نام</label>
                        <select value={selectedDay} onChange={(e) => setSelectedDay(e.target.value)} className="w-full h-12 px-4 rounded-xl border-2 border-gray-100 dark:border-slate-800 focus:border-red-500 outline-none text-right text-lg transition-all appearance-none cursor-pointer dark:bg-slate-950 dark:text-white">
                            {urduDays.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>
                </div>

                <div className="mb-4">
                    <h3 className="text-right font-black mb-3 text-gray-800 dark:text-slate-200 ur-text text-base">علامات منتخب کریں:</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {symptomsList.map(s => (
                            <button key={s} onClick={() => toggleSymptom(s)} className={`p-3 rounded-xl border-2 transition-all text-right font-bold text-base flex items-center justify-between gap-2 ur-text ${selectedSymptoms.includes(s) ? 'border-red-500 bg-red-50 dark:bg-red-900/10 text-red-900 dark:text-red-400 shadow-md shadow-red-100 dark:shadow-none' : 'border-gray-50 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/20 hover:border-red-200 text-gray-600 dark:text-slate-400'}`}>
                                <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${selectedSymptoms.includes(s) ? 'bg-red-500 border-red-500 text-white' : 'border-gray-300 dark:border-slate-600'}`}>
                                    {selectedSymptoms.includes(s) && <Check size={12} />}
                                </span>
                                {s}
                            </button>
                        ))}
                    </div>
                </div>

                <button onClick={handleDiagnose} disabled={loading || !name} className="w-full py-4 bg-gradient-to-r from-red-700 to-red-900 text-white rounded-2xl font-bold text-lg shadow-lg shadow-red-200 dark:shadow-none flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50 transition-all ur-text">
                    {loading ? <Loader2 className="animate-spin" size={20} /> : <Ghost size={20} />} حسابی و روحانی معائنہ کریں
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
        <div className="max-w-xl mx-auto pb-8">
            <BackButton onClick={onBack} />
            <div className="bg-white dark:bg-slate-900 rounded-[1rem] shadow-lg p-4 border border-blue-100 dark:border-slate-800">
                <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400 shadow-inner">
                        <FileText size={24} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-800 dark:text-white ur-text leading-tight">میڈیکل رپورٹ ریڈر</h2>
                        <p className="text-[10px] text-gray-500 dark:text-slate-400 ur-text">خون کے ٹیسٹ یا ایکس رے رپورٹ اپلوڈ کریں</p>
                    </div>
                </div>
                
                <div className="border-2 border-dashed border-gray-100 dark:border-slate-800 rounded-[0.75rem] p-3 text-center mb-3 hover:border-blue-300 hover:bg-blue-50/30 dark:hover:bg-slate-800/30 transition-all cursor-pointer group" onClick={() => fileInputRef.current?.click()}>
                    {image ? (
                        <div className="relative inline-block">
                            <img src={image} className="max-h-32 mx-auto rounded-lg shadow-md border-2 border-white dark:border-slate-800" alt="Report" />
                            <button onClick={(e) => { e.stopPropagation(); setImage(null); }} className="absolute -top-1.5 -right-1.5 bg-red-500 text-white p-1 rounded-full shadow-lg hover:bg-red-600 transition-colors">
                                <X size={12} />
                            </button>
                        </div>
                    ) : (
                        <div className="py-1">
                            <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/10 text-blue-300 rounded-full flex items-center justify-center mx-auto mb-1.5 group-hover:scale-110 group-hover:text-blue-500 transition-all shadow-inner">
                                <Upload size={20} />
                            </div>
                            <p className="text-xs font-bold text-gray-400 dark:text-slate-500 group-hover:text-blue-600 transition-colors ur-text">رپورٹ کی تصویر منتخب کریں</p>
                        </div>
                    )}
                    <input type="file" ref={fileInputRef} onChange={handleImageUpload} hidden accept="image/*" />
                </div>

                <button onClick={handleAnalyze} disabled={loading || !image} className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg font-bold text-base shadow-md flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50 transition-all ur-text">
                    {loading ? <Loader2 className="animate-spin" size={18} /> : <Search size={18} />} خلاصہ دیکھیں
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
        <div className="max-w-2xl mx-auto pb-8">
            <BackButton onClick={onBack} />
            <div className="bg-white dark:bg-slate-900 rounded-[1.5rem] shadow-lg p-6 border border-teal-100 dark:border-slate-800">
                <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-teal-100 dark:bg-teal-900/20 rounded-2xl text-teal-600 dark:text-teal-400 shadow-inner"><BookOpen size={32} /></div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white ur-text">وظائف و استخارہ</h2>
                        <p className="text-sm text-gray-500 dark:text-slate-400 ur-text">مشکلات کے حل کے لیے مستند وظائف اور رہنمائی</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 gap-3 mb-8">
                    {wazaif.map((w, i) => (
                        <div key={i} className="p-4 bg-gradient-to-l from-teal-50 to-white dark:from-slate-800 dark:to-slate-900 rounded-[1.25rem] border border-teal-100 dark:border-slate-800 shadow-sm flex items-center gap-4 text-right group hover:shadow-md transition-all">
                            <div className="p-3 bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-400 rounded-xl shadow-sm group-hover:scale-110 transition-transform"><w.icon size={24} /></div>
                            <div className="flex-grow">
                                <h3 className="font-black text-teal-900 dark:text-teal-300 text-lg mb-0.5 ur-text">{w.title}</h3>
                                <p className="text-teal-700 dark:text-slate-400 text-base leading-relaxed ur-text">{w.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="border-t-2 border-dashed border-teal-100 dark:border-slate-800 pt-8">
                    <GeneralAISection title="آن لائن استخارہ و رہنمائی" icon={Sparkles} colorClass="border-teal-600" promptContext="صارف اپنے کسی شرعی یا دنیاوی معاملے میں استخارہ اور رہنمائی چاہتا ہے۔ اسے سنت کے مطابق استخارہ کا طریقہ بتائیں اور اس کے مخصوص مسئلے پر دعا اور مشورہ دیں۔" onBack={null} hideBack />
                </div>
            </div>
        </div>
    );
};

export const DreamInterpretationSection = ({ onBack }: SectionProps) => (
    <div className="pb-8">
        <BackButton onClick={onBack} />
        <GeneralAISection title="خوابوں کی تعبیر" icon={Moon} colorClass="border-emerald-700" promptContext="آپ خوابوں کی تعبیر کے ماہر (معبر) ہیں۔ صارف اپنے خواب کی تفصیل بتائے گا، آپ کو قرآن و سنت اور مستند اسلامی کتب (مثلاً علامہ ابن سیرین) کی روشنی میں اس خواب کی تعبیر بتانی ہے۔ اگر خواب اچھا ہو تو بشارت دیں اور اگر برا ہو تو صدقہ و دعا کی تلقین کریں۔" onBack={null} hideBack />
    </div>
);

export const ContactSection = ({ onBack }: SectionProps) => {
    const waLinkYaasin = "https://wa.me/923009459059";
    const waLinkAshfaq = "https://wa.me/923394747597";
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(waLinkYaasin)}`;

    return (
        <div className="max-w-2xl mx-auto pb-8">
            <BackButton onClick={onBack} />
            <div className="bg-white dark:bg-slate-900 rounded-[1.5rem] shadow-lg p-6 border border-emerald-100 text-center">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner animate-bounce-slow">
                    <MessageSquare size={28} />
                </div>
                <h2 className="text-2xl font-black text-gray-800 mb-1 ur-text">رابطہ کی معلومات</h2>
                <p className="text-gray-500 text-base mb-8 ur-text">ہم سے براہِ راحت رابطہ کریں</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-right mb-8">
                    {/* WhatsApp Button Section */}
                    <div className="p-6 bg-emerald-50 rounded-[1.5rem] border-2 border-emerald-100 flex flex-col items-center justify-center gap-3 group hover:bg-emerald-100 transition-all shadow-sm">
                        <div className="p-3 bg-white text-emerald-600 rounded-xl shadow-sm mb-1 group-hover:scale-110 transition-transform">
                            <Smartphone size={32} />
                        </div>
                        <h3 className="text-lg font-black text-emerald-900 ur-text">وٹس ایپ میسج</h3>
                        <p className="text-[10px] text-emerald-700 font-bold mb-3 ur-text">براہ راست میسج بھیجنے کے لیے کلک کریں</p>
                        <a 
                            href={waLinkYaasin} 
                            target="_blank" 
                            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black shadow-lg transition-all flex items-center justify-center gap-2 ur-text text-lg"
                        >
                            واٹس ایپ چیٹ <ExternalLink size={18} />
                        </a>
                    </div>

                    {/* QR Code Section */}
                    <div className="p-6 bg-white rounded-[1.5rem] border-2 border-emerald-100 flex flex-col items-center justify-center gap-3 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-3 opacity-5 text-emerald-900">
                            <QrCode size={80} />
                        </div>
                        <h3 className="text-lg font-black text-emerald-900 ur-text relative z-10">سکین کریں (QR Code)</h3>
                        <div className="p-2 bg-white border-4 border-emerald-50 rounded-xl shadow-inner relative z-10">
                            <img 
                                src={qrCodeUrl} 
                                alt="WhatsApp QR Code" 
                                className="w-32 h-32 object-contain rounded-lg"
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = 'https://via.placeholder.com/200?text=QR+Code';
                                }}
                            />
                        </div>
                        <p className="text-[10px] text-emerald-600 font-bold mt-1 ur-text">موبائل کیمرے سے سکین کریں</p>
                    </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-[1.5rem] border border-gray-100 text-right">
                    <h3 className="font-black text-lg text-gray-800 mb-3 flex items-center justify-end gap-2 border-b pb-1.5 ur-text">ٹیم ممبران <Users size={18}/></h3>
                    <div className="space-y-3">
                        <a 
                          href={waLinkYaasin} 
                          target="_blank" 
                          className="flex justify-between items-center bg-white p-3 rounded-xl shadow-sm hover:bg-emerald-50 transition-colors group border border-transparent hover:border-emerald-200"
                        >
                            <span className="text-emerald-700 font-bold ur-text text-sm">کہروڑ پکا</span>
                            <span className="text-gray-800 font-black ur-text flex items-center gap-2 group-hover:text-emerald-800 transition-colors text-sm">
                                حکیم غلام یاسین آرائیں <MessageSquare size={16} className="text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </span>
                        </a>
                        <a 
                          href={waLinkAshfaq} 
                          target="_blank" 
                          className="flex justify-between items-center bg-white p-3 rounded-xl shadow-sm hover:bg-blue-50 transition-colors group border border-transparent hover:border-blue-200"
                        >
                            <span className="text-blue-700 font-bold ur-text text-sm">خانیوال</span>
                            <span className="text-gray-800 font-black ur-text flex items-center gap-2 group-hover:text-blue-800 transition-colors text-sm">
                                حاجی اشفاق احمد <MessageSquare size={16} className="text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
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
            'small': '0.8rem',
            'normal': '0.95rem',
            'large': '1.1rem'
        };
        document.documentElement.style.fontSize = sizeMap[fontSize] || '0.95rem';
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
        <div className="max-w-2xl mx-auto pb-8">
            <BackButton onClick={onBack} />
            <div className="bg-white dark:bg-slate-900 rounded-[1.5rem] shadow-lg p-6 md:p-8 border border-gray-100 dark:border-slate-800 transition-colors">
                <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-gray-100 dark:bg-slate-800 rounded-2xl text-gray-600 dark:text-slate-400 shadow-inner"><SettingsIcon size={32} /></div>
                    <div>
                        <h2 className="text-2xl font-black text-gray-800 dark:text-white ur-text">ترتیبات (Settings)</h2>
                        <p className="text-sm text-gray-500 dark:text-slate-400 ur-text">ایپلیکیشن کو اپنی ضرورت کے مطابق ترتیب دیں</p>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Dark Mode Toggle */}
                    <div className="p-4 bg-gray-50 dark:bg-slate-800/50 rounded-[1.5rem] flex items-center justify-between border border-transparent hover:border-emerald-100 dark:hover:border-slate-700 transition-all">
                        <div className="flex items-center gap-4">
                             <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm transition-colors ${isDark ? 'bg-slate-700 text-yellow-400' : 'bg-white text-emerald-600'}`}>
                                {isDark ? <Moon size={24}/> : <Sun size={24}/>}
                             </div>
                             <div>
                                <span className="font-black text-lg text-gray-800 dark:text-white ur-text">نائٹ موڈ (Dark Mode)</span>
                                <p className="text-xs text-gray-500 dark:text-slate-400 ur-text">آنکھوں کی حفاظت کے لیے ڈارک تھیم</p>
                             </div>
                        </div>
                        <button 
                            onClick={() => setIsDark(!isDark)}
                            className={`w-12 h-6 rounded-full relative transition-all shadow-inner border ${isDark ? 'bg-emerald-600 border-emerald-700' : 'bg-gray-300 border-gray-200'}`}
                        >
                            <div className={`absolute top-0.5 w-4.5 h-4.5 bg-white rounded-full shadow-md transition-all ${isDark ? 'right-6.5' : 'right-0.5'}`}></div>
                        </button>
                    </div>

                    {/* Font Size Selector */}
                    <div className="p-4 bg-gray-50 dark:bg-slate-800/50 rounded-[1.5rem] border border-transparent transition-all">
                        <div className="flex items-center gap-4 mb-4">
                             <div className="w-12 h-12 bg-white dark:bg-slate-700 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm"><Type size={24}/></div>
                             <div>
                                <span className="font-black text-lg text-gray-800 dark:text-white ur-text">تحریر کا سائز (Text Size)</span>
                                <p className="text-xs text-gray-500 dark:text-slate-400 ur-text">پڑھنے میں آسانی کے لیے فونٹ سائز تبدیل کریں</p>
                             </div>
                        </div>
                        <div className="flex gap-2 bg-white dark:bg-slate-900 p-1.5 rounded-xl border border-gray-100 dark:border-slate-800">
                            {['small', 'normal', 'large'].map((size) => (
                                <button 
                                    key={size}
                                    onClick={() => setFontSize(size)}
                                    className={`flex-1 py-2 rounded-lg font-bold transition-all ur-text text-sm ${fontSize === size ? 'bg-emerald-600 text-white shadow-md' : 'text-gray-500 dark:text-slate-400 hover:bg-emerald-50 dark:hover:bg-slate-800'}`}
                                >
                                    {size === 'small' ? 'چھوٹا' : size === 'normal' ? 'نارمل' : 'بڑا'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Clear Data */}
                    <div className="p-4 bg-red-50 dark:bg-red-900/10 rounded-[1.5rem] border border-red-100 dark:border-red-900/30 flex items-center justify-between group">
                        <div className="flex items-center gap-4">
                             <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center text-red-500 shadow-sm group-hover:rotate-12 transition-transform"><Trash2 size={24}/></div>
                             <div>
                                <span className="font-black text-lg text-red-700 dark:text-red-400 ur-text">ڈیٹا صاف کریں</span>
                                <p className="text-xs text-red-500/70 dark:text-red-400/60 ur-text">تمام محفوظ ترتیبات کو ختم کریں</p>
                             </div>
                        </div>
                        <button 
                            onClick={handleClearData}
                            disabled={isClearing}
                            className={`px-6 py-2 bg-red-600 text-white rounded-xl font-black shadow-md shadow-red-200 dark:shadow-none hover:bg-red-700 active:scale-95 transition-all ur-text text-sm ${isClearing ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {isClearing ? <Loader2 className="animate-spin" size={16}/> : 'ڈیلیٹ کریں'}
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
    const [birthTime, setBirthTime] = useState('');
    const [birthDay, setBirthDay] = useState('');
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
پیدائش کا وقت: ${birthTime || 'نامعلوم'}
پیدائش کا دن: ${birthDay || 'نامعلوم'}
سوال کرنے کا دن: ${dayOfQuestion}
سوال: ${question || 'صارف اس وقت کی سعد یا نحس ساعت اور موزوں کاموں کے بارے میں جاننا چاہتا ہے۔'}

ان معلومات کی روشنی میں بتائیں کہ اس وقت کون سی 'ساعت' چل رہی ہے اور کسی بھی نئے کام یا مقصد کے لیے یہ وقت کیسا ہے۔ تفصیل اردو میں فراہم کریں۔`;
        
        const res = await generateSpiritualResponse(prompt);
        setResult(res);
        setLoading(false);
    };

    return (
        <div className="max-w-xl mx-auto pb-8">
            <BackButton onClick={onBack} />
            <div className="bg-white dark:bg-slate-900 rounded-[1rem] shadow-lg p-5 border border-purple-100 dark:border-slate-800">
                <div className="flex items-center gap-3 mb-5">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-xl text-purple-600 dark:text-purple-400 shadow-inner"><Watch size={24} /></div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 dark:text-white ur-text leading-tight">علم الساعات</h2>
                        <p className="text-[10px] text-gray-500 dark:text-slate-400 ur-text">وقت کی تاثیر اور سعد و نحس ساعتوں کا علمی تجزیہ</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5 text-right">
                    <div className="group">
                        <label className="block text-right mb-1 font-bold text-gray-700 dark:text-slate-300 mr-2 ur-text text-xs">آپ کا نام (اردو میں)</label>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full h-10 px-4 rounded-lg border-2 border-gray-100 dark:border-slate-800 focus:border-purple-500 outline-none text-right text-base transition-all dark:bg-slate-950 dark:text-white" placeholder="محمد احمد" />
                    </div>
                    <div className="group">
                        <label className="block text-right mb-1 font-bold text-gray-700 dark:text-slate-300 mr-2 ur-text text-xs">والدہ کا نام (اردو میں)</label>
                        <input type="text" value={motherName} onChange={(e) => setMotherName(e.target.value)} className="w-full h-10 px-4 rounded-lg border-2 border-gray-100 dark:border-slate-800 focus:border-purple-500 outline-none text-right text-base transition-all dark:bg-slate-950 dark:text-white" placeholder="مریم بی بی" />
                    </div>
                    <div className="group md:col-span-2">
                        <label className="block text-right mb-1 font-bold text-gray-700 dark:text-slate-300 mr-2 ur-text text-xs">کل عمر سالوں میں یا تاریخ پیدائش</label>
                        <input type="text" value={dobOrAge} onChange={(e) => setDobOrAge(e.target.value)} className="w-full h-10 px-4 rounded-lg border-2 border-gray-100 dark:border-slate-800 focus:border-purple-500 outline-none text-right text-base transition-all dark:bg-slate-950 dark:text-white" placeholder="مثلاً: 30 سال یا 1995" />
                    </div>
                    <div className="group">
                        <label className="block text-right mb-1 font-bold text-gray-700 dark:text-slate-300 mr-2 ur-text text-xs">وقت پیدائش (اختیاری)</label>
                        <input type="text" value={birthTime} onChange={(e) => setBirthTime(e.target.value)} className="w-full h-10 px-4 rounded-lg border-2 border-gray-100 dark:border-slate-800 focus:border-purple-500 outline-none text-right text-base transition-all dark:bg-slate-950 dark:text-white" placeholder="مثلاً: صبح 8 بجے" />
                    </div>
                    <div className="group">
                        <label className="block text-right mb-1 font-bold text-gray-700 dark:text-slate-300 mr-2 ur-text text-xs">پیدائش کا دن (اختیاری)</label>
                        <select value={birthDay} onChange={(e) => setBirthDay(e.target.value)} className="w-full h-10 px-4 rounded-lg border-2 border-gray-100 dark:border-slate-800 focus:border-purple-500 outline-none text-right text-base transition-all dark:bg-slate-950 dark:text-white ur-text">
                            <option value="">منتخب کریں</option>
                            {urduDays.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>
                    <div className="group md:col-span-2">
                        <label className="block text-right mb-1 font-bold text-gray-700 dark:text-slate-300 mr-2 ur-text text-xs">سوال کرنے کا دن</label>
                        <select value={dayOfQuestion} onChange={(e) => setDayOfQuestion(e.target.value)} className="w-full h-10 px-4 rounded-lg border-2 border-gray-100 dark:border-slate-800 focus:border-purple-500 outline-none text-right text-base transition-all dark:bg-slate-950 dark:text-white ur-text">
                            {urduDays.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>
                </div>

                <button onClick={handleCalculateTime} disabled={loading || !name} className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-700 text-white rounded-xl font-bold text-base shadow-md active:scale-95 transition-all ur-text flex items-center justify-center gap-2">
                    {loading ? <Loader2 className="animate-spin" size={18} /> : <SearchCheck size={18} />} ساعت معلوم کریں
                </button>

                <GenericResult loading={loading} result={result} title="علم الساعات کی روشنی میں وقت کا تجزیہ" />
            </div>
        </div>
    );
};


export const HoroscopeSection = ({ onBack }: SectionProps) => {
    const [name, setName] = useState('');
    const [motherName, setMotherName] = useState('');
    const [dobOrAge, setDobOrAge] = useState('');
    const [birthDay, setBirthDay] = useState('');
    const [birthTime, setBirthTime] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<string | null>(null);

    const days = ['پیر', 'منگل', 'بدھ', 'جمعرات', 'جمعہ', 'ہفتہ', 'اتوار'];

    const handleGenerateHoroscope = async () => {
        if (!name.trim()) return;
        setLoading(true);
        const prompt = `آپ ایک تجربہ کار نجومی (Astrologer) ہیں۔ درج ذیل معلومات کی روشنی میں صارف کا مکمل زائچہ تیار کریں:
نام: ${name}
والدہ کا نام: ${motherName || 'نامعلوم'}
تاریخ پیدائش یا عمر: ${dobOrAge || 'نامعلوم'}
پیدائش کا دن: ${birthDay || 'نامعلوم'}
پیدائش کا وقت: ${birthTime || 'نامعلوم'}
ان معلومات کی روشنی میں شخصیت, برج (Zodiac Sign), ستارہ, مستقبل, صحت, محبت اور کاروبار کے بارے میں تفصیلی پیشگوئی اردو میں فراہم کریں۔`;
        
        const res = await generateSpiritualResponse(prompt);
        setResult(res);
        setLoading(false);
    };

    return (
        <div className="max-w-xl mx-auto pb-8">
            <BackButton onClick={onBack} />
            <div className="bg-white dark:bg-slate-900 rounded-[1rem] shadow-lg p-5 border border-orange-100 dark:border-slate-800">
                <div className="flex items-center gap-3 mb-5">
                    <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-xl text-orange-600 dark:text-orange-400 shadow-inner"><Star size={24} /></div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 dark:text-white ur-text leading-tight">زائچہ و نجوم</h2>
                        <p className="text-[10px] text-gray-500 dark:text-slate-400 ur-text">پیدائشی تفصیلات درج کریں (دن اور وقت اختیاری ہیں)</p>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-right">
                    <div className="group">
                        <label className="block mb-1 font-bold text-gray-700 dark:text-slate-300 mr-2 ur-text text-xs">آپ کا نام (اردو میں)</label>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full h-10 px-4 rounded-lg border-2 border-gray-100 dark:border-slate-800 focus:border-orange-500 outline-none text-right text-base transition-all dark:bg-slate-950 dark:text-white" placeholder="محمد احمد" />
                    </div>
                    <div className="group">
                        <label className="block mb-1 font-bold text-gray-700 dark:text-slate-300 mr-2 ur-text text-xs">والدہ کا نام (اردو میں)</label>
                        <input type="text" value={motherName} onChange={(e) => setMotherName(e.target.value)} className="w-full h-10 px-4 rounded-lg border-2 border-gray-100 dark:border-slate-800 focus:border-orange-500 outline-none text-right text-base transition-all dark:bg-slate-950 dark:text-white" placeholder="مریم بی بی" />
                    </div>
                    <div className="group md:col-span-2">
                        <label className="block mb-1 font-bold text-gray-700 dark:text-slate-300 mr-2 ur-text text-xs">تاریخ پیدائش یا کل عمر سالوں میں</label>
                        <input type="text" value={dobOrAge} onChange={(e) => setDobOrAge(e.target.value)} className="w-full h-10 px-4 rounded-lg border-2 border-gray-100 dark:border-slate-800 focus:border-orange-500 outline-none text-right text-base transition-all dark:bg-slate-950 dark:text-white" placeholder="مثلاً: 1990 یا 34 سال" />
                    </div>
                    <div className="group">
                        <label className="block mb-1 font-bold text-gray-700 dark:text-slate-300 mr-2 ur-text text-xs">پیدائش کا دن (اختیاری)</label>
                        <select value={birthDay} onChange={(e) => setBirthDay(e.target.value)} className="w-full h-10 px-4 rounded-lg border-2 border-gray-100 dark:border-slate-800 focus:border-orange-500 outline-none text-right text-base transition-all dark:bg-slate-950 dark:text-white ur-text">
                            <option value="">منتخب کریں</option>
                            {days.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>
                    <div className="group">
                        <label className="block mb-1 font-bold text-gray-700 dark:text-slate-300 mr-2 ur-text text-xs">پیدائش کا وقت (اختیاری)</label>
                        <input type="text" value={birthTime} onChange={(e) => setBirthTime(e.target.value)} className="w-full h-10 px-4 rounded-lg border-2 border-gray-100 dark:border-slate-800 focus:border-orange-500 outline-none text-right text-base transition-all dark:bg-slate-950 dark:text-white" placeholder="مثلاً: صبح 10 بجے" />
                    </div>
                </div>

                <button onClick={handleGenerateHoroscope} disabled={loading || !name} className="w-full py-2.5 mt-5 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl font-bold text-base shadow-md active:scale-95 transition-all ur-text flex items-center justify-center gap-2">
                    {loading ? <Loader2 className="animate-spin" size={18} /> : <Sparkle size={18} />} زائچہ تیار کریں
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
