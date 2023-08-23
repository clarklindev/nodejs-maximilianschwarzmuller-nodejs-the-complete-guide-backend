import { expect, describe, it, beforeAll, afterEach } from 'vitest';
import sinon from 'sinon';
import mongoose from 'mongoose';

import User from '../../../../src/lib/models/user';
import { getEmailTransporter } from '../../../../src/lib/helpers/getEmailTransporter';
import { resetPassword } from '../../../../src/apis/auth/controllers/resetPassword';

describe('apis/auth/controllers/resetPassword()', () => {
  let req;
  let res;
  let user;
  let id;

  afterEach(() => {
    // Restore the default sandbox here
    sinon.restore();
  });

  beforeAll(() => {
    req = {
      body: {
        data: {
          attributes: {
            email: 'test@test.com',
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

    user = new User({
      email: 'test@gmail.com',
      password: '123',
      username: 'tester',
      verified: false,
      userId: '1',
      _id: '1',
    });

    sinon.stub(User, 'findOne').callsFake(() => {
      return user;
    });

    id = new mongoose.Types.ObjectId().toString();

    //stub - saving to database and the returned data
    const saveStub = sinon.stub(User.prototype, 'save');
    saveStub.callsFake(() => {
      return {
        username: user.username,
        email: user.email,
        verified: false,
        password: 'hashed_abcdef',
        cart: { items: [] },
        products: [],
        _id: id,
      };
    });

    const sendMailStub = sinon.stub(getEmailTransporter(), 'sendMail');
    sendMailStub.callsFake(() => {});
  });

  it('should reset the password', async () => {
    const result = await resetPassword(req, res, () => {});
    expect(result.meta.status).toBe('success');
  });
});
