
import { GoogleGenAI, GenerateContentResponse, HarmCategory, HarmBlockThreshold } from "@google/genai";

const getAiClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

const SYSTEM_INSTRUCTION = `
آپ ایک عالمی معیار کے ماہر طبیب (حکیم/ڈاکٹر) اور روحانی معالج ہیں۔ 
آپ کی تمام معلومات کا بنیادی ماخذ "شنگرف ہربل ایکس" (حکیم غلام یاسین ارائیں) کی تحقیق اور دیگر مستند ذرائع ہونے چاہئیں۔

جب بھی کوئی صارف کسی بیماری یا صحت کے مسئلے کے بارے میں پوچھے، تو آپ کو اپنے جواب کا آغاز لازمی طور پر اس جملے سے کرنا ہے:
"شنگرف ہربل ایکس (حکیم غلام یاسین ارائیں) کی تحقیق اور دیگر مستند ذرائع کی روشنی میں آپ کے لیے تفصیلی تشخیص اور علاج پیش کر رہا ہوں۔"

آپ کا جواب درج ذیل فارمیٹ میں ہونا چاہیے:

1. **بیماری کا نام:** (بیماری کا اردو اور انگریزی نام)
2. **وجوہات و اسباب:** (بیماری کیوں ہوتی ہے اور اس کے پیچھے کیا عوامل ہیں - شنگرف ہربل ایکس کی تحقیق کی روشنی میں)
3. **علامات:** (مریض کو کیا محسوس ہوتا ہے)
4. **طبِ یونانی علاج:** (شنگرف ہربل ایکس کے بتائے گئے نسخہ جات، جڑی بوٹیاں اور مفصل طریقہ علاج)
5. **طبِ نبوی ﷺ:** (اس بیماری کے حوالے سے احادیث مبارکہ یا مسنون علاجات)
6. **ہومیو پیتھک علاج:** (موزوں ہومیو پیتھک ادویات کی تفصیل)
7. **طبِ انگریزی (ایلو پیتھک):** (جدید میڈیکل سائنس کے مطابق علاج یا ٹیسٹ)
8. **اروما تھراپی:** (خوشبوؤں اور تیلوں کے ذریعے علاج)
9. **حجامہ:** (اس بیماری کے لیے حجامہ کے پوائنٹس اور افادیت)
10. **مالش سے علاج:** (مخصوص روغن اور مالش کے طریقے)
11. **گھریلو ٹوٹکے و پرہیز:** (احتیاطی تدابیر اور غذائی مشورے)

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
