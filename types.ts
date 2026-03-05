export enum AppSection {
  Home = 'Home',
  Numerology = 'Numerology',
  TimeScience = 'TimeScience',
  Horoscope = 'Horoscope',
  DreamInterpretation = 'DreamInterpretation',
  Wazaif = 'Wazaif',
  BlackMagic = 'BlackMagic',
  Documents = 'Documents',
  UnaniHealth = 'UnaniHealth',
  Contact = 'Contact',
  Settings = 'Settings'
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