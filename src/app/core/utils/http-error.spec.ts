/* test utility getHttpStatus */

import { getHttpStatus } from './http-error';

describe('getHttpStatus', () => {
  it('should return undefined when error is null', () => {
    expect(getHttpStatus(null)).toBeUndefined();
  });

  it('should return undefined when error is not object', () => {
    expect(getHttpStatus('errore')).toBeUndefined();
  });

  it('should return undefined when status property is missing', () => {
    expect(getHttpStatus({ message: 'x' })).toBeUndefined();
  });

  it('should return undefined when status is not a number', () => {
    expect(getHttpStatus({ status: '401' })).toBeUndefined();
  });

  it('should return numeric status when valid', () => {
    expect(getHttpStatus({ status: 404 })).toBe(404);
  });
});
