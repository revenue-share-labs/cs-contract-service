import { getUtcDate } from './date.util';

describe('DateUtil', () => {
  it('should return utc date', () => {
    const result = getUtcDate();
    const expected = new Date(getUtcDate().toUTCString());

    expect(result).toEqual(expected);
  });
});
