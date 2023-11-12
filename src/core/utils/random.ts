import dayjs from 'dayjs';
import { CityNames } from '../../types/city.type.js';

export const getRandomNumber = (min: number, max: number, numAfterDigit = 0): number | typeof NaN => {
  if ((!Number.isFinite(min) || !Number.isFinite(max)) || (min < 0 || max < 0)) {
    return NaN;
  }
  const lowerBound = Math.min(min, max);
  const upperBound = Math.max(min, max);
  return +(Math.random() * (upperBound - lowerBound) + lowerBound).toFixed(numAfterDigit);
};
export const getRandomArrItem = <T>(array: T[]): T =>
  array[getRandomNumber(0, array.length - 1)];
export const getRandomArrItems = <T>(array: T[], count?: number): T[] => {
  const itemsCount = (count === undefined) ? getRandomNumber(1, array.length - 1) : count;
  const uniqueSourceArray = Array.from(new Set(array));
  if (itemsCount > uniqueSourceArray.length) {
    return uniqueSourceArray;
  }
  const resultElements: T[] = [];
  for (let i = 0; i < itemsCount; i++) {
    let element = getRandomArrItem(uniqueSourceArray);
    while (resultElements.includes(element)){
      element = getRandomArrItem(uniqueSourceArray);
    }
    resultElements.push(element);
  }
  return resultElements;
};
export const getRandomOfferDate = () : dayjs.Dayjs => {
  const fromDate = '2020-06-10T11:00:00+01:00';
  const toDate = '2023-05-07T11:00:00+01:00';
  const fromInMillis = dayjs(fromDate).valueOf();
  const max = dayjs(toDate).valueOf() - fromInMillis;
  const dateOffset = Math.floor(Math.random() * max + 1);
  const newDate = dayjs(fromInMillis + dateOffset);
  return dayjs(newDate);
};

const COORDS_RANGE = {
  [CityNames.Paris]: {
    latitude: {
      min: 48.823413,
      max: 48.899293
    },
    longitude: {
      min: 2.282930,
      max: 2.403663
    }
  },

  [CityNames.Cologne]: {
    latitude: {
      min: 50.916726,
      max: 50.986858
    },
    longitude: {
      min: 6.886408,
      max: 7.012258
    }
  },

  [CityNames.Brussels]: {
    latitude: {
      min: 50.802021,
      max: 50.889017
    },
    longitude: {
      min: 4.302077,
      max: 4.420559
    }
  },

  [CityNames.Amsterdam]: {
    latitude: {
      min: 52.341203,
      max: 52.422435
    },
    longitude: {
      min: 4.788972,
      max: 4.946889
    }
  },

  [CityNames.Hamburg]: {
    latitude: {
      min: 53.518013,
      max: 53.586607
    },
    longitude: {
      min: 9.920475,
      max: 10.101841
    }
  },

  [CityNames.Dusseldorf]: {
    latitude: {
      min: 51.176111,
      max: 51.268527
    },
    longitude: {
      min: 6.747162,
      max: 6.878681
    }
  }
};

const COORD_DIGITS_COUNT = 6;

export function generateRandomLocation(city: CityNames){
  const latitude = getRandomNumber(COORDS_RANGE[city].latitude.min, COORDS_RANGE[city].latitude.max, COORD_DIGITS_COUNT);
  const longitude = getRandomNumber(COORDS_RANGE[city].longitude.min, COORDS_RANGE[city].longitude.max, COORD_DIGITS_COUNT);

  return {latitude, longitude};
}
