import dayjs from 'dayjs';

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
