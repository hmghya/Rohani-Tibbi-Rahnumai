import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-emerald-900 text-emerald-100 py-2 mt-auto border-t border-emerald-800">
      <div className="container mx-auto px-4 text-center">
        <div className="flex flex-col sm:flex-row justify-center items-center gap-1 sm:gap-3 text-xs mb-1 opacity-90">
            <p className="font-semibold">ڈویلپر : حکیم غلام یاسین آرائیں (کہروڑ پکا)</p>
            <span className="hidden sm:block text-emerald-600">•</span>
            <p className="font-semibold">ماہر عملیات: حاجی اشفاق احمد (خانیوال)</p>
        </div>
        
        <div className="pt-1 mt-1 border-t border-emerald-800/30">
           <p className="text-[10px] opacity-70">
             جملہ حقوق بحق ایپس ٹاک ایس ایم سی پرائیویٹ لمیٹڈ محفوظ ہیں ©
           </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;