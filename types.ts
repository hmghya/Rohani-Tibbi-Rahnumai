
export enum AppSection {
  Home = 'Home',
  Calendar = 'Calendar', // New Calendar Section
  PrayerTimes = 'PrayerTimes', // New Prayer Times Section
  Numerology = 'Numerology', // Ilm-ul-Adad
  TimeScience = 'TimeScience', // Ilm-us-Sa'at
  Horoscope = 'Horoscope', // Zaicha
  Spiritual = 'Spiritual', // Rohani Ilm
  Wazaif = 'Wazaif', // Qurani Wazaif
  BlackMagic = 'BlackMagic', // Kala Jadu
  Medical = 'Medical', // Ilm-e-Tib
  Documents = 'Documents', // OCR
  Contact = 'Contact' // Rabta
}

export interface NavItem {
  id: AppSection;
  label: string;
  icon: any;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  image?: string;
}

export interface MedicalAnalysisRequest {
  symptoms: string;
  image?: string; // Base64
}

export interface NumerologyRequest {
  name: string;
  motherName?: string;
  dob?: string;
  partnerName?: string; // For compatibility
  mobileNumber?: string;
}