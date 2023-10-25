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
