import { City } from '../../types/city.type.js';

export const Cities: Record<string, City> = {
  Paris: {
    name: 'Paris',
    latitude: 48.85661,
    longitude: 2.351499
  },

  Cologne: {
    name: 'Cologne',
    latitude: 50.938361,
    longitude: 6.959974
  },

  Amsterdam: {
    name: 'Amsterdam',
    latitude: 52.370216,
    longitude: 4.895168
  },

  Hamburg: {
    name: 'Hamburg',
    latitude: 53.550341,
    longitude: 10.000654
  },

  Dusseldorf: {
    name: 'Dusseldorf',
    latitude: 51.225402,
    longitude: 6.776314
  },

  Brussels: {
    name: 'Brussels',
    latitude: 50.846557,
    longitude: 4.351697
  },
} as const;

export const DEFAULT_OFFERS_COUNT = 60;
export const MAX_PREMIUM_OFFERS_COUNT = 3;
export const DEFAULT_PREVIEW_IMAGE = 'default-preview.png';

export enum TITLE_LENGTH {
  MIN = 10,
  MAX = 100
}

export enum DESCRIPTION_LENGTH {
  MIN = 20,
  MAX = 1024
}

export enum BEDROOMS_COUNT {
  MIN = 1,
  MAX = 8
}

export enum ADULTS_COUNT {
  MIN = 1,
  MAX = 10
}

export enum OFFER_PRICE {
  MIN = 100,
  MAX = 100_000
}

export enum OFFER_RATING {
  MIN = 0,
  MAX = 5
}

export const MIN_GOODS_COUNT = 1;
export const IMAGES_COUNT = 6;
