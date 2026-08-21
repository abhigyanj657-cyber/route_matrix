import { create } from 'zustand';

export interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  script: string;
  region: string;
}

export const INDIAN_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', script: 'Latin', region: 'Pan-India' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', script: 'Devanagari', region: 'North / Central' },
  { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া', script: 'Bengali-Assamese', region: 'Assam' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', script: 'Bengali', region: 'West Bengal / Tripura' },
  { code: 'brx', name: 'Bodo', nativeName: 'बड़ो', script: 'Devanagari', region: 'Assam' },
  { code: 'doi', name: 'Dogri', nativeName: 'डोगरी', script: 'Devanagari', region: 'Jammu & Kashmir' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', script: 'Gujarati', region: 'Gujarat' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', script: 'Kannada', region: 'Karnataka' },
  { code: 'ks', name: 'Kashmiri', nativeName: 'کٲشُر / कॉशुर', script: 'Perso-Arabic / Deva', region: 'Jammu & Kashmir' },
  { code: 'kok', name: 'Konkani', nativeName: 'कोंकणी', script: 'Devanagari', region: 'Goa / Konkan' },
  { code: 'mai', name: 'Maithili', nativeName: 'मैथिली', script: 'Devanagari / Tirhuta', region: 'Bihar / Mithila' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', script: 'Malayalam', region: 'Kerala' },
  { code: 'mni', name: 'Manipuri', nativeName: 'মণিপুরী / ꯃꯤꯇꯩꯂꯣꯟ', script: 'Meitei / Bengali', region: 'Manipur' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', script: 'Devanagari', region: 'Maharashtra' },
  { code: 'ne', name: 'Nepali', nativeName: 'नेपाली', script: 'Devanagari', region: 'Sikkim / WB' },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ', script: 'Odia', region: 'Odisha' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', script: 'Gurmukhi', region: 'Punjab' },
  { code: 'sa', name: 'Sanskrit', nativeName: 'संस्कृतम्', script: 'Devanagari', region: 'Pan-India' },
  { code: 'sat', name: 'Santali', nativeName: 'ᱥᱟᱱᱛᱟᱲᱤ', script: 'Ol Chiki', region: 'Jharkhand / Odisha' },
  { code: 'sd', name: 'Sindhi', nativeName: 'سنڌي / सिंधी', script: 'Arabic / Deva', region: 'Western India' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', script: 'Tamil', region: 'Tamil Nadu' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', script: 'Telugu', region: 'Andhra / Telangana' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', script: 'Perso-Arabic', region: 'Pan-India' },
];

const TRANSLATIONS: Record<string, Record<string, string>> = {
  appTagline: {
    en: 'Pan-India AI Freight Consolidation & Backhaul Network',
    hi: 'अखिल भारतीय एआई माल समेकन नेटवर्क',
    bn: 'সর্বভারতীয় এআই মালবাহী একত্রীকরণ নেটওয়ার্ক',
    mr: 'अखिल भारतीय एआय मालवाहतूक एकत्रीकरण नेटवर्क',
    ta: 'அகில இந்திய AI சரக்கு ஒருங்கிணைப்பு நெட்வொர்க்',
    te: 'అఖిల భారత AI సరుకు రవాణా నెట్‌వర్క్',
    gu: 'અખિલ ભારતીય AI માલવાહક નેટવર્ક',
    kn: 'ಅಖಿಲ ಭಾರತ AI ಸರಕು ಸಾಗಣೆ ನೆಟ್‌ವರ್ಕ್',
    ml: 'അഖിലേന്ത്യാ AI ചരക്ക് ശൃംഖല',
    pa: 'ਅਖਿਲ ਭਾਰਤੀ AI ਮਾਲ ਢੋਆ-ਢੁਆਈ ਨੈੱਟਵਰਕ',
    or: 'ଅଖିଳ ଭାରତୀୟ AI ମାଲ ପରିବହନ ନେଟୱାର୍କ',
    as: 'সৰ্বভাৰতীয় AI মালবাহী একত্ৰীকৰণ নেটৱৰ্ক',
    mai: 'अखिल भारतीय एआई माल समेकन नेटवर्क',
    ur: 'کل ہند اے آئی فریٹ کنسولیڈیشن نیٹ ورک',
    sa: 'अखिल-भारतीय-कृत्रिम-बुद्धि-भार-समेकन-जालम्'
  },
  dispatcherNav: {
    en: 'Dispatcher Hub',
    hi: 'डिस्पैचर हब',
    bn: 'ডিসপ্যাচার হাব',
    mr: 'डिस्पॅचर हब',
    ta: 'டிஸ்பாட்சர் மையம்',
    te: 'డిస్పాచర్ హబ్',
    gu: 'ડિસ્પેચર હબ',
    kn: 'ಡಿಸ್ಪ್ಯಾಚರ್ ಹಬ್',
    ml: 'ഡിസ്പാച്ചർ ഹബ്ബ്',
    pa: 'ਡਿਸਪੈਚਰ ਹੱਬ',
    or: 'ଡିସପାଚର ହବ',
    as: 'ডিচপেচাৰ হাব',
    mai: 'डिस्पैचर हब',
    ur: 'ڈسپیچر حب',
    sa: 'प्रसारक-केन्द्रम्'
  },
  shipperNav: {
    en: 'Customer Dashboard',
    hi: 'ग्राहक डैशबोर्ड',
    bn: 'গ্রাহক ড্যাশবোর্ড',
    mr: 'ग्राहक डॅशबोर्ड',
    ta: 'வாடிக்கையாளர் பலகை',
    te: 'కస్టమర్ డాష్‌బోర్డ్',
    gu: 'ગ્રાહક ડેશબોર્ડ',
    kn: 'ಗ್ರಾಹಕ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
    ml: 'ഉപഭോക്തൃ ഡാഷ്‌ബോർഡ്',
    pa: 'ਗਾਹਕ ਡੈਸ਼ਬੋਰਡ',
    or: 'ଗ୍ରାହକ ଡ୍ୟାସବୋର୍ଡ',
    as: 'গ্ৰাহক ডেচবৰ্ড',
    mai: 'ग्राहक डैशबोर्ड',
    ur: 'کسٹمر ڈیش بورڈ',
    sa: 'ग्राहक-फलकम्'
  },
  driverNav: {
    en: 'Driver Dashboard',
    hi: 'चालक डैशबोर्ड',
    bn: 'চালক ড্যাশবোর্ড',
    mr: 'चालक डॅशबोर्ड',
    ta: 'ஓட்டுநர் பலகை',
    te: 'డ్రైవర్ డాష్‌బోర్డ్',
    gu: 'ડ્રાઈવર ડેશબોર્ડ',
    kn: 'ಚಾಲಕ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
    ml: 'ഡ്രൈവർ ഡാഷ്‌ബോർഡ്',
    pa: 'ਡਰਾਈਵਰ ਡੈਸ਼ਬੋਰਡ',
    or: 'ଚାଳକ ଡ୍ୟାସବୋର୍ଡ',
    as: 'চালক ডেচবৰ্ড',
    mai: 'ड्राइवर डैशबोर्ड',
    ur: 'ڈرائیور ڈیش بورڈ',
    sa: 'चालक-फलकम्'
  },
  activeFleetTab: {
    en: 'Active Fleet & Driver Rosters',
    hi: 'सक्रिय चालक व वाहन रोस्टर',
    bn: 'সক্রিয় বহর ও চালক তালিকা',
    mr: 'सक्रिय वाहन व चालक यादी',
    ta: 'செயலில் உள்ள வாகனங்கள் & ஓட்டுநர் பட்டியல்',
    te: 'క్రియాశీల వాహనాలు & డ్రైవర్ రోస్టర్',
    gu: 'સક્રિય ફ્લીટ અને ડ્રાઈવર રોસ્ટર',
    kn: 'ಸಕ್ರಿಯ ವಾಹನಗಳು & ಚಾಲಕರ ಪಟ್ಟಿ',
    ml: 'സജീവ ഫ്ലീറ്റ് & ഡ്രൈവർ പട്ടിക',
    pa: 'ਸਰਗਰਮ ਫਲੀਟ ਤੇ ਡਰਾਈਵਰ ਰੋਸਟਰ',
    or: 'ସକ୍ରିୟ ଗାଡ଼ି ଓ ଚାଳକ ତାଲିକା',
    as: 'সক্ৰিয় ফ্লীট আৰু চালক ৰষ্টাৰ',
    mai: 'सक्रिय चालक आ वाहन रोस्टर',
    ur: 'فعال گاڑیاں اور ڈرائیور فہرست',
    sa: 'सक्रिय-वाहन-चालक-नामावली'
  },
  routeMatrixTab: {
    en: 'Route Matrix & Optimization',
    hi: 'मार्ग मैट्रिक्स व अनुकूलन',
    bn: 'রুট ম্যাট্রিক্স ও অপটিমাইজেশন',
    mr: 'मार्ग मॅट्रिक्स व ऑप्टिमायझेशन',
    ta: 'வழித்தட அணி & உகப்பாக்கம்',
    te: 'రూట్ మ్యాట్రిక్స్ & ఆప్టిమైజేషన్',
    gu: 'રૂટ મેટ્રિક્સ અને ઓપ્ટિમાઇઝેશન',
    kn: 'ಮಾರ್ಗ ಮ್ಯಾಟ್ರಿಕ್ಸ್ & ಆಪ್ಟಿಮೈಸೇಶನ್',
    ml: 'റൂട്ട് മാട്രിക്സ് & ഒപ്റ്റിമൈസേഷൻ',
    pa: 'ਰੂਟ ਮੈਟ੍ਰਿਕਸ ਤੇ ਅਨੁਕੂਲਤਾ',
    or: 'ମାର୍ଗ ମ୍ୟାଟ୍ରିକ୍ସ ଓ ଅନୁକୂଳନ',
    as: 'পথ মেট্ৰিক্স আৰু অনুকূলন',
    mai: 'रूट मैट्रिक्स आ अनुकूलन',
    ur: 'راستہ میٹرکس اور ترجیح',
    sa: 'मार्ग-व्यूहः तथा अनुकूलीकरणम्'
  },
  runOptimizerBtn: {
    en: 'Run AI Backhaul & Pooling Engine (OR-Tools)',
    hi: 'एआई बैकहॉल व पूलिंग इंजन चलाएं (OR-Tools)',
    bn: 'এআই ব্যাকহোল ও পুলিং ইঞ্জিন চালান (OR-Tools)',
    mr: 'एआय बॅकहॉल व पूलिंग इंजिन चालवा (OR-Tools)',
    ta: 'AI ஒருங்கிணைப்பு இயந்திரத்தை இயக்கு (OR-Tools)',
    te: 'AI పూలింగ్ ఇంజిన్‌ను ప్రారంభించండి (OR-Tools)',
    gu: 'AI બેકહોલ અને પૂલિંગ એન્જિન ચલાવો (OR-Tools)',
    kn: 'AI ಪೂಲಿಂಗ್ ಎಂಜಿನ್ ರನ್ ಮಾಡಿ (OR-Tools)',
    ml: 'AI പൂളിംഗ് എഞ്ചിൻ പ്രവർത്തിപ്പിക്കുക (OR-Tools)',
    pa: 'AI ਪੂਲਿੰਗ ਇੰਜਣ ਚਲਾਓ (OR-Tools)',
    or: 'AI ପୁଲିଂ ଇଞ୍ଜିନ ଚଲାନ୍ତୁ (OR-Tools)',
    as: 'AI পুলিং ইঞ্জিন চলাওক (OR-Tools)',
    mai: 'एआई बैकहॉल आ पूलिंग इंजन चलाउ (OR-Tools)',
    ur: 'اے آئی پولنگ انجن چلائیں (OR-Tools)',
    sa: 'कृत्रिम-बुद्धि-पूलिंग-यन्त्रं चालयन्तु (OR-Tools)'
  },
  emptyKmSaved: {
    en: 'Empty-Running Km Cut',
    hi: 'खाली किमी की बचत',
    bn: 'খালি কিমি সাশ্রয়',
    mr: 'रिकामी धाव बचत',
    ta: 'வெற்று கி.மீ சேமிப்பு',
    te: 'ఖాళీ కి.మీ పొదుపు',
    gu: 'ખાલી કિમી બચત',
    kn: 'ಖಾಲಿ ಕಿ.ಮೀ ಉಳಿತಾಯ',
    ml: 'ശൂന്യ കി.മീ ലാഭം',
    pa: 'ਖਾਲੀ ਕਿਲੋਮੀਟਰ ਬਚਤ',
    or: 'ଖାଲି କିମି ସଞ୍ଚୟ',
    as: 'খালী কিমি ৰাহি',
    mai: 'खाली किमी बचत',
    ur: 'خالی کلومیٹر بچت',
    sa: 'रिक्त-किमी-संरक्षणम्'
  },
  msmeSavings: {
    en: 'MSME Freight Cost Saved',
    hi: 'एमएसएमई भाड़ा बचत',
    bn: 'এমএসএমই ভাড়া সাশ্রয়',
    mr: 'एमएसएमई भाडे बचत',
    ta: 'சரக்கு கட்டண சேமிப்பு',
    te: 'రవాణా ఛార్జీల పొదుపు',
    gu: 'ભાડાની બચત',
    kn: 'ಸಾರಿಗೆ ವೆಚ್ಚ ಉಳಿತಾಯ',
    ml: 'ചരക്ക് കൂലി ലാഭം',
    pa: 'ਭਾੜੇ ਦੀ ਬਚਤ',
    or: 'ଭଡ଼ା ସଞ୍ଚୟ',
    as: 'ভাৰা ৰাহি',
    mai: 'भाड़ा बचत',
    ur: 'کرایہ کی بچت',
    sa: 'भाटक-संरक्षणम्'
  },
  co2Saved: {
    en: 'Net CO2 Cut (Diesel)',
    hi: 'कार्बन डाइऑक्साइड उत्सर्जन कमी',
    bn: 'কার্বন নির্গমন হ্রাস',
    mr: 'कार्बन उत्सर्जन घट',
    ta: 'கரிம உமிழ்வு குறைப்பு',
    te: 'కార్बನ್ తగ్గింపు',
    gu: 'કાર્બન ઉત્સર્જન ઘટાડો',
    kn: 'ಕಾರ್ಬನ್ ಇಳಿಕೆ',
    ml: 'കാർബൺ കുറവ്',
    pa: 'ਕਾਰਬਨ ਘਟਾਓ',
    or: 'ଅଙ୍ଗାରକାମ୍ଳ ହ୍ରାସ',
    as: 'কাৰ্বন হ্ৰাস',
    mai: 'कार्बन उत्सर्जन कटौती',
    ur: 'کاربن کا اخراج کم',
    sa: 'अङ्गाराम्ल-न्यूनीकरणम्'
  },
  liveConsignmentsTitle: {
    en: 'Live Orders & Consignment Queue',
    hi: 'सक्रिय ऑर्डर्स व कंसाइनमेंट कतार',
    bn: 'সক্রিয় চালান ও অর্ডার সারি',
    mr: 'सक्रिय ऑर्डर्स व कंसाइनमेंट रांग',
    ta: 'நேரடி ஆர்டர்கள் & சரக்கு வரிசை',
    te: 'ప్రత్యక్ష ఆర్డర్‌లు & సరుకుల క్యూ',
    gu: 'લાઇવ ઓર્ડર્સ અને કતાર',
    kn: 'ಸಕ್ರಿಯ ಆದೇಶಗಳು & ಸರದಿ',
    ml: 'തത്സമയ ഓർഡറുകൾ & ക്യൂ',
    pa: 'ਲਾਈਵ ਆਰਡਰ ਤੇ ਮਾਲ ਕਤਾਰ',
    or: 'ସକ୍ରିୟ ଅର୍ଡ଼ର ଓ ଧାଡ଼ି',
    as: 'সক্ৰিয় অৰ্ডাৰ আৰু শাৰী',
    mai: 'सक्रिय ऑर्डर्स आ कतार',
    ur: 'لائیو آرڈرز اور قطار',
    sa: 'सक्रिय-आदेश-श्रेणी'
  }
};

interface LanguageState {
  currentLanguage: string;
  isBilingualMode: boolean;
  setLanguage: (code: string) => void;
  toggleBilingualMode: () => void;
  t: (key: string) => string;
  bilingual: (key: string) => { primary: string; secondary: string };
}

export const useLanguageStore = create<LanguageState>((set, get) => ({
  currentLanguage: 'en',
  isBilingualMode: false,

  setLanguage: (code: string) => {
    if (code === 'en') {
      set({ currentLanguage: 'en', isBilingualMode: false });
    } else {
      set({ currentLanguage: code });
    }
  },

  toggleBilingualMode: () => {
    const { isBilingualMode, currentLanguage } = get();
    if (!isBilingualMode && currentLanguage === 'en') {
      set({ isBilingualMode: true, currentLanguage: 'hi' });
    } else {
      set({ isBilingualMode: !isBilingualMode });
    }
  },

  t: (key: string) => {
    const lang = get().currentLanguage;
    const entry = TRANSLATIONS[key];
    if (!entry) return key;
    if (lang === 'en') return entry['en'] || key;
    return entry[lang] || entry['en'] || key;
  },

  bilingual: (key: string) => {
    const lang = get().currentLanguage;
    const isBilingual = get().isBilingualMode;
    const entry = TRANSLATIONS[key];
    if (!entry) return { primary: key, secondary: '' };

    if (lang === 'en' && !isBilingual) {
      return { primary: entry['en'] || key, secondary: '' };
    }

    const primary = entry[lang] || entry['en'] || key;
    const secondary = isBilingual && lang !== 'en' ? (entry['en'] || '') : '';
    return { primary, secondary };
  }
}));
