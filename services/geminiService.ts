
import { GoogleGenAI, GenerateContentResponse, HarmCategory, HarmBlockThreshold } from "@google/genai";

// Initialize Gemini API client using the environment variable.
const getAiClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

const SYSTEM_INSTRUCTION = `
آپ ایک ماہر روحانی معالج، ماہر علم الاعداد (Numerologist)، ماہر نجوم، اور ماہر طبیب (حکیم/ڈاکٹر) ہیں۔
آپ کا نام "طبی و روحانی معالج" ہے۔
آپ کا لہجہ انتہائی مہذب، ہمدردانہ اور اسلامی اقدار کے مطابق ہونا چاہیے۔
جوابات مکمل طور پر اردو زبان میں اور نوری نستعلیق (یا معیاری اردو) کے انداز میں لکھیں۔
جوابات کو صاف ستھرا Markdown فارمیٹ میں لکھیں:
- اہم ہیڈنگز کے لیے # یا ## کا استعمال کریں۔
- فہرستوں کے لیے - یا 1. کا استعمال کریں۔
- اہم الفاظ کو **بولڈ** کریں۔
- جواب کو پیراگراف میں تقسیم کریں تاکہ پڑھنے میں آسانی ہو۔
- ٹیبلز (Tables) کا استعمال کریں جہاں ڈیٹا کو منظم دکھانا ہو۔

طبی مشورے کے لیے:
ہمیشہ یہ نوٹ لکھیں: "یہ معلومات صرف عارضی ہیں ۔ سنجیدہ صورت حال میں اپنے معالج سے رابطہ کریں"
`;

const getFriendlyErrorMessage = (error: any): string => {
    return "سرور میں فنی خرابی ہے (Technical Error)۔ براہ کرم کچھ دیر بعد کوشش کریں۔";
};

const SAFETY_SETTINGS = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
];

export const generateSpiritualResponse = async (prompt: string): Promise<string> => {
  try {
    const ai = getAiClient();
    // Using gemini-3-pro-preview for complex reasoning tasks as per guidelines.
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
        safetySettings: SAFETY_SETTINGS
      }
    });
    // Access response.text property directly as per latest guidelines.
    return response.text || "معذرت، کوئی جواب موصول نہیں ہوا۔";
  } catch (error: any) {
    return getFriendlyErrorMessage(error);
  }
};

export const analyzeImageWithText = async (prompt: string, base64Image: string): Promise<string> => {
  try {
    const ai = getAiClient();
    let mimeType = 'image/jpeg';
    let data = base64Image;
    const match = base64Image.match(/^data:(.+);base64,(.+)$/);
    if (match) {
      mimeType = match[1];
      data = match[2];
    }
    // Using gemini-3-flash-preview for multi-modal analysis tasks.
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [{ text: prompt }, { inlineData: { mimeType, data } }]
      },
      config: { 
          systemInstruction: SYSTEM_INSTRUCTION,
          safetySettings: SAFETY_SETTINGS
      }
    });
    return response.text || "تصویر کا تجزیہ کرنے میں ناکامی ہوئی۔";
  } catch (error: any) {
    return getFriendlyErrorMessage(error);
  }
};

export const getNumerologyAnalysis = async (data: any, topic: string = 'general', extraInput: string = ''): Promise<string> => {
  const val = (v: string) => v && v.trim() !== '' ? v : null;
  const baseInfo = `نام: ${data.name}\n${val(data.fatherName) ? `والد کا نام: ${data.fatherName}` : ''}\n${val(data.motherName) ? `والدہ کا نام: ${data.motherName}` : ''}\n${val(data.dob) ? `تاریخ پیدائش: ${data.dob}` : ''}`;
  let specificPrompt = `موضوع: ${topic}`;
  const prompt = `بطور ماہر علم الاعداد، تجزیہ کریں: ${baseInfo}\n${specificPrompt}`;
  return generateSpiritualResponse(prompt);
};

export const getHoroscopeAnalysis = async (data: any, type: 'chart' | 'match' | 'istikhara' | 'modern', extraData?: any): Promise<string> => {
    const prompt = `نجومی تجزیہ برائے: ${data.name}, نوعیت: ${type}`;
    return generateSpiritualResponse(prompt);
};

export const getBlackMagicDiagnosis = async (data: any, type: 'diagnosis' | 'history' | 'protection', query?: string): Promise<string> => {
    const prompt = `روحانی تشخیص: ${data.name}, نوعیت: ${type}`;
    return generateSpiritualResponse(prompt);
};

export const getInitialDiagnosis = async (symptoms: string, image?: string): Promise<string> => {
  const prompt = `طبی تشخیص برائے علامات: ${symptoms}`;
  if (image) return analyzeImageWithText(prompt, image);
  return generateSpiritualResponse(prompt);
};

export const getMedicalDiagnosis = async (symptoms: string, treatmentType: string, image?: string): Promise<string> => {
  const prompt = `علاج برائے: ${symptoms}, طریقہ: ${treatmentType}`;
  if (image) return analyzeImageWithText(prompt, image);
  return generateSpiritualResponse(prompt);
};

export const analyzeMedicine = async (image: string): Promise<string> => {
  const prompt = `اس دوائی کی شناخت کریں اور تفصیل بتائیں۔`;
  return analyzeImageWithText(prompt, image);
};

export const scanDocument = async (image: string): Promise<string> => {
  const prompt = `اس دستاویز کا خلاصہ اردو میں کریں۔`;
  return analyzeImageWithText(prompt, image);
};
