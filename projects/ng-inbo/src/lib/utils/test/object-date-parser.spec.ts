// export const parseDates = <T>(response: T, dateFields: Array<keyof T>): T => {
//   let result: T = {...response};
//   dateFields.forEach(dateField => {
//     const dateFieldValue = response[dateField];
//     if (typeof dateFieldValue === 'string') {
//       const parsedDate = parseISO(dateFieldValue as string);
//       result = {
//         ...result,
//         ...(isValid(parsedDate) ? {[dateField]: parsedDate} : {}),
//       };
//     }
//   });
//
//   return result;
// };

import {parseDates} from '../http-response-date-parser';
import {parseISO} from 'date-fns';

describe('parseDates', () => {

  const validIsoDate = '2023-02-08';
  const invalidIsoDate = '2023-02bla-08';

  it('should parse the given properties as dates if they are valid ISO strings', () => {
    const testObject = {
      a: validIsoDate,
    };

    const actual = parseDates(testObject, ['a']);

    expect(actual.a as any).toEqual(parseISO(validIsoDate));
  });

  it('should leave properties as they are if the given property is not a valid ISO string', () => {
    const testObject = {
      a: invalidIsoDate,
    };

    const actual = parseDates(testObject, ['a']);

    expect(actual).toEqual(testObject);
  });

  it('should leave properties as they are if the given property is not a string', () => {
    const testObject = {
      a: 5,
    };

    const actual = parseDates(testObject, ['a']);

    expect(actual).toEqual(testObject);
  });

});
