//deleteTenant
import { Request, Response, NextFunction } from 'express';

import Tenant from '../../../lib/models/tenant';
import { IError } from '../../../lib/interfaces/IError';
import { ITenant } from '../../../lib/interfaces/ITenant';

//------------------------------------------------------------------------------------------------

export const deleteTenant = async (req: Request, res: Response, next: NextFunction) => {
  const tenantId = req.params.id as string;

  //1. delete tenant
  let result: ITenant | null;
  try {
    result = await Tenant.findOneAndDelete({ _id: tenantId });
  } catch (err: any) {
    const error: IError = new Error('Delete failed');
    error.statusCode = err.status;
    return next(error);
  }

  //2. format result
  // NOTE: findOneAndDelete, findByIdAndDelete, or deleteOne,
  //the returned value is not the actual document object itself. Instead, it's typically a JavaScript object that provides information about the deletion operation, such as the number of documents affected or whether the operation was successful.
  // If you want to access the content of the deleted document itself, including all its properties, you can use the ._doc property on the returned value, just as you would when accessing the document after a query.
  let formattedResponse = {};

  if (result) {
    const { _id, ...restAttributes } = result._doc;

    formattedResponse = {
      data: {
        id: _id,
        type: 'tenant',
        attributes: { ...restAttributes },
      },
      meta: {
        message: 'Successfully deleted',
      },
    };
  }

  //3. send response
  return res.status(200).json(formattedResponse);
};
