import React from 'react';
import { ShieldCheck, AlertTriangle } from 'lucide-react';

interface PrivacyModalProps {
  onAccept: () => void;
  onReject: () => void;
}

const PrivacyModal: React.FC<PrivacyModalProps> = ({ onAccept, onReject }) => {
  return (
    <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl border-4 border-emerald-600">
        <div className="flex justify-center mb-4 text-emerald-600">
            <ShieldCheck className="w-16 h-16" />
        </div>
        
        <h2 className="text-2xl font-bold text-center text-emerald-900 mb-6 border-b pb-4">
          خوش آمدید
        </h2>

        <div className="space-y-4 text-gray-700 text-justify h-60 overflow-y-auto pr-2 mb-6 bg-gray-50 p-4 rounded-lg border ur-text">
          <h3 className="font-bold text-lg text-emerald-700 mb-2">ضروری شرائط و ضوابط</h3>
          
          <p>1. <strong>طبی انتباہ:</strong> یہ ایپ اور اس میں موجود تشخیص صرف جدید ٹیکنالوجی اور علامات پر مبنی معلوماتی نتائج ہیں۔ اسے ہرگز ڈاکٹر یا مستند معالج کا متبادل نہ سمجھیں۔ سنجیدہ بیماری کی صورت میں فوری ہسپتال سے رجوع کریں۔</p>
          
          <p>2. <strong>روحانی و نجومی حیثیت:</strong> علم الاعداد، نجوم اور زائچہ جات کا تعلق قیاس اور تخمینے سے ہے۔ غیب کا علم صرف اللہ رب العزت کی ذات کے پاس ہے۔ ان نتائج کو حرفِ آخر نہ سمجھیں اور نہ ہی ان کی بنیاد پر عقیدہ بنائیں۔</p>
          
          <p>3. <strong>ٹیکنالوجی کی حدود:</strong> ایپ کے جوابات جدید ٹیکنالوجی اور حکیم غلام یاسین کی دن رات کی محنت کے ذریعے تیار کیے جاتے ہیں۔ اس میں غلطی کا امکان موجود ہو سکتا ہے۔</p>
          
          <p>4. <strong>ذاتی فیصلے:</strong> اس ایپ کی بنیاد پر کیے گئے کسی بھی مالی، کاروباری، شادی بیاہ یا ذاتی فیصلے کے نفع و نقصان کے ذمہ دار صارف خود ہوں گے۔ ایپ انتظامیہ کسی نقصان کی ذمہ دار نہیں ہوگی۔</p>
          
          <p>5. <strong>ڈیٹا پرائیویسی:</strong> ہم آپ کی پرائیویسی کا احترام کرتے ہیں۔ آپ کا نام، تصاویر یا ذاتی ڈیٹا ہمارے سرور پر محفوظ (Store) نہیں کیا جاتا اور ایپ بند کرنے پر ضائع ہو جاتا ہے۔</p>
          
          <p>6. <strong>کاپی رائٹ:</strong> اس ایپ کا تمام مواد اور کوڈ Apps Talk SMC Pvt Ltd کی ملکیت ہے۔</p>
        </div>

        <div className="flex gap-3 flex-col sm:flex-row">
          <button 
            onClick={onReject}
            className="flex-1 px-6 py-3 rounded-xl border-2 border-red-500 text-red-600 font-bold hover:bg-red-50 transition"
          >
            مسترد کریں (بند)
          </button>
          <button 
            onClick={onAccept}
            className="flex-1 px-6 py-3 rounded-xl bg-emerald-600 text-white font-bold shadow-lg hover:bg-emerald-700 transition flex items-center justify-center gap-2"
          >
            قبول کریں <ShieldCheck className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrivacyModal;