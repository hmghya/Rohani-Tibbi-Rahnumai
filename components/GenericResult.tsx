
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
            backgroundColor: '#fffdf5', // Match paper color
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

        pdf.save(`${title ? title.replace(/\s+/g, '_') : 'Result'}.pdf`);
    } catch (error) {
        console.error("PDF Generation Error:", error);
        alert("پی ڈی ایف بنانے میں مسئلہ پیش آیا۔ براہ کرم دوبارہ کوشش کریں۔");
    } finally {
        setIsGeneratingPdf(false);
    }
  };

  if (loading) {
    return (
      <div className="mt-12 p-12 glass-panel rounded-[2rem] shadow-xl text-center animate-pulse relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-[shimmer_1.5s_infinite]"></div>
        <div className="w-20 h-20 border-4 border-emerald-500 border-t-emerald-200 rounded-full animate-spin mx-auto mb-8 shadow-lg shadow-emerald-100"></div>
        <h4 className="text-emerald-900 font-bold text-2xl mb-3">برائے مہربانی انتظار کریں...</h4>
        <p className="text-emerald-600 text-lg">موئکلات/سسٹم آپ کے مسئلے کا گہرا تجزیہ کر رہے ہیں</p>
      </div>
    );
  }

  if (!result) return null;

  return (
    <div className="mt-12 animate-fade-in-up px-1">
        {/* Print/PDF Action Buttons */}
        <div className="flex justify-end gap-3 mb-3 no-print">
            <button 
                type="button"
                onClick={handleSavePDF}
                disabled={isGeneratingPdf}
                className={`flex items-center gap-2 bg-emerald-100 text-emerald-800 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-emerald-200 transition-colors shadow-sm active:scale-95 border border-emerald-200 ${isGeneratingPdf ? 'opacity-70 cursor-wait' : ''}`}
                title="Download PDF"
            >
                {isGeneratingPdf ? <Loader2 size={18} className="animate-spin"/> : <FileDown size={18} />}
                {isGeneratingPdf ? 'بنایا جا رہا ہے...' : 'سیو پی ڈی ایف (PDF)'}
            </button>
            <button 
                type="button"
                onClick={handlePrint}
                className="flex items-center gap-2 bg-gray-100 text-gray-800 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-200 transition-colors shadow-sm active:scale-95 border border-gray-200"
                title="Print Result"
            >
                <Printer size={18} />
                پرنٹ (Print)
            </button>
        </div>

        <div ref={contentRef} className="bg-[#fffdf5] rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] overflow-hidden relative border border-stone-200">
            
            {/* Decorative Header - Letterhead Style */}
            <div className="bg-emerald-900 text-white p-8 text-center relative overflow-hidden">
                 <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/arches.png')" }}></div>
                 <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 via-yellow-200 to-yellow-400"></div>
                 
                 <div className="relative z-10">
                     <div className="w-16 h-1 bg-yellow-400/50 mx-auto mb-4 rounded-full"></div>
                     {title && <h3 className="text-xl md:text-2xl font-bold text-yellow-50 drop-shadow-md leading-relaxed">{title}</h3>}
                     <div className="w-24 h-1 bg-yellow-400/50 mx-auto mt-4 rounded-full"></div>
                 </div>
            </div>

            {/* Paper Texture & Content */}
            <div className="p-6 md:p-10 text-gray-800 text-base leading-[2.2] relative">
                {/* Subtle Watermark */}
                <div className="absolute inset-0 pointer-events-none opacity-[0.03] flex items-center justify-center overflow-hidden">
                    <svg width="400" height="400" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 8.5l-2.5 1.25L12 11zm0 2.5l-5-2.5-5 2.5L12 22l10-8.5-5-2.5-5 2.5z"/></svg>
                </div>

                <div className="prose prose-emerald prose-lg prose-h1:!text-2xl prose-h2:!text-xl prose-h3:!text-lg prose-h4:!text-base prose-headings:!leading-relaxed max-w-none ur-text relative z-10 text-justify">
                    <Markdown>{result}</Markdown>
                </div>
            </div>

            {/* Footer Stamp */}
            <div className="bg-stone-50 p-6 text-center border-t-2 border-emerald-900/10 border-dashed relative">
                <div className="flex flex-col items-center justify-center gap-2 opacity-80">
                    {/* Updated Stamp Style */}
                    <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center text-white mb-2 shadow-md">
                        <span className="text-sm font-bold">تصدیق شدہ</span>
                    </div>
                    <p className="text-sm text-emerald-900 font-bold italic">
                        "واللہ اعلم بالصواب"
                    </p>
                    <p className="text-xs text-gray-500">
                        (اللہ ہی بہتر جاننے والا ہے)
                    </p>
                </div>
            </div>
        </div>
    </div>
  );
};

export default GenericResult;
