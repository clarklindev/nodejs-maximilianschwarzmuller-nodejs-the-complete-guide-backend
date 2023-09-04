import { describe, expect, it, expectTypeOf, beforeAll, afterEach } from 'vitest';
import sinon from 'sinon';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import User from '../../../../src/lib/models/user';
import { login } from '../../../../src/apis/auth/controllers/login';

describe('apis/auth//login()', () => {
  let req;
  let res;

  beforeAll(() => {
    req = {
      body: {
        data: {
          attributes: {
            email: 'test@gmail.com',
            password: '123',
          },
        },
      },
    };

    res = {
      statusCode: 500,
      status: function (code) {
        this.statusCode = code;
        return this;
      },
      json: function (data) {
        return data;
      },
    };
  });

  afterEach(() => {
    // Restore the default sandbox here
    sinon.restore();
  });

  it('should return a jsonapi response that includes the token', async () => {
    //stub User.
    sinon.stub(User, 'findOne');
    User.findOne.returns({
      email: 'test@gmail.com',
      password: '123',
      name: 'tester',
      verified: false,
      userId: '1',
      _id: '1',
    });

    const user = await User.findOne();
    expectTypeOf(user).toBeObject();
    expect(user).toHaveProperty('email', 'test@gmail.com');
    expect(user).toHaveProperty('password', '123');

    //stub authentication
    const authStub = sinon.stub(bcrypt, 'compare');
    authStub.returns(true);

    //stub generating token
    const tokenStub = sinon.stub(jwt, 'sign');
    tokenStub.returns('abc');

    const result = await login(req, res, () => {});
    expect(result).toEqual({
      data: {
        id: '1',
        type: 'user',
        attributes: {
          name: 'tester',
          email: 'test@gmail.com',
        },
      },
      meta: {
        token: 'abc',
        message: 'User successfully logged in.',
      },
    });
  });
});
