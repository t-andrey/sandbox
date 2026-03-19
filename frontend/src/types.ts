export type PropertyType = 'akiya' | 'kominka' | 'noka' | 'vacant_land';
export type PropertyStatus = 'available' | 'negotiating' | 'sold' | 'reserved';
export type PropertyCondition = 'livable' | 'renovation_needed' | 'major_renovation' | 'teardown';

export interface Property {
  id: number;
  title_jp: string;
  title_en: string;
  prefecture: string;
  municipality: string;
  village_name: string | null;
  property_type: PropertyType;
  status: PropertyStatus;
  price_jpy: number;
  land_area_m2: number | null;
  building_area_m2: number | null;
  year_built: number | null;
  condition: PropertyCondition;
  distance_to_station_km: number | null;
  distance_to_convenience_store_km: number | null;
  has_akiya_bank_listing: boolean;
  akiya_bank_url: string | null;
  municipal_subsidy_jpy: number;
  tags: string[];
  description: string | null;
  notes: string | null;
  latitude: number | null;
  longitude: number | null;
  population_decline_pct: number | null;
  created_at: string;
  updated_at: string;
}

export interface PropertyCreate {
  title_jp: string;
  title_en: string;
  prefecture: string;
  municipality: string;
  village_name?: string;
  property_type: PropertyType;
  status: PropertyStatus;
  price_jpy: number;
  land_area_m2?: number;
  building_area_m2?: number;
  year_built?: number;
  condition: PropertyCondition;
  distance_to_station_km?: number;
  distance_to_convenience_store_km?: number;
  has_akiya_bank_listing: boolean;
  akiya_bank_url?: string;
  municipal_subsidy_jpy: number;
  tags: string[];
  description?: string;
  notes?: string;
  latitude?: number;
  longitude?: number;
  population_decline_pct?: number;
}

export interface Stats {
  total: number;
  available: number;
  negotiating: number;
  sold: number;
  reserved: number;
  free_properties: number;
  by_prefecture: Record<string, number>;
  by_type: Record<string, number>;
  by_condition: Record<string, number>;
  avg_price_jpy: number;
  avg_subsidy_jpy: number;
}

export interface PrefectureInfo {
  prefecture: string;
  count: number;
  available_count: number;
  avg_price_jpy: number;
}

export interface PropertyFilters {
  prefecture?: string;
  status?: PropertyStatus;
  property_type?: PropertyType;
  condition?: PropertyCondition;
  max_price?: number;
  min_price?: number;
  free_only?: boolean;
  has_subsidy?: boolean;
  has_akiya_bank?: boolean;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export const PROPERTY_TYPE_LABELS: Record<PropertyType, { jp: string; en: string; icon: string }> = {
  akiya: { jp: '空き家', en: 'Akiya', icon: '🏚️' },
  kominka: { jp: '古民家', en: 'Kominka', icon: '🏯' },
  noka: { jp: '農家', en: 'Noka', icon: '🌾' },
  vacant_land: { jp: '空き地', en: 'Vacant Land', icon: '🏞️' },
};

export const STATUS_LABELS: Record<PropertyStatus, { jp: string; en: string; color: string }> = {
  available: { jp: '空き', en: 'Available', color: 'green' },
  negotiating: { jp: '交渉中', en: 'Negotiating', color: 'yellow' },
  sold: { jp: '成約済', en: 'Sold', color: 'gray' },
  reserved: { jp: '予約済', en: 'Reserved', color: 'blue' },
};

export const CONDITION_LABELS: Record<PropertyCondition, { jp: string; en: string; severity: number }> = {
  livable: { jp: '居住可能', en: 'Livable', severity: 1 },
  renovation_needed: { jp: '要改修', en: 'Renovation Needed', severity: 2 },
  major_renovation: { jp: '大規模改修', en: 'Major Renovation', severity: 3 },
  teardown: { jp: '解体・建替え', en: 'Teardown', severity: 4 },
};

export const JAPANESE_PREFECTURES = [
  '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
  '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
  '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県',
  '静岡県', '愛知県', '三重県', '滋賀県', '京都府', '大阪府', '兵庫県',
  '奈良県', '和歌山県', '鳥取県', '島根県', '岡山県', '広島県', '山口県',
  '徳島県', '香川県', '愛媛県', '高知県', '福岡県', '佐賀県', '長崎県',
  '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県',
];
