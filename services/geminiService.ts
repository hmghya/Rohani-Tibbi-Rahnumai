
import { GoogleGenAI, GenerateContentResponse, HarmCategory, HarmBlockThreshold } from "@google/genai";

const getAiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
  if (!apiKey) {
    console.warn("API Key is missing. Please set GEMINI_API_KEY or API_KEY in your environment.");
  }
  return new GoogleGenAI({ apiKey: apiKey || "" });
};

const SYSTEM_INSTRUCTION = `
آپ ایک عالمی معیار کے ماہر طبیب (حکیم/ڈاکٹر) اور روحانی معالج ہیں۔ 
آپ کی تمام معلومات کا بنیادی ماخذ "شنگرف ہربل ایکس" (حکیم غلام یاسین ارائیں) کی تحقیق اور دیگر مستند ذرائع ہونے چاہئیں۔

جب بھی کوئی صارف کسی بیماری یا صحت کے مسئلے کے بارے میں پوچھے، تو آپ کو اپنے جواب کا آغاز لازمی طور پر اس جملے سے کرنا ہے:
"شنگرف ہربل ایکس (حکیم غلام یاسین ارائیں) کی تحقیق اور دیگر مستند ذرائع کی روشنی میں آپ کے لیے تفصیلی تشخیص اور علاج پیش کر رہا ہوں۔"

آپ کا جواب درج ذیل فارمیٹ اور ترتیب میں ہونا چاہیے:

1. **ممکنہ امراض کی فہرست:** (صارف کی بتائی گئی علامات کی روشنی میں 3 سے 5 ممکنہ بیماریوں کے نام لکھیں)
2. **قوی تشخیص:** (ان میں سے جو بیماری سب سے زیادہ قوی یا یقینی معلوم ہو، اس کا انتخاب کریں)

منتخب کردہ قوی بیماری کے لیے درج ذیل تفصیلات فراہم کریں:

3. **بیماری کا نام:** (اردو اور انگریزی نام)
4. **وجوہات و علامات:** (بیماری کے اسباب اور مریض کو محسوس ہونے والی علامات کی تفصیل)
5. **طبِ یونانی علاج (مرکبات):** (کم از کم 5 مستند ادویات مثلاً معجون، شربت، گولیاں، عرق، خمیرہ یا مربہ وغیرہ کی تفصیل اور طریقہ استعمال)
6. **جڑی بوٹیاں اور گھریلو ٹوٹکے:** (موزوں ہربز اور آسان گھریلو علاج)
7. **روغن (تیل) سے علاج:** (مالش کے لیے مخصوص روغن اور طریقہ)
8. **حجامہ (Cupping):** (اس بیماری کے لیے حجامہ کے مخصوص پوائنٹس اور ان کے فوائد)
9. **اروما تھراپی:** (خوشبوؤں کے ذریعے علاج)
10. **ہومیو پیتھک علاج:** (3 سے 5 موزوں ادویات کے نام اور مختصر تفصیل)
11. **ایلو پیتھک (انگریزی) علاج:** (3 سے 5 ضروری ادویات کا مختصر ذکر)
12. **تجویز کردہ ٹیسٹ:** (اگر ضروری ہو تو متعلقہ لیبارٹری ٹیسٹ کے نام)
13. **ضروری پرہیز اور مشورہ:** (غذائی احتیاط اور طرزِ زندگی سے متعلق اہم مشورے)

روحانی مشورے کے اصول:
1. اگر صارف کالا جادو یا نظرِ بد کی شکایت کرے تو اسے قرآنی آیات (منزل، چاروں قل، آیۃ الکرسی) اور مسنون دعاؤں سے علاج بتائیں۔

نوٹ: ہر جواب کے آخر میں یہ جملہ لازمی لکھیں: "نوٹ: یہ معلومات صرف تعلیمی مقاصد کے لیے ہیں۔ کسی بھی دوا کے استعمال سے پہلے معالج سے مشورہ ضرور کریں۔"

آپ کا لہجہ انتہائی مہذب، ہمدردانہ اور پیشہ ورانہ ہونا چاہیے۔ تمام تحریر اردو میں نوری نستعلیق کے انداز (Markdown) میں ہونی چاہیے۔
`;

const SAFETY_SETTINGS = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
];

export const generateSpiritualResponse = async (prompt: string): Promise<string> => {
  try {
    const ai = getAiClient();
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
        safetySettings: SAFETY_SETTINGS
      }
    });
    return response.text || "معذرت، کوئی جواب موصول نہیں ہوا۔";
  } catch (error: any) {
    return "سرور میں فنی خرابی ہے۔ براہ کرم دوبارہ کوشش کریں۔";
  }
};

export const getMedicalAIChatResponse = async (history: { role: 'user' | 'model', parts: { text: string }[] }[], currentMessage: string): Promise<string> => {
  try {
    const ai = getAiClient();
    const chat = ai.chats.create({
      model: 'gemini-3-pro-preview',
      history: history,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
        safetySettings: SAFETY_SETTINGS
      }
    });
    const response: GenerateContentResponse = await chat.sendMessage({ message: currentMessage });
    return response.text || "اے آئی اسسٹنٹ فی حال جواب دینے سے قاصر ہے۔";
  } catch (error: any) {
    return "رابطہ کرنے میں مسئلہ پیش آ رہا ہے۔";
  }
};

export const analyzeImageWithText = async (prompt: string, base64Image: string): Promise<string> => {
  try {
    const ai = getAiClient();
    const match = base64Image.match(/^data:(.+);base64,(.+)$/);
    const mimeType = match ? match[1] : 'image/jpeg';
    const data = match ? match[2] : base64Image;

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
    return "تصویر پراسیس کرنے میں غلطی ہوئی۔";
  }
};

export const getNumerologyAnalysis = async (name: string, motherName: string, total: number): Promise<string> => {
  const prompt = `نام: ${name}، والدہ کا نام: ${motherName}۔ ان کے نام کے کل اعداد ابجد قمری کے مطابق ${total} ہیں۔ اس عدد کی روشنی میں شخصیت، مستقبل، موافق رنگ، پتھر اور دن کا تفصیلی تجزیہ اردو میں کریں۔`;
  return generateSpiritualResponse(prompt);
};

export const analyzeMedicalReport = async (base64Image: string): Promise<string> => {
  const prompt = `یہ ایک میڈیکل رپورٹ کی تصویر ہے۔ براہ کرم اس رپورٹ کا خلاصہ کریں، اہم نتائج کی نشاندہی کریں اور سادہ اردو میں سمجھائیں کہ اس کا کیا مطلب ہے۔ اگر کوئی خطرے کی بات ہو تو معالج سے رجوع کرنے کا مشورہ دیں۔ جواب میں شنگرف ہربل ایکس کے اصولوں کو بھی مدنظر رکھیں۔`;
  return analyzeImageWithText(prompt, base64Image);
};

export const diagnoseSpiritualIllness = async (symptoms: string[]): Promise<string> => {
  const prompt = `صارف کو درج ذیل علامات محسوس ہو رہی ہیں: ${symptoms.join('، ')}۔ کیا یہ علامات کالا جادو، نظرِ بد یا جناتی اثرات کی طرف اشارہ کرتی ہیں؟ ان علامات کی روشنی میں روحانی تشخیص کریں اور قرآنی وظائف سے علاج تجویز کریں۔`;
  return generateSpiritualResponse(prompt);
};
