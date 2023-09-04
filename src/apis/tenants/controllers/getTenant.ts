//getTenant
import { Request, Response, NextFunction } from 'express';

import Tenant from '../../../lib/models/tenant';
import { IError } from '../../../lib/interfaces/IError';
import { ITenant } from '../../../lib/interfaces/ITenant';
import { jsonApiSuccessResponseFromMongooseQuery } from '../../../lib/helpers/jsonApiSuccessResponseFromMongooseQuery';

//------------------------------------------------------------------------------------------------

export const getTenant = async (req: Request, res: Response, next: NextFunction) => {
  const reqTenantId = req.params.id as string; //tenant/client

  //1. get tenant
  let tenant: ITenant | null;
  try {
    tenant = await Tenant.findOne({ _id: reqTenantId });
    if (tenant === null) {
      const error: IError = new Error('Tenant not found');
      error.statusCode = 404;
      return next(error);
    }
  } catch (err: any) {
    const error: IError = new Error('Server error');
    error.statusCode = 500;
    return next(error);
  }

  console.log('tenant:', tenant);

  //2. format response
  const response = jsonApiSuccessResponseFromMongooseQuery(tenant);
  const formattedResponse = { data: response };

  //3. send response
  return res.status(200).json(formattedResponse);
};
