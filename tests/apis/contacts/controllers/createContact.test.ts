import { describe, expect, it, beforeAll, afterEach } from 'vitest';
import sinon from 'sinon';

import Contact from '../../../../src/lib/models/contact';
import { createContact, createNewContact } from '../../../../src/apis/contacts/controllers/createContact';

describe('createContact()', () => {
  let req;
  let res;
  let stubs;
  let resourceAttributes;
  let reqtenantId;

  beforeAll(async () => {
    req = {
      body: {
        data: {
          attributes: {
            email: 'test@test.com',
          },
        },
      },
      query: {
        tenantId: 123,
      },
    };

    res = {
      status: function (code) {
        return this;
      },
      json: function (data) {
        return data;
      },
    };

    stubs = {
      createNewContact,
    };

    resourceAttributes = req.body.data.attributes;
    reqtenantId = req.query.tenantId as string;
  });

  afterEach(() => {
    // Restore the default sandbox here
    sinon.restore();
  });

  it('should return an error if a contact exists', async () => {
    const { email } = resourceAttributes;

    // Create a spy on the `next` function
    const nextSpy = sinon.spy();

    const findOneStub = sinon.stub(Contact, 'findOne');
    findOneStub.callsFake(() => {
      return {
        email: 'test@test.com',
      };
    });

    await createContact(req, res, nextSpy);

    //Ensure that the `next` function was called with an error
    expect(nextSpy.calledOnce).toBe(true);
    expect(nextSpy.calledWithMatch(sinon.match.instanceOf(Error))).toBe(true);
    //check the error message
    const errorPassedToNext = nextSpy.args[0][0];
    expect(errorPassedToNext.message).toBe('account exists');
  });

  it('should return an error if failed to create contact', async () => {
    //stub - saving to database and the returned data

    const findOneStub = sinon.stub(Contact, 'findOne');
    findOneStub.returns(null);

    const saveStub = sinon.stub(Contact.prototype, 'save');
    saveStub.throws(new Error('Failed to create contact'));

    // Create a spy on the `next` function
    const nextSpy = sinon.spy();

    await createContact(req, res, nextSpy);

    //Ensure that the `next` function was called with an error
    expect(nextSpy.calledOnce).toBe(true);
    expect(nextSpy.calledWithMatch(sinon.match.instanceOf(Error))).toBe(true);
    //check the error message
    const errorPassedToNext = nextSpy.args[0][0];
    expect(errorPassedToNext.message).toBe('Failed to create contact');
  });

  it('should create new contact in database if createContact() completes successfully', async () => {
    const findResult = [{}];

    const contactStub = sinon.stub(Contact, 'find');
    contactStub.returns(findResult);

    const findOneStub = sinon.stub(Contact, 'findOne');
    findOneStub.returns(null);
    const saveStub = sinon.stub(Contact.prototype, 'save');
    saveStub.callsFake(() => {
      findResult.push({});
    });

    await createContact(req, res, () => {});
    const secondResult = await Contact.find();
    expect(secondResult.length).toBe(2);

    //check that save is called once.
  });
});
