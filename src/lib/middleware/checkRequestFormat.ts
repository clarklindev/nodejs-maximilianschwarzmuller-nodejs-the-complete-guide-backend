import { Request, Response, NextFunction } from 'express';
import { IError } from '../interfaces/IError';

export const checkRequestFormat = (req: Request, res: Response, next: NextFunction) => {
  if (!req?.body?.data?.attributes) {
    const error: IError = new Error('form data should be sent in JsonApi format');
    error.statusCode = 422;
    return next(error);
  }
  return next();
};
