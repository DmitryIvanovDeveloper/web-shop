export interface ProductApiDto {
  id: string;
  mainImage: string | null;
  backgroundImage: string | null;
  title: string;
  titleStyle?: Record<string, unknown>;
  rarity?: string | null;
  discount?: string | null;
  playerLimit?: string | null;
  timer?: string;
  price?: number;
  rpBonus?: number;
  lpBonus?: number;
  appid: string;
}

export interface PurchasesApiResponseDto {
  productIds: string[];
}


