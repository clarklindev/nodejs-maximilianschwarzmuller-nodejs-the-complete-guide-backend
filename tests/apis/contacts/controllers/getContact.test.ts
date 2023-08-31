import { describe, expect, it, beforeAll, afterEach } from 'vitest';
import sinon from 'sinon';
import mongoose from 'mongoose';

import Contact from '../../../../src/lib/models/contact';
import { getContact, getContactById } from '../../../../src/apis/contacts/controllers/getContact';

describe('getContact()', () => {
  let req;
  let res;
  let stubs;

  beforeAll(() => {
    req = {
      query: {
        clientId: 123,
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
      getContactById,
    };
  });

  afterEach(() => {
    // Restore the default sandbox here
    sinon.restore();
  });

  it('should throw an error when fetching contact fails', async () => {
    const findStub = sinon.stub(Contact, 'findOne');
    findStub.callsFake(() => {
      throw new Error();
    });

    const nextSpy = sinon.spy();

    await getContact(req, res, nextSpy);

    expect(nextSpy.calledOnce).toBe(true);
    expect(nextSpy.calledWithMatch(sinon.match.instanceOf(Error))).toBe(true);
    //check the error message
    const errorPassedToNext = nextSpy.args[0][0];
    expect(errorPassedToNext.message).toBe('Server error');
  });

  it('should throw an error when contact not found', async () => {
    const findStub = sinon.stub(Contact, 'findOne');
    findStub.callsFake(() => {
      // Create a fake Mongoose query object
      const fakeQuery = {
        lean: sinon.stub().returns(null), // Replace null with the desired behavior
      };
      return fakeQuery;
    });

    const getContactStub = sinon.stub(stubs, 'getContactById');
    getContactStub.callsFake(() => {
      return null;
    });

    const nextSpy = sinon.spy();
    await getContact(req, res, nextSpy);

    expect(nextSpy.calledOnce).toBe(true);
    expect(nextSpy.calledWithMatch(sinon.match.instanceOf(Error))).toBe(true);
    // //check the error message
    const errorPassedToNext = nextSpy.args[0][0];
    expect(errorPassedToNext.message).toBe('Contact not found');
  });

  it('should return the contact requested', async () => {
    const contact = {
      email: 'test@test.com',
      clientId: new mongoose.Types.ObjectId(),
      createdAt: new Date(),
      updatedAt: new Date(),
      _id: 1,
    };
    const dbContent = [contact];

    const findStub = sinon.stub(Contact, 'findOne');
    findStub.callsFake(() => {
      // Create a fake Mongoose query object
      const fakeQuery = {
        lean: sinon.stub().returns(contact), // Replace null with the desired behavior
      };
      return fakeQuery;
    });

    const nextSpy = sinon.spy();
    const result = await getContact(req, res, nextSpy);
    expect(result).not.toBe(null);
  });
});
