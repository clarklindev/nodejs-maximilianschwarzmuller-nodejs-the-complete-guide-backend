import { beforeAll, describe, expect, it, afterEach } from 'vitest';
import sinon from 'sinon';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

import User from '../../../../src/lib/models/user';
import { signup } from '../../../../src/apis/auth/controllers/signup';
import { getEmailTransporter } from '../../../../src/lib/helpers/getEmailTransporter';

describe('apis/auth/controllers/signup()', () => {
  let req;
  let res;
  let name;
  let email;
  let password;
  let id;

  afterEach(() => {
    // Restore the default sandbox here
    sinon.restore();
  });

  beforeAll(async () => {
    req = {
      body: {
        data: {
          attributes: {
            name: 'tester',
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

    name = req.body.data.attributes.name;
    email = req.body.data.attributes.email;
    password = req.body.data.attributes.password;

    //user should not exist
    //stub User.
    sinon.stub(User, 'findOne');
    User.findOne.callsFake(() => {});

    id = new mongoose.Types.ObjectId().toString();

    //stub - saving to database and the returned data
    const saveStub = sinon.stub(User.prototype, 'save');
    saveStub.callsFake(() => {
      return {
        name: name,
        email: email,
        verified: false,
        password: 'hashed_abcdef',
        cart: { items: [] },
        products: [],
        _id: id,
      };
    });

    //------------------------------------------------
    const sendMailStub = sinon.stub(getEmailTransporter(), 'sendMail');
    sendMailStub.callsFake(() => {});

    //stub generating token
    const tokenStub = sinon.stub(jwt, 'sign');
    tokenStub.callsFake(() => {
      return '1234567890';
    });
  });

  it('should generate a token', async () => {
    const result = await signup(req, res, () => {});
    expect(result.data.id).toBe(id);
    expect(result.meta.token).not.toBeNull(); //token is 1234567890
  });
});
