export interface WhatsAppProfileData {
  phone: string;
  pushname?: string;
  about?: string;
  isBusiness: boolean;
  isEnterprise: boolean;
  profilePic?: string;
  urlImage?: string;
  error?: string;
}

export interface PhoneCode {
  countryWithCode?: string;
  countryTranslated?: string;
  code: string;
}
