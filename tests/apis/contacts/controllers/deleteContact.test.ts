import { describe, expect, it, afterEach } from 'vitest';
import mongoose from 'mongoose';
import sinon from 'sinon';

import Contact from '../../../../src/lib/models/contact';
import { deleteContact } from '../../../../src/apis/contacts/controllers/deleteContact';

describe('deleteContact()', () => {
  let req;
  let res;

  afterEach(() => {
    // Restore the default sandbox here
    sinon.restore();
  });

  it('should throw an error if delete from db call fails', async () => {
    const dbContent = [{}];

    req = {
      query: {
        clientId: new mongoose.Types.ObjectId(),
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

    // Create a spy on the `next` function
    const nextSpy = sinon.spy();

    const stubDelete = sinon.stub(Contact, 'findOneAndDelete');
    stubDelete.callsFake(() => {
      throw new Error();
    });

    await deleteContact(req, res, nextSpy);
    expect(nextSpy.calledOnce).toBe(true);
    expect(nextSpy.calledWithMatch(sinon.match.instanceOf(Error))).toBe(true);
    //check the error message
    const errorPassedToNext = nextSpy.args[0][0];
    expect(errorPassedToNext.message).toBe('Delete failed');
  });

  it('should delete all contacts of clientId with specific id from db', async () => {
    req = {
      query: {
        clientId: 12345,
      },
      params: {
        id: 1,
      },
    };

    let dbContent = [
      {
        clientId: 12345,
        _id: 1,
      },

      {
        clientId: 12345,
        _id: 2,
      },

      {
        clientId: 321,
        _id: 3,
      },
    ];

    expect(dbContent).toHaveLength(3);

    const stubDelete = sinon.stub(Contact, 'findOneAndDelete');
    stubDelete.callsFake(() => {
      //remove matching clientId entries from db
      dbContent = dbContent.filter((each) => {
        return !(each.clientId === parseInt(req.query.clientId) && each._id === parseInt(req.params.id));
      });

      return { deletedCount: 1 };
    });

    await deleteContact(req, res, () => {});
    expect(dbContent).toHaveLength(2);
  });
});
