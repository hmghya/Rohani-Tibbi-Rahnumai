
import React, { useState, useRef } from 'react';
import Markdown from 'react-markdown';
import { Printer, FileDown, Loader2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface GenericResultProps {
  loading: boolean;
  result: string | null;
  title?: string;
}

const GenericResult: React.FC<GenericResultProps> = ({ loading, result, title }) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const handlePrint = () => {
    if (contentRef.current) {
        // Add class to make this specific element visible in print
        contentRef.current.classList.add('print-me');
        
        // Small timeout ensures UI updates before print dialog freezes execution
        setTimeout(() => {
            window.print();
            // Cleanup after print dialog closes (or immediately if blocking)
            if (contentRef.current) {
                contentRef.current.classList.remove('print-me');
            }
        }, 100);
    }
  };

  const handleSavePDF = async () => {
    if (!contentRef.current) return;

    setIsGeneratingPdf(true);

    try {
        // Capture the DOM element as a canvas
        const canvas = await html2canvas(contentRef.current, {
            scale: 2, // Higher scale for better resolution
            useCORS: true, // Handle cross-origin images if any
            backgroundColor: '#0f172a', // Match slate-900 color for PDF
            logging: false,
        });

        const imgData = canvas.toDataURL('image/png');
        
        // A4 dimensions in mm
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        
        const imgWidth = pdfWidth;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        let heightLeft = imgHeight;
        let position = 0;

        // Add first page
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;

        // If content is longer than one page, add more pages
        while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pdfHeight;
        }

        // --- Filename Enhancement ---
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
        const timeStr = now.getHours().toString().padStart(2, '0') + now.getMinutes().toString().padStart(2, '0');
        
        // Sanitize the title: Keep alphanumeric characters and Urdu range, replace spaces with underscores
        const sanitizedTitle = title 
            ? title.trim().replace(/[^\w\s\u0600-\u06FF]/g, '').replace(/\s+/g, '_') 
            : 'Rohani_Result';

        const fileName = `${sanitizedTitle}_${dateStr}_${timeStr}.pdf`;
        pdf.save(fileName);
    } catch (error) {
        console.error("PDF Generation Error:", error);
        alert("پی ڈی ایف بنانے میں مسئلہ پیش آیا۔ براہ کرم دوبارہ کوشش کریں۔");
    } finally {
        setIsGeneratingPdf(false);
    }
  };

  if (loading) {
    return (
      <div className="mt-8 p-8 glass-panel rounded-[1.5rem] shadow-lg text-center animate-pulse relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-[shimmer_1.5s_infinite]"></div>
        <div className="w-16 h-16 border-4 border-emerald-500 border-t-emerald-200 rounded-full animate-spin mx-auto mb-6 shadow-md shadow-emerald-100"></div>
        <h4 className="text-emerald-900 font-bold text-xl mb-2">برائے مہربانی انتظار کریں...</h4>
        <p className="text-emerald-600 text-base">موئکلات/سسٹم آپ کے مسئلے کا گہرا تجزیہ کر رہے ہیں</p>
      </div>
    );
  }

  if (!result) return null;

  return (
    <div className="mt-8 animate-fade-in-up px-1">
        {/* Print/PDF Action Buttons */}
        <div className="flex justify-end gap-2 mb-2 no-print">
            <button 
                type="button"
                onClick={handleSavePDF}
                disabled={isGeneratingPdf}
                className={`flex items-center gap-2 bg-emerald-100 text-emerald-800 px-4 py-2 rounded-lg text-xs font-bold hover:bg-emerald-200 transition-colors shadow-sm active:scale-95 border border-emerald-200 ${isGeneratingPdf ? 'opacity-70 cursor-wait' : ''}`}
                title="Download PDF"
            >
                {isGeneratingPdf ? <Loader2 size={16} className="animate-spin"/> : <FileDown size={16} />}
                {isGeneratingPdf ? 'بنایا جا رہا ہے...' : 'سیو پی ڈی ایف (PDF)'}
            </button>
            <button 
                type="button"
                onClick={handlePrint}
                className="flex items-center gap-2 bg-gray-100 text-gray-800 px-4 py-2 rounded-lg text-xs font-bold hover:bg-gray-200 transition-colors shadow-sm active:scale-95 border border-gray-200"
                title="Print Result"
            >
                <Printer size={16} />
                پرنٹ (Print)
            </button>
        </div>

        <div ref={contentRef} className="bg-slate-900 rounded-[1.5rem] shadow-[0_15px_40px_-10px_rgba(0,0,0,0.3)] overflow-hidden relative border border-slate-800">
            
            {/* Decorative Header - Letterhead Style */}
            <div className="bg-emerald-900 text-white p-6 text-center relative overflow-hidden">
                 <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/arches.png')" }}></div>
                 <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 via-yellow-200 to-yellow-400"></div>
                 
                 <div className="relative z-10">
                     <div className="w-12 h-0.5 bg-yellow-400/50 mx-auto mb-3 rounded-full"></div>
                     {title && <h3 className="text-lg md:text-xl font-bold text-yellow-50 drop-shadow-md leading-relaxed">{title}</h3>}
                     <div className="w-16 h-0.5 bg-yellow-400/50 mx-auto mt-3 rounded-full"></div>
                 </div>
            </div>

            {/* Paper Texture & Content - Updated to Dark Background and White Text */}
            <div className="p-5 md:p-8 text-white text-sm leading-[2.0] relative">
                {/* Subtle Watermark */}
                <div className="absolute inset-0 pointer-events-none opacity-[0.05] flex items-center justify-center overflow-hidden">
                    <svg width="300" height="300" viewBox="0 0 24 24" fill="white"><path d="M12 2L2 7l10 5 10-5-10-5-10-5zm0 9l2.5-1.25L12 8.5l-2.5 1.25L12 11zm0 2.5l-5-2.5-5 2.5L12 22l10-8.5-5-2.5-5 2.5z"/></svg>
                </div>

                <div className="prose prose-invert prose-emerald prose-sm prose-h1:!text-xl prose-h2:!text-lg prose-h3:!text-base prose-h4:!text-sm prose-headings:!leading-relaxed max-w-none ur-text relative z-10 text-justify">
                    <Markdown>{result}</Markdown>
                </div>
            </div>

            {/* Footer Stamp - Updated for Dark Theme */}
            <div className="bg-slate-800/50 p-4 text-center border-t-2 border-white/5 border-dashed relative">
                <div className="flex flex-col items-center justify-center gap-1.5 opacity-90">
                    {/* Updated Stamp Style */}
                    <div className="w-12 h-12 bg-emerald-600 rounded-full flex items-center justify-center text-white mb-1.5 shadow-lg border-2 border-emerald-400/30">
                        <span className="text-xs font-bold">تصدیق شدہ</span>
                    </div>
                    <p className="text-xs text-emerald-400 font-bold italic">
                        "واللہ اعلم بالصواب"
                    </p>
                    <p className="text-[10px] text-slate-400">
                        (اللہ ہی بہتر جاننے والا ہے)
                    </p>
                </div>
            </div>
        </div>
    </div>
  );
};

export default GenericResult;
