//updateTenant
import mongoose from 'mongoose';
import { Request, Response, NextFunction } from 'express';

import Tenant from '../../../lib/models/tenant';
import { IError } from '../../../lib/interfaces/IError';
import { ITenant } from '../../../lib/interfaces/ITenant';
import DateHelper from '../../../lib/helpers/DateHelper';
import { jsonApiSuccessResponseFromMongooseQuery } from '../../../lib/helpers/jsonApiSuccessResponseFromMongooseQuery';

export const updateTenantById = async (
  tenantId: string,
  updateAttributes: Record<string, any>,
): Promise<ITenant | null> => {
  const updatedDocument = await Tenant.findOneAndUpdate(
    { _id: new mongoose.Types.ObjectId(tenantId) },
    { ...updateAttributes, updatedAt: DateHelper.jsDateNowToUnixEpoch(Date.now()) },
    {
      timeStamps: false,
      lean: false, //later just use ._doc to reduce content of query
      new: true,
    },
  );
  return updatedDocument;
};

//------------------------------------------------------------------------------------------------

export const updateTenant = async (req: Request, res: Response, next: NextFunction) => {
  const reqTenantId = req.params.id as string;
  const resourceAttributes = req.body.data.attributes;

  //1. find AND update tenant
  let tenant: ITenant | null;
  try {
    tenant = await updateTenantById(reqTenantId, resourceAttributes);
    if (tenant === null) {
      const error: IError = new Error('update failed: possibly tenantId / tenantId invalid');
      error.statusCode = 404;
      return next(error);
    }
  } catch (err: any) {
    const error: IError = new Error(err.message);
    error.statusCode = err.status;
    return next(error);
  }

  //2. format response
  const response = jsonApiSuccessResponseFromMongooseQuery(tenant);
  const formattedResponse = { data: response };
  //3. send response
  return res.status(200).json(formattedResponse);
};
