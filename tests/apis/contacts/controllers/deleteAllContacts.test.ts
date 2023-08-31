import { describe, expect, it, beforeAll, afterEach } from 'vitest';
import mongoose from 'mongoose';
import sinon from 'sinon';

import Contact from '../../../../src/lib/models/contact';
import { deleteAllContacts } from '../../../../src/apis/contacts/controllers/deleteAllContacts';

describe('deleteAllContacts()', () => {
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

    const stubDeleteMany = sinon.stub(Contact, 'deleteMany');
    stubDeleteMany.callsFake(() => {
      throw new Error();
    });

    await deleteAllContacts(req, res, nextSpy);
    expect(nextSpy.calledOnce).toBe(true);
    expect(nextSpy.calledWithMatch(sinon.match.instanceOf(Error))).toBe(true);
    //check the error message
    const errorPassedToNext = nextSpy.args[0][0];
    expect(errorPassedToNext.message).toBe('delete failed');
  });

  it('should delete all contacts of clientId from db', async () => {
    req = {
      query: {
        clientId: 12345,
      },
    };

    let dbContent = [
      {
        clientId: 12345,
      },

      {
        clientId: 321,
      },
    ];

    expect(dbContent).toHaveLength(2);

    const stubDeleteMany = sinon.stub(Contact, 'deleteMany');
    stubDeleteMany.callsFake(() => {
      //remove matching clientId entries from db
      dbContent = dbContent.filter((each) => {
        return each.clientId !== parseInt(req.query.clientId);
      });

      return { deletedCount: 1 };
    });

    await deleteAllContacts(req, res, () => {});
    expect(dbContent).toHaveLength(1);
  });
});
