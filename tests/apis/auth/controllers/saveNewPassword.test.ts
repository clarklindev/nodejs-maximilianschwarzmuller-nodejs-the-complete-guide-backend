import { expect, describe, it, beforeAll, afterEach } from 'vitest';
import sinon from 'sinon';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

import User from '../../../../src/lib/models/user';
import * as saveNewPassword from '../../../../src/apis/auth/controllers/saveNewPassword';

describe('apis/auth/controllers/saveNewPassword()', () => {
  let req;
  let res;
  let user;

  beforeAll(() => {
    req = {
      body: {
        data: {
          attributes: {
            password: 'updatedpassword',
          },
        },
      },
      params: {
        token: '123456789',
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
    sinon.restore();
  });

  const oldPassword = 'hashed_abcdef';
  user = new User({
    username: 'test',
    email: 'test@test.com',
    verified: false,
    password: oldPassword,
    cart: { items: [] },
    products: [],
  });

  //stub User.
  sinon.stub(User, 'findOne');
  User.findOne.callsFake(() => {
    return user;
  });

  //stub - saving to database and the returned data
  const saveStub = sinon.stub(User.prototype, 'save');
  saveStub.callsFake(() => {
    return;
  });

  //stub authentication
  const hashPassStub = sinon.stub(bcrypt, 'hash');
  hashPassStub.returns('hashedpassword');

  it('should update the password', async () => {
    const result = await saveNewPassword.saveNewPassword(req, res, () => {});
    expect(result).not.toBeNull();
    expect(user.password).toEqual('hashedpassword');
  });
});
