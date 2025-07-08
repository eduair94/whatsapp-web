export interface PhoneProximitySearchParams {
  latitude: number;
  longitude: number;
  radius: number;
}

export interface BusinessHours {
  config: {
    sun?: { mode: string; hours: number[][] };
    mon?: { mode: string; hours: number[][] };
    tue?: { mode: string; hours: number[][] };
    wed?: { mode: string; hours: number[][] };
    thu?: { mode: string; hours: number[][] };
    fri?: { mode: string; hours: number[][] };
    sat?: { mode: string; hours: number[][] };
  };
  timezone: string;
}

export interface BusinessProfile {
  id: {
    server: string;
    user: string;
    _serialized: string;
  };
  dataSource: string;
  tag: string;
  description: string | null;
  categories: Array<{
    id: string;
    localized_display_name: string;
  }>;
  profileOptions: {
    commerceExperience: string;
    cartEnabled: boolean;
  };
  email: string | null;
  website: Array<{
    url: string;
  }>;
  latitude: number | null;
  longitude: number | null;
  businessHours: BusinessHours | null;
  address: string;
  fbPage: Record<string, any>;
  igProfessional: Record<string, any>;
  isProfileLinked: boolean;
  isProfileLocked: boolean;
  memberSinceText: string;
  coverPhoto: {
    id: string;
    url: Record<string, any>;
  } | null;
  automatedType: string;
  welcomeMsgProtocolMode: string;
  prompts: any;
  commandsDescription: any;
  commands: any;
  location: {
    type: string;
    coordinates: [number, number];
  };
  locationCheck: boolean;
}

export interface PhoneNumberDoc {
  _id: string;
  number: string;
  about: string | null;
  businessProfile: BusinessProfile;
  countryCode: string;
  date: string;
  isBusiness: boolean;
  isWAContact: boolean;
  profilePic: string;
  urlImage: string;
  distance: number;
}

export interface SearchMetadata {
  totalDocs: number | null;
  limit: number;
  page: number;
  totalPages: number | null;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  nextPage: number | null;
  prevPage: number | null;
  pagingCounter: number;
  searchCenter: {
    latitude: number;
    longitude: number;
    radiusInMeters: number;
  };
  resultCount: number;
  distanceRange: {
    closest: number;
    farthest: number;
  };
}

export interface PhoneProximitySearchResponse {
  success: boolean;
  data: {
    docs: PhoneNumberDoc[];
  } & SearchMetadata;
}
