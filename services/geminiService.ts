import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

// Initialize Gemini API
const getAiClient = () => {
  let apiKey: string | undefined;
  
  try {
    // Direct access to process.env.API_KEY is preferred for build tools (Vite/Webpack) 
    // to correctly replace the string with the actual key during build.
    // The try-catch block prevents a crash if 'process' is not defined in the browser runtime.
    // @ts-ignore
    apiKey = process.env.API_KEY;
  } catch (e) {
    // If process is not defined and replacement didn't happen
    console.debug("Could not read process.env.API_KEY directly", e);
  }

  if (!apiKey) {
    console.error("API Key is missing. Please ensure the API_KEY environment variable is set.");
    throw new Error("API Key is required");
  }

  return new GoogleGenAI({ apiKey });
};

const SYSTEM_INSTRUCTION = `
آپ ایک ماہر روحانی معالج، ماہر علم الاعداد (Numerologist)، ماہر نجوم، اور ماہر طبیب (حکیم/ڈاکٹر) ہیں۔
آپ کا نام "روحانی و طبی رہنمائی" ہے۔
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

// Helper for error messages
const getFriendlyErrorMessage = (error: any): string => {
    const msg = error?.message?.toLowerCase() || '';
    
    if (msg.includes('api key') || msg.includes('unauthorized') || msg.includes('403') || msg.includes('permission denied')) {
        return "سرور کی کنفیگریشن میں مسئلہ ہے (API Key/Domain Restriction)۔ براہ کرم ایڈمن سے رابطہ کریں۔";
    }
    if (msg.includes('quota') || msg.includes('429')) {
        return "سرور پر لوڈ زیادہ ہے (Quota Exceeded)۔ براہ کرم تھوڑی دیر بعد کوشش کریں۔";
    }
    if (msg.includes('fetch') || msg.includes('network') || msg.includes('internet')) {
        return "انٹرنیٹ کنکشن کا مسئلہ ہے۔ براہ کرم اپنا نیٹ ورک چیک کریں۔";
    }
    return "سرور میں فنی خرابی ہے (Technical Error)۔ براہ کرم کچھ دیر بعد کوشش کریں۔";
};

export const generateSpiritualResponse = async (prompt: string): Promise<string> => {
  try {
    const ai = getAiClient();
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      }
    });
    return response.text || "معذرت، کوئی جواب موصول نہیں ہوا۔ براہ کرم دوبارہ کوشش کریں۔";
  } catch (error: any) {
    console.error("GenAI Error:", error);
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
    } else {
      const parts = base64Image.split(',');
      if (parts.length === 2) {
         data = parts[1];
         const mimeMatch = parts[0].match(/:(.*?);/);
         if (mimeMatch) mimeType = mimeMatch[1];
      }
    }

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          { text: prompt },
          { inlineData: { mimeType, data } }
        ]
      },
      config: { systemInstruction: SYSTEM_INSTRUCTION }
    });
    return response.text || "تصویر کا تجزیہ کرنے میں ناکامی ہوئی۔";
  } catch (error: any) {
    console.error("Image Analysis Error:", error);
    return getFriendlyErrorMessage(error);
  }
};

export const getNumerologyAnalysis = async (data: any, topic: string = 'general', extraInput: string = ''): Promise<string> => {
  const val = (v: string) => v && v.trim() !== '' ? v : null;

  const baseInfo = `
  نام: ${data.name}
  ${val(data.fatherName) ? `والد کا نام: ${data.fatherName}` : 'والد کا نام: فراہم نہیں کیا گیا'}
  ${val(data.motherName) ? `والدہ کا نام: ${data.motherName}` : 'والدہ کا نام: فراہم نہیں کیا گیا'}
  ${val(data.dob) ? `تاریخ پیدائش: ${data.dob}` : 'تاریخ پیدائش: فراہم نہیں کی گئی'}
  ${val(data.birthTime) ? `وقتِ پیدائش: ${data.birthTime}` : 'وقتِ پیدائش: فراہم نہیں کیا گیا'}
  ${val(data.day) ? `دن (Day): ${data.day}` : ''}
  ${val(data.date) ? `تاریخ (Date): ${data.date}` : ''}
  `;

  let specificPrompt = "";

  switch (topic) {
    case 'relation_father':
        specificPrompt = `
        موضوع: **والد صاحب کے ساتھ مناسبت (Compatibility with Father)**
        والد کا نام: "${extraInput || data.fatherName || 'نامعلوم'}"
        1. آپ کے اعداد اور والد کے اعداد میں کیسی ہم آہنگی ہے؟
        2. کیا نظریاتی اختلاف ہے یا محبت؟
        3. والد سے مالی فائدہ ہوگا یا خدمت کرنی پڑے گی؟
        4. تعلقات بہتر کرنے کا وظیفہ۔
        `;
        break;
    case 'relation_spouse':
        specificPrompt = `
        موضوع: **شریک حیات (زوجہ/شوہر) سے مناسبت (Spouse Compatibility)**
        شریک حیات کا نام: "${extraInput || data.partnerName || 'نامعلوم'}"
        1. ازدواجی زندگی کا عددی تجزیہ۔
        2. محبت اور جھگڑے کا فیصد۔
        3. کیا یہ جوڑ مبارک ہے؟
        4. گھر میں سکون کے لیے مشورہ۔
        `;
        break;
    case 'relation_friend':
        specificPrompt = `
        موضوع: **دوست کے ساتھ مناسبت (Friendship Compatibility)**
        دوست کا نام: "${extraInput}"
        1. کیا یہ دوستی مخلص ہے یا مطلب کی؟
        2. کیا اس دوست پر بھروسہ کیا جا سکتا ہے؟
        3. کیا مل کر کاروبار کرنا چاہیے؟
        `;
        break;
    case 'business_suitability':
        specificPrompt = `
        موضوع: **کاروبار اور کیریئر (Business & Career Analysis)**
        1. آپ کے اعداد کے لیے کون سا کاروبار سب سے بہترین ہے؟ (لوہا، کپڑا، پانی، آگ، مٹی وغیرہ)
        2. کیا نوکری راس آئے گی یا اپنا کام؟
        3. شراکت داری (Partnership) کرنی چاہیے یا نہیں؟
        4. رزق میں برکت کا عددی راز۔
        `;
        break;
    case 'past_analysis':
        specificPrompt = `
        موضوع: **گزرے ہوئے حالات کا تجزیہ (Past Analysis)**
        1. آپ کے ماضی کے اعداد کیا کہتے ہیں؟ کون سا سال سب سے مشکل تھا؟
        2. ماضی کی کون سی غلطی یا بندش ابھی تک اثر انداز ہے؟
        3. خاندانی اثرات کا جائزہ۔
        `;
        break;
    case 'present_analysis':
        specificPrompt = `
        موضوع: **موجودہ حالات کا تجزیہ (Present Circumstances)**
        1. آج کل آپ کس عددی سائیکل (Cycle) سے گزر رہے ہیں؟
        2. موجودہ پریشانیوں کی روحانی وجہ کیا ہے؟
        3. کیا ابھی کوئی نیا کام شروع کرنا چاہیے؟
        `;
        break;
    case 'future_analysis':
        specificPrompt = `
        موضوع: **آنے والے حالات کی پیشگوئی (Future Prediction)**
        1. آنے والے 12 ماہ کیسے ہوں گے؟
        2. مالی حالات کب بہتر ہوں گے؟
        3. صحت اور عزت کے حوالے سے پیشگوئی۔
        4. آنے والا "لکی سال" کون سا ہے؟
        `;
        break;
    case 'lucky_stone':
        specificPrompt = `
        موضوع: **آپ کا لکی پتھر (Lucky Gemstone)**
        1. آپ کے نام اور تاریخ پیدائش کے مطابق سب سے موافق پتھر (Gemstone)۔
        2. پہننے کا صحیح طریقہ (دن، دھات، انگلی)۔
        3. یہ پتھر کیا فائدہ دے گا؟ (صحت، پیسہ، یا نظر بد سے حفاظت)
        `;
        break;
    case 'lucky_color':
        specificPrompt = `
        موضوع: **خوش قسمت رنگ (Lucky Colors)**
        1. آپ کے لیے سب سے بہترین رنگ کون سے ہیں جو اورا (Aura) کو مضبوط کریں؟
        2. کس رنگ کے کپڑے پہننے سے کام بنتے ہیں؟
        3. کس رنگ سے پرہیز کرنا چاہیے؟
        `;
        break;
    case 'health_analysis':
        specificPrompt = `
        موضوع: **صحت اور بیماری (Health Analysis)**
        1. اعداد کے مطابق جسم کے کس حصے میں کمزوری ہو سکتی ہے؟ (معدہ، سر، دل وغیرہ)
        2. کون سی خوراک (گرم/سرد) آپ کے مزاج کے مطابق ہے؟
        3. بیماری سے بچاؤ کا صدقہ اور احتیاط۔
        `;
        break;
    case 'wazaif_adad':
        specificPrompt = `
        موضوع: **اسم اعظم اور وظیفہ (Personal Wazaif)**
        1. آپ کے نام کے اعداد کے مطابق "اسم اعظم"۔
        2. مشکل وقت کے لیے خاص وظیفہ۔
        3. روزانہ پڑھنے کی تسبیح۔
        `;
        break;
    case 'sadqa':
        specificPrompt = `
        موضوع: **صدقہ و خیرات (Sadqa Guide)**
        1. آپ کے لیے بہترین صدقہ کیا ہے؟ (گوشت، پیسے، میٹھا، یا کپڑے)
        2. صدقہ دینے کا بہترین دن اور وقت۔
        3. بلاؤں کو ٹالنے کا خاص طریقہ۔
        `;
        break;
    case 'mobile_analysis':
        specificPrompt = `
        موضوع: **موبائل نمبر کا تجزیہ (Mobile Number Analysis)**
        موبائل نمبر: "${extraInput}"
        
        براہ کرم اس موبائل نمبر کے اعداد کا صارف کے نام کے اعداد کے ساتھ موازنہ کر کے بتائیں:
        1. **مجموعی اثر:** کیا یہ نمبر ان کے لیے لکی (مبارک) ہے یا انلکی؟
        2. **کاروبار یا ذاتی:** کیا یہ نمبر کاروباری مقاصد کے لیے بہتر ہے یا صرف ذاتی استعمال کے لیے؟
        3. **چھپے ہوئے اثرات:** کیا اس نمبر کی وجہ سے لڑائی جھگڑے یا ذہنی دباؤ تو نہیں؟
        4. **مشورہ:** اگر نمبر ناموافق ہے تو کیا صدقہ دیں یا نمبر بدل لیں؟
        `;
        break;
    default:
        specificPrompt = `
        موضوع: **اعداد کا مفصل تجزیہ (General Analysis)**
        1. آپ کا "لائف پاتھ نمبر" اور "عددِ تقدیر"۔
        2. شخصیت کی خوبیاں اور خامیاں۔
        3. نام کی تاثیر اور مزاج (آتشی، بادی، آبی، خاکی)۔
        4. زندگی کا مجموعی نچوڑ۔
        `;
        break;
  }

  const prompt = `
  بطور ماہر علم الاعداد و نجوم و روحانیت، درج ذیل تفصیلات کا گہرا تجزیہ کریں:
  ${baseInfo}

  ${specificPrompt}

  نوٹ: رپورٹ مکمل اردو میں، تفصیلی پیراگرافس اور خوبصورت ترتیب کے ساتھ ہو۔
  `;
  return generateSpiritualResponse(prompt);
};

export const getHoroscopeAnalysis = async (data: any, type: 'chart' | 'match' | 'istikhara' | 'modern', extraData?: any): Promise<string> => {
    const val = (v: string) => v && v.trim() !== '' ? v : null;
    
    const baseInfo = `
    صارف کا نام: ${data.name}
    والدہ کا نام: ${data.motherName || 'فراہم نہیں کیا گیا'}
    والد کا نام: ${data.fatherName || 'فراہم نہیں کیا گیا'}
    تاریخ پیدائش: ${data.dob || 'فراہم نہیں کی گئی'}
    وقتِ پیدائش: ${data.birthTime || 'فراہم نہیں کیا گیا'}
    پیدائش کا دن: ${data.day || 'فراہم نہیں کیا گیا'}
    موجودہ تاریخ: ${data.date || 'فراہم نہیں کی گئی'}
    `;

    let prompt = "";

    if (type === 'chart') {
        prompt = `
        ${baseInfo}
        
        بطور ماہر نجوم (Astrologer) اور ماہر علم الجفر، اس صارف کا **"تفصیلی زائچہِ قسمت" (Detailed Horoscope Analysis)** تیار کریں۔
        
        **سخت ہدایات برائے رزلٹ (STRICT INSTRUCTIONS):**
        1. **اعداد چھپائیں:** جواب میں نام کے اعداد، ابجد کا حساب، یا جمع تفریق (Calculation Breakdown) **ہرگز نہ دکھائیں**۔ صارف کو صرف نتائج (Results) سے غرض ہے۔
        2. **کوئی ٹیبل نہیں:** زائچے کا نقشہ یا ٹیبل (Grid) ہرگز نہ بنائیں۔ اس کی جگہ 12 گھروں کے حالات کو **بلٹ پوائنٹس یا لسٹ** کی شکل میں لکھیں تاکہ موبائل پر آسانی سے پڑھا جا سکے۔
        
        **رپورٹ کا فارمیٹ (Output Format):**
        
        **حصہ اول: کوائف و ستارہ**
        - **آپ کا برج (Zodiac):** [یہاں لکھیں]
        - **حاکم ستارہ (Planet):** [یہاں لکھیں]
        - **عنصر (Element):** (آگ، مٹی، ہوا، یا پانی)
        - **لکی پتھر (Gemstone):** [یہاں لکھیں]
        
        **حصہ دوم: 12 گھروں کا احوال (House Analysis)**
        (یہاں 12 گھروں کے اثرات کو لسٹ کی صورت میں لکھیں، جیسے:
        1. **ذات اور شخصیت:** ...
        2. **مال و دولت:** ...
        وغیرہ)

        **حصہ سوم: تفصیلی حالات و واقعات (Detailed Predictions)**
        - **صحت (Health):** کون سی بیماری کا خدشہ ہے اور احتیاط کیا ہے؟
        - **کاروبار و رزق:** کیا نوکری بہتر ہے یا کاروبار؟ مالی حالات کب عروج پر ہوں گے؟
        - **شادی و محبت:** ازدواجی زندگی کیسی رہے گی؟ شریک حیات کا مزاج کیسا ہوگا؟
        - **دوست و دشمن:** کن لوگوں سے بچنا چاہیے؟
        
        نوٹ: رپورٹ ایک مستند نجومی کی طرح پراسرار انداز میں ہو، اور نام اور والدہ کے نام کے اثرات کو واضح کرے۔
        `;
    } else if (type === 'match') {
        prompt = `
        **موضوع: مناسبت اور رشتہ (Compatibility Analysis)**
        
        پہلا نام: ${data.name}
        دوسرا نام: ${extraData.name2}
        رشتہ کی نوعیت: ${extraData.relationType} (مثلاً: شادی، دوستی، کاروبار)

        ان دونوں ناموں کے اعداد (ابجد اور نجوم) کا موازنہ کریں اور بتائیں:
        1. **مطابقت کا فیصد (Compatibility Percentage):** (مثلاً 80٪)
        2. **کیمسٹری:** ان کی ذہنی اور قلبی ہم آہنگی کیسی ہے؟
        3. **مضبوط پہلو:** اس رشتے میں کیا چیز اچھی رہے گی؟
        4. **کمزور پہلو اور احتیاط:** کن باتوں پر جھگڑا ہو سکتا ہے؟
        5. **حتمی مشورہ:** کیا یہ جوڑ مبارک ہے یا نہیں؟
        
        جواب میں Emojis استعمال کریں اور فیصلہ کن رائے دیں۔
        `;
    } else if (type === 'istikhara') {
        prompt = `
        **موضوع: استخارہ / AI روحانی رہنمائی**
        
        سائل کا نام: ${data.name}
        سوال: "${extraData.question}"
        
        علم الاعداد اور علم الساعات (Time Science) کے اصولوں کے مطابق اس سوال کا فوری جواب (استخارہ) نکالیں:
        1. **جواب:** کیا یہ کام کرنا چاہیے؟ (ہاں / نہیں / انتظار کریں)
        2. **وجہ:** اعداد کیا اشارہ کر رہے ہیں؟ (مثبت/منفی)
        3. **آج کی توانائی:** کیا آج کا وقت اس کام کے لیے موزوں ہے؟
        4. **مشورہ:** کامیابی کے لیے کون سا صدقہ یا ورد کریں؟
        
        جواب نہایت مختصر، واضح اور روحانی ہو۔
        `;
    } else if (type === 'modern') {
         prompt = `
        **موضوع: جدید چیزوں کا نجومی اثر (Modern Astro Analysis)**
        
        نام: ${data.name}
        ${extraData.mobile ? `موبائل نمبر: ${extraData.mobile}` : ''}
        ${extraData.vehicle ? `گاڑی نمبر: ${extraData.vehicle}` : ''}
        ${extraData.house ? `گھر/مکان نمبر: ${extraData.house}` : ''}
        
        ان جدید نمبروں کا صارف کی زندگی پر اثر بتائیں:
        1. **موبائل نمبر:** کیا یہ نمبر ان کے کاروبار/رابطوں کے لیے لکی ہے؟
        2. **گاڑی:** کیا گاڑی کا نمبر سفر کے لیے محفوظ ہے؟
        3. **گھر:** کیا گھر کا نمبر سکون والا ہے؟
        
        ساتھ ہی **لکی نمبرز** بھی جنریٹ کریں (لاٹری یا پرائز بانڈ کے لیے)۔
        `;
    }

    return generateSpiritualResponse(prompt);
};

export const getBlackMagicDiagnosis = async (data: any, type: 'diagnosis' | 'history' | 'protection', query?: string): Promise<string> => {
    const val = (v: string) => v && v.trim() !== '' ? v : null;

    const baseInfo = `
    نام: ${data.name}
    والدہ کا نام: ${data.motherName || 'فراہم نہیں کیا گیا'}
    والد کا نام: ${data.fatherName || 'فراہم نہیں کیا گیا'}
    تاریخ پیدائش: ${data.dob || 'فراہم نہیں کی گئی'}
    وقتِ پیدائش: ${data.birthTime || 'فراہم نہیں کیا گیا'}
    موجودہ تاریخ: ${data.date || 'فراہم نہیں کی گئی'}
    دن: ${data.day || 'فراہم نہیں کیا گیا'}
    مسئلہ/علامات: ${data.problem || 'عام تشخیص'}
    `;

    let prompt = "";

    if (type === 'diagnosis') {
        prompt = `
        ${baseInfo}
        
        **تشخیص کا طریقہ (System Logic):**
        1. آپ کو چاہیے کہ پس پردہ (Background) میں فراہم کردہ "نام"، "والدہ کا نام"، "دن" اور "تاریخ" کے کل اعداد (Abjad) جمع کریں۔
        2. حاصل ہونے والے کل مجموعے کو **4 پر تقسیم کریں** (Divide Sum by 4)۔
        3. جو باقی (Remainder) بچے (یعنی 0، 1، 2، یا 3)، صرف اس کے مطابق نیچے دی گئی عبارت جواب میں لکھیں۔

        **اگر باقی 1 بچے (Remainder = 1):**
        "آپ کو کسی قسم کا جادو نہیں ہے، آپ کو اندرونی بخار اور دیگر امراض ہیں۔ آپ کسی مستند حکیم سے رابطہ کریں۔"

        **اگر باقی 2 بچے (Remainder = 2):**
        "آپ کو کسی قسم کا جادو یا چھیڑ چھاڑ نہیں ہے۔ آپ اپنے امراض کے علاج کے لیے کسی حکیم سے رابطہ کریں۔"

        **اگر باقی 3 بچے (Remainder = 3):**
        "آپ پر آسیب و جنات کا سایہ ہے۔ آپ اس کے علاج کے لیے اپنے مستند روحانی معالج سے رابطہ کریں۔ اگر آپ کو کوئی روحانی معالج نہیں معلوم تو آپ حکیم غلام یاسین آرائیں (کہروڑ پکا) یا حاجی اشفاق (ماہر عملیات، خانیوال) سے رابطہ کریں۔ رابطہ کے لیے اسی ایپ میں 'رابطہ' والے حصہ میں جائیں۔"

        **اگر باقی 0 بچے (یعنی پورا تقسیم ہو جائے) (Remainder = 0):**
        "آپ پر کسی نے کالا جادو کرایا ہوا ہے اور آپ مسائل میں گھرے ہوئے ہیں۔ آپ اس کے علاج کے لیے اپنے مستند روحانی معالج سے رابطہ کریں۔ اگر آپ کو کوئی روحانی معالج نہیں معلوم تو آپ حکیم غلام یاسین آرائیں (کہروڑ پکا) یا حاجی اشفاق (ماہر عملیات، خانیوال) سے رابطہ کریں۔ رابطہ کے لیے اسی ایپ میں 'رابطہ' والے حصہ میں جائیں۔"

        **سخت ہدایات:**
        - جواب میں اعداد، جمع تفریق، یا تقسیم کا عمل ہرگز ظاہر نہ کریں۔
        - صرف اور صرف اوپر دی گئی متعلقہ اردو عبارت (Result Text) لکھیں۔
        `;
    } else if (type === 'history') {
        prompt = `
        ${baseInfo}
        
        **موضوع: تاریخی روحانی تجزیہ (Historical Spiritual Analysis)**
        
        صارف کے ماضی اور موجودہ حالات کا موازنہ کریں:
        1. **ماضی کا تعلق:** کیا ان کی موجودہ مشکلات کا تعلق ماضی کی کسی غلطی، دشمنی، یا خاندانی اثرات سے ہے؟
        2. **وقت کا تجزیہ:** ان کی تاریخ پیدائش کے مطابق کون سا وقت ان پر بھاری گزرا ہے؟
        3. **مستقبل کی پیشگوئی:** اگر علاج نہ کیا گیا تو اگلے 6 ماہ میں حالات کس طرف جا سکتے ہیں؟
        4. **رجعت یا بندش:** کیا ان پر کوئی پرانی رجعت یا خاندانی بندش ہے؟
        `;
    } else if (type === 'protection') {
        prompt = `
        ${baseInfo}
        
        **موضوع: روحانی علاج، تحفظ اور استغفار (Remedies & Protection)**
        
        اس صارف کی تشخیص کے مطابق علاج تجویز کریں:
        1. **قرآنی علاج:** کون سی سورتیں پڑھنی چاہئیں؟ (مثلاً سورہ بقرہ، منزل، وغیرہ)
        2. **یومیہ اذکار:** صبح و شام کے وہ اذکار بتائیں جو جادو اور نظر کو کاٹتے ہیں۔
        3. **صدقہ:** بلاؤں کو ٹالنے کے لیے کون سا صدقہ (گوشت، دال، پیسے) دینا چاہیے؟
        4. **حصار کا طریقہ:** سونے سے پہلے اپنے تحفظ کا طریقہ سکھائیں۔
        5. **مثبت توانائی:** گھر میں مثبت انرجی لانے کے لیے کیا کریں؟
        
        صرف نوری اور شرعی وظائف بتائیں۔ کوئی غیر شرعی عمل نہ بتائیں۔
        `;
    }

    return generateSpiritualResponse(prompt);
};

export const getInitialDiagnosis = async (symptoms: string, image?: string): Promise<string> => {
  const prompt = `
  مریض کی علامات: ${symptoms}
  ${image ? 'نوٹ: ساتھ دی گئی تصویر کا بھی طبی معائنہ (Visual Examination) کریں اور علامات کے ساتھ ملا کر تشخیص کریں۔' : ''}
  
  براہ کرم ان علامات اور تصویر (اگر ہو) کی بنیاد پر صرف **"بیماری کی تشخیص" (Diagnosis)** فراہم کریں۔
  
  **اہم ہدایات:**
  1. **تعداد:** علامات کے مطابق زیادہ سے زیادہ **3 ممکنہ بیماریوں** (Top 3 Diseases) کے نام لکھیں۔
  2. **تفصیل:** ہر بیماری کے بارے میں 1-2 لائنوں میں بتائیں کہ یہ کیوں ہوتی ہے۔
  3. **کوئی علاج نہیں:** اس مرحلے پر کوئی دوا یا نسخہ ہرگز نہ لکھیں۔ صرف بیماری کی پہچان بتائیں۔
  
  جواب اردو میں ہو۔
  `;

  if (image) {
    return analyzeImageWithText(prompt, image);
  }
  return generateSpiritualResponse(prompt);
};

export const getMedicalDiagnosis = async (symptoms: string, treatmentType: string, image?: string): Promise<string> => {
  const prompt = `
  مریض کی علامات: ${symptoms}
  منتخب طریقہ علاج: ${treatmentType}
  ${image ? 'نوٹ: تصویر کا بھی خیال رکھیں تاکہ دوا یا علاج تصویر میں نظر آنے والی حالت کے مطابق ہو۔' : ''}

  آپ ایک ماہر طبیب ہیں۔ منتخب طریقہ علاج کے مطابق بالکل درست اور نپے تلے نسخے لکھیں۔
  **تشخیص نہ لکھیں** (کیونکہ وہ پہلے ہو چکی ہے)، صرف علاج لکھیں۔

  **اگر "طب یونانی و اسلامی" (Unani/Islamic) ہے تو درج ذیل 5 چیزیں لازمی لکھیں:**
  1. **مرکب ادویات (3 عدد):** ایک معجون کا نام، ایک خمیرہ یا اطریفل یا سفوف، اور ایک شربت (بیماری کے مطابق)۔
  2. **نسخہ:** ایک گھریلو نسخہ (Nuskha) اجزاء کے ساتھ۔
  3. **قہوہ/جوشاندہ:** مرض کے مطابق ایک قہوہ۔
  *نوٹ: ہر چیز کا طریقہ استعمال اور پرہیز لازمی لکھیں۔*

  **اگر "ایلوپیتھک" (Allopathic) ہے تو درج ذیل 4 چیزیں لازمی لکھیں:**
  1. ایک کیپسول (Capsule)۔
  2. ایک گولی (Tablet)۔
  3. ایک انجیکشن (Injection) (اگر ضرورت ہو، ورنہ متبادل دوا)۔
  4. ایک شربت (Syrup)۔
  *نوٹ: خوراک، طریقہ استعمال اور پرہیز لازمی لکھیں۔*

  **اگر "ہومیوپیتھی" (Homeopathy) ہے تو:**
  - صرف **3 بہترین ہومیوپیتھک ادویات** ان کی طاقت (Potency) کے ساتھ لکھیں۔
  - طریقہ استعمال اور پرہیز لکھیں۔
  
  **اگر "حجامہ" (Hijama) ہے تو:**
  - بیماری کے مطابق کپ لگانے کے مقامات (Sunnah Points)۔
  - احتیاطی تدابیر۔

  **اگر "مساج تھراپی" (Massage) ہے تو:**
  - بیماری کے مطابق مخصوص روغن (Oil) کا نام۔
  - مالش کا طریقہ۔
  
  **اگر "اروما تھراپی" (Aromatherapy) ہے تو:**
  - بیماری کے مطابق مخصوص خوشبو/تیل (Essential Oil)۔
  - استعمال کا طریقہ۔

  جواب مکمل اردو میں، صاف ستھرا اور لسٹ کی شکل میں ہو۔
  `;

  if (image) {
    return analyzeImageWithText(prompt, image);
  }
  return generateSpiritualResponse(prompt);
};

export const analyzeMedicine = async (image: string): Promise<string> => {
  const prompt = `
  یہ ایک دوائی (Medicine) کی تصویر ہے۔
  براہ کرم اس دوائی کو شناخت کریں اور درج ذیل تفصیلات مکمل اردو میں فراہم کریں:

  1. **دوائی کا نام (Medicine Name):**
  2. **فارمولا (Formula/Ingredients):** (کیمیکل یا ہربل اجزاء)
  3. **فوائد (Uses/Benefits):** یہ کس مرض کے لیے استعمال ہوتی ہے؟
  4. **نقصانات (Side Effects):** اس کے ممکنہ سائیڈ ایفیکٹس کیا ہیں؟
  5. **طریقہ استعمال (Usage/Dosage):** عام طور پر اسے کیسے استعمال کیا جاتا ہے؟
  6. **احتیاط (Precautions):** کن لوگوں کو استعمال نہیں کرنی چاہیے؟

  جواب صاف ستھری اردو میں اور لسٹ کی شکل میں ہو۔
  `;
  return analyzeImageWithText(prompt, image);
};

export const scanDocument = async (image: string): Promise<string> => {
  const prompt = `
  اس دستاویز (Document/Report) کو پڑھیں۔ یہ طبی رپورٹ، نسخہ یا کوئی تحریر ہو سکتی ہے۔
  اس کا مکمل متن اردو میں ترجمہ کر کے خلاصہ بیان کریں۔
  اگر یہ میڈیکل رپورٹ ہے تو نتائج کو آسان اردو میں سمجھائیں۔
  `;
  return analyzeImageWithText(prompt, image);
};