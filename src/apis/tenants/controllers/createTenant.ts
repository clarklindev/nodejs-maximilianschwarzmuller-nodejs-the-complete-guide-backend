//createTenant
import mongoose from 'mongoose';
import { Request, Response, NextFunction } from 'express';

import Tenant from '../../../lib/models/tenant';
import { IError } from '../../../lib/interfaces/IError';
import { ITenant } from '../../../lib/interfaces/ITenant';
import { jsonApiSuccessResponseFromMongooseQuery } from '../../../lib/helpers/jsonApiSuccessResponseFromMongooseQuery';

export const createNewTenant = async (tenantData: Record<any, any>): Promise<ITenant> => {
  const tenant = new Tenant({
    ...tenantData,
  });
  await tenant.save();
  return tenant;
};

//------------------------------------------------------------------------------------------------

export const createTenant = async (req: Request, res: Response, next: NextFunction) => {
  const resourceAttributes: Record<string, any> = req.body.data.attributes;
  const { email } = resourceAttributes;

  //1. check if tenant already exists
  const tenant: ITenant | null = await Tenant.findOne({ email });
  if (tenant) {
    const error: IError = new Error('account exists');
    error.statusCode = 409; //conflict
    return next(error);
  }

  //2. create new tenant
  let newTenant: ITenant;
  try {
    newTenant = await createNewTenant(resourceAttributes);
  } catch (err: any) {
    const error: IError = new Error('Failed to create tenant');
    error.statusCode = 500;
    return next(error);
  }

  //3. format tenant response
  const response = jsonApiSuccessResponseFromMongooseQuery(newTenant);
  const formattedResponse = { data: response };

  //4. send response
  return res.status(201).json(formattedResponse);
};
