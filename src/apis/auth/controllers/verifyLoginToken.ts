import { Request, Response, NextFunction } from 'express';
import { jwtCheckIsTokenValid } from '../../../lib/helpers/jwtCheckIsTokenValid';

export const verifyLoginToken = async (req: Request, res: Response, next: NextFunction) => {
  //BACKEND: login token comes from req.params
  //FRONTEND: login token comes from Auth context
  const { token } = req.params;

  const isLoginTokenValid = jwtCheckIsTokenValid(token); //check not expired
  console.log('server isLoginTokenValid: ', isLoginTokenValid);
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
