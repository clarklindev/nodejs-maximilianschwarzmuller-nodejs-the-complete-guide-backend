import { Request, Response, NextFunction } from 'express';
import { jwtCheckIsTokenValid } from '../../../lib/helpers/jwtCheckIsTokenValid';

export const verifyLoginToken = async (req: Request, res: Response, next: NextFunction) => {
  //BACKEND: get login token from url (req.params)
  //FRONTEND: get login token from Auth context
  const { token } = req.params;

  const isLoginTokenValid = jwtCheckIsTokenValid(token); //check not expired
  const formattedResponse = {
    data: {
      type: 'user',
      attributes: {},
    },
    meta: {
      isLoginTokenValid,
    },
  };

  return res.status(200).json(formattedResponse);
};
