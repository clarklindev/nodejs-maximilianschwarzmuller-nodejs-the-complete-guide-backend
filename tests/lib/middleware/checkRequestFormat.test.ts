import { it, expect, describe, vi } from 'vitest';

import { checkRequestFormat } from '../../../src/lib/middleware/checkRequestFormat';

describe('checkRequestFormat()', () => {
  it('should return an error from next() if received request is not valid jsonapi', () => {
    const req = {
      // Simulating an incorrect JSON API request format
      something: {},
    };

    const next = error => {
      expect(error.message).toBe('form data should be sent in JsonApi format');
    };

    checkRequestFormat(req, {}, next);
  });

  it('should call next() if received request is valid jsonapi', () => {
    const req = {
      body: {
        data: {
          attributes: {},
        },
      },
    };

    const methods = {
      next: () => {},
    };
    const spy = vi.spyOn(methods, 'next');

    checkRequestFormat(req, {}, methods.next);
    expect(spy).toHaveBeenCalled();
  });
});
