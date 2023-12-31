import { it, expect, describe } from 'vitest';
import jwt from 'jsonwebtoken';

import { isAuth } from '../../../src/lib/middleware/isAuth';
import sinon from 'sinon';

describe('isAuth()', () => {
  it('should throw an error if there is no request authorisation header present', () => {
    const req = {
      get: (x) => {
        if (x === 'Authorization') {
          return undefined;
        }
      },
    };
    expect(() => isAuth(req, {}, () => {})).toThrowError('Authorization error');
  });

  it('should throw an error if the authorization header is a string', () => {
    //"stub"
    const req = {
      get: (headerName) => {
        return 'abc';
      },
    };
    expect(() => isAuth(req, {}, () => {})).toThrow(); //expect a throw error...
  });

  it('should throw an error if the token cannot be verified', () => {
    const req = {
      get: () => {
        return 'Bearer xyz';
      },
    };

    expect(() => isAuth(req, {}, () => {})).toThrow();
  });

  it('should yield a token after passing authorization', () => {
    const req = {
      get: () => {
        return 'Bearer abc';
      },
    };

    //ANTIPATTERN: override jwt.verify()
    // jwt.verify = () => {
    //   return { userId: 'abc' };
    // };

    //SOLUTION: rather use stub method
    // Mock jwt.verify inside jsonwebtoken module
    sinon.stub(jwt, 'verify');
    jwt.verify.returns({ token: 'abc' });

    isAuth(req, {}, () => {});
    expect(req).toHaveProperty('token');
    expect(jwt.verify.called).toBe(true);
    jwt.verify.restore();
  });
});
