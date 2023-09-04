//createContact
import mongoose from 'mongoose';
import { Request, Response, NextFunction } from 'express';

import Contact from '../../../lib/models/contact';
import { IError } from '../../../lib/interfaces/IError';
import { IContact } from '../../../lib/interfaces/IContact';
import { jsonApiSuccessResponseFromMongooseQuery } from '../../../lib/helpers/jsonApiSuccessResponseFromMongooseQuery';

export const createNewContact = async (contactData: Record<any, any>, tenantId: string): Promise<IContact> => {
  const contact = new Contact({
    ...contactData,
    tenantId: new mongoose.Types.ObjectId(tenantId),
  });
  await contact.save();
  return contact;
};

//------------------------------------------------------------------------------------------------

export const createContact = async (req: Request, res: Response, next: NextFunction) => {
  const reqTenantId = req.query.tenantId as string;
  const resourceAttributes: Record<string, any> = req.body.data.attributes;
  const { email } = resourceAttributes;

  //1. check if contact already exists
  const contact: IContact | null = await Contact.findOne({ email });
  if (contact) {
    const error: IError = new Error('account exists');
    error.statusCode = 409; //conflict
    return next(error);
  }

  //2. create new contact
  let newContact: IContact;
  try {
    newContact = await createNewContact(resourceAttributes, reqTenantId);
  } catch (err: any) {
    const error: IError = new Error('Failed to create contact');
    error.statusCode = 500;
    return next(error);
  }

  //3. format contact response
  const response = jsonApiSuccessResponseFromMongooseQuery(newContact);
  const formattedResponse = { data: response };

  //4. send response
  return res.status(201).json(formattedResponse);
};
