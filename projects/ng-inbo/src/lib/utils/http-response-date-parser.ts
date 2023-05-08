import {isValid, parseISO} from 'date-fns';

/*
* This is a handy utility to parse dates from json responses from http calls. Date fields are usually returned as ISO strings from the backend, and cannot be automatically parsed to dates,
* since the http client has no idea that a property is supposed to be a date (all typing info is gone at runtime). This utility hopes to solve the need to write the same date parsing for every
* response that contains date fields, by passing the response object and the fields that are supposed to be parsed.
*
* If a given field is not a string, or it is undefined or null, it will just be returned as is.
* */
export const parseDates = <T>(response: T, dateFields: Array<keyof T>): T => {
  let result: T = {...response};
  dateFields.forEach(dateField => {
    const dateFieldValue = response[dateField];
    if (typeof dateFieldValue === 'string') {
      const parsedDate = parseISO(dateFieldValue as string);
      result = {
        ...result,
        ...(isValid(parsedDate) ? {[dateField]: parsedDate} : {}),
      };
    }
  });

  return result;
};
