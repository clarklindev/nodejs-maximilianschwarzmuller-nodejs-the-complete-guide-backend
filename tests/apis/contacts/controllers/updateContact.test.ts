import { describe, expect, it, beforeAll, afterEach } from 'vitest';
import mongoose from 'mongoose';
import sinon from 'sinon';

import Contact from '../../../../src/lib/models/contact';
import { updateContact, updateContactById } from '../../../../src/apis/contacts/controllers/updateContact';
import { IContact } from '../../../../src/lib/interfaces/IContact';
describe('updateContact()', () => {
  let req;
  let res;
  let stubs;

  beforeAll(() => {
    req = {
      query: {
        tenantId: '5f9d2e5f8df7f4359023646c',
      },
      params: {
        id: mongoose.Types.ObjectId.createFromHexString('1234567890abcdef12345678'),
      },
      body: {
        data: {
          attributes: {
            firstName: 'Test',
          },
        },
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
      updateContactById,
    };
  });

  afterEach(() => {
    // Restore the default sandbox here
    sinon.restore();
  });

  //fix: statements.
  it('should return an error if invalid req data', async () => {
    const findAndUpdateStub = sinon.stub(Contact, 'findOneAndUpdate');
    findAndUpdateStub.callsFake(() => {
      throw new Error('findOneAndUpdate failed');
    });

    const nextSpy = sinon.spy();

    await updateContact(req, res, nextSpy);

    expect(nextSpy.calledOnce).toBe(true);
    expect(nextSpy.calledWithMatch(sinon.match.instanceOf(Error))).toBe(true);
    //check the error message
    const errorPassedToNext = nextSpy.args[0][0];
    expect(errorPassedToNext.message).toBe('findOneAndUpdate failed');
  });

  it('should return an error if req id or tenantId invalid', async () => {
    const findAndUpdateStub = sinon.stub(Contact, 'findOneAndUpdate');
    findAndUpdateStub.callsFake(() => {
      return null;
    });

    const nextSpy = sinon.spy();

    await updateContact(req, res, nextSpy);

    expect(nextSpy.calledOnce).toBe(true);
    expect(nextSpy.calledWithMatch(sinon.match.instanceOf(Error))).toBe(true);
    //check the error message
    const errorPassedToNext = nextSpy.args[0][0];
    expect(errorPassedToNext.message).toBe('update failed: possibly tenantId / contactId invalid');
  });

  it('should update contact', async () => {
    const updatedContact = {
      email: 'test@test.com',
      tenantId: '5f9d2e5f8df7f4359023646c',
      _id: mongoose.Types.ObjectId.createFromHexString('1234567890abcdef12345678'),
      firstName: req.body.data.attributes.firstName, // Make sure req.body.data.attributes.firstName is defined
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Map the properties to match the schema and create the Mongoose document
    const mappedContact = new Contact({
      email: updatedContact.email,
      tenantId: updatedContact.tenantId,
      _id: updatedContact._id,
      firstName: updatedContact.firstName,
      createdAt: updatedContact.createdAt,
      updatedAt: updatedContact.updatedAt,
    });

    const findAndUpdateStub = sinon.stub(Contact, 'findOneAndUpdate');
    findAndUpdateStub.callsFake(() => {
      return mappedContact;
    });

    const result = await updateContact(req, res, () => {});
    expect(result.data.attributes.firstName).toEqual(updatedContact.firstName);
  });
});
