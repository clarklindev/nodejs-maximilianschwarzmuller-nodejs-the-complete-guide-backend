//getContacts
import { Request, Response, NextFunction } from 'express';

import Contact from '../../../lib/models/contact';
import { IError } from '../../../lib/interfaces/IError';
import { jsonApiSuccessResponseFromMongooseQuery } from '../../../lib/helpers/jsonApiSuccessResponseFromMongooseQuery';
import { IContact } from '../../../lib/interfaces/IContact';

export const getContactsByClientId = async (clientId: string): Promise<IContact[]> => {
  return await Contact.find({ clientId }).lean();
};

//------------------------------------------------------------------------------------------------

export const getContacts = async (req: Request, res: Response, next: NextFunction) => {
  const reqClientId = req.query.clientId as string;

  //1. get contacts
  let contacts: Array<IContact>;
  try {
    contacts = await getContactsByClientId(reqClientId);
    if (contacts.length === 0) {
      const error: IError = new Error('No contacts not found');
      error.statusCode = 404;
      return next(error);
    }
  } catch (err: any) {
    const error: IError = new Error('Server error');
    error.statusCode = 404;
    return next(error);
  }

  //2. format response
  const response = contacts.map((contact) => {
    return jsonApiSuccessResponseFromMongooseQuery(contact);
  });
  const formattedResponse = { data: response };

  //3. send response
  return res.status(200).json(formattedResponse);
};
