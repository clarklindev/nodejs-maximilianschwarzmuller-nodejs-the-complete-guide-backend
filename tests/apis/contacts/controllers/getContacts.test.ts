import { describe, expect, it, beforeAll, afterEach } from 'vitest';
import sinon from 'sinon';
import mongoose from 'mongoose';

import Contact from '../../../../src/lib/models/contact';
import { getContacts, getContactsBytenantId } from '../../../../src/apis/contacts/controllers/getContacts';

describe('getContacts()', () => {
  let req;
  let res;
  let stubs;

  beforeAll(() => {
    req = {
      query: {
        tenantId: mongoose.Types.ObjectId.createFromHexString('1234567890abcdef12345678'),
      },
      params: {
        id: 1,
      },
    };

    res = {
      status: function (code) {
        this.statusCode = code;
        return this;
      },
      json: function (data) {
        return data;
      },
    };

    stubs = {
      getContactsBytenantId,
    };
  });

  afterEach(() => {
    // Restore the default sandbox here
    sinon.restore();
  });

  it('should throw an error when fetching contact fails', async () => {
    const findStub = sinon.stub(Contact, 'find');
    findStub.callsFake(() => {
      // Create a fake Mongoose query object
      throw new Error('Server error');
    });

    const nextSpy = sinon.spy();

    await getContacts(req, res, nextSpy);

    expect(nextSpy.calledOnce).toBe(true);
    expect(nextSpy.calledWithMatch(sinon.match.instanceOf(Error))).toBe(true);
    //check the error message
    const errorPassedToNext = nextSpy.args[0][0];
    expect(errorPassedToNext.message).toBe('Server error');
  });

  it('should throw an error when contact not found', async () => {
    const findStub = sinon.stub(Contact, 'find');
    findStub.callsFake(() => {
      // Create a fake Mongoose query object
      const fakeQuery = {
        lean: sinon.stub().returns([]),
      };
      return fakeQuery;
    });

    const nextSpy = sinon.spy();
    await getContacts(req, res, nextSpy);

    expect(nextSpy.calledOnce).toBe(true);
    expect(nextSpy.calledWithMatch(sinon.match.instanceOf(Error))).toBe(true);
    // //check the error message
    const errorPassedToNext = nextSpy.args[0][0];
    expect(errorPassedToNext.message).toBe('No contacts not found');
  });

  it('should return the contacts requested', async () => {
    const dbContent = [
      {
        email: 'test@test.com',
        tenantId: mongoose.Types.ObjectId.createFromHexString('1234567890abcdef12345678'),
        createdAt: new Date(),
        updatedAt: new Date(),
        _id: 1,
      },
      {
        email: 'test2@test2.com',
        tenantId: new mongoose.Types.ObjectId(321),
        createdAt: new Date(),
        updatedAt: new Date(),
        _id: 2,
      },
    ];

    const findStub = sinon.stub(Contact, 'find');
    findStub.callsFake(() => {
      const fakeQuery = {
        lean: sinon.stub().returns(
          dbContent.filter((each) => {
            return each.tenantId.toString() === req.query.tenantId.toString();
          }),
        ),
      };
      return fakeQuery;
    });

    const nextSpy = sinon.spy();
    const result = await getContacts(req, res, nextSpy);
    expect(result.data).toHaveLength(1);
  });
});
