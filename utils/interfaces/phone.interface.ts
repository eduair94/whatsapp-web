export interface TelegramProfileData {
  error?: string;
  id: number;
  username: string;
  usernames: null;
  first_name: string;
  last_name: string;
  fake: boolean;
  verified: boolean;
  premium: boolean;
  mutual_contact: boolean;
  bot: boolean;
  bot_chat_history: boolean;
  restricted: boolean;
  restriction_reason: null;
  user_was_online: string;
  phone: string;
  hasPhoto: boolean;
  photoUrl: string;
  date?: Date;
}

export interface WhatsAppProfileData {
  phone: string;
  pushname?: string;
  about?: string;
  isBusiness: boolean;
  isEnterprise: boolean;
  profilePic?: string;
  urlImage?: string;
  error?: string;
  _id?: string;
  date?: string;
  telegram?: TelegramProfileData;
  // Additional WhatsApp properties from the full API response
  id?: {
    server?: string;
    user?: string;
    _serialized?: string;
  };
  number?: string;
  labels?: string[];
  isMe?: boolean;
  isUser?: boolean;
  isGroup?: boolean;
  isWAContact?: boolean;
  isMyContact?: boolean;
  isBlocked?: boolean;
  countryCode?: string;
}

export interface PhoneCode {
  countryWithCode?: string;
  countryTranslated?: string;
  code: string;
}
