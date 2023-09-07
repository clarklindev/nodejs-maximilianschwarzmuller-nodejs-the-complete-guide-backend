// login
import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';

import User from '../../../lib/models/user';
import { IUser } from '../../../lib/interfaces/IUser';
import { IError } from '../../../lib/interfaces/IError';
import { jwtCreateToken } from '../../../lib/helpers/jwtCreateToken';
//------------------------------------------------------------------------------------------------

export const login = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body.data.attributes;

  //1. make sure user exists
  const user: IUser | null = await User.findOne({ email }).select('+password'); //explicitly specify the field in your query to include it in the result
  if (!user) {
    const error: IError = new Error('User does not exist');
    error.title = 'authentication error';
    error.statusCode = 404;
    return next(error);
  }
  if (!user.password) {
    const error: IError = new Error('try reset password');
    error.title = 'authentication error';
    error.statusCode = 404;
    return next(error);
  }

  //2. authenticate user
  const authenticated = await bcrypt.compare(password, user.password);
  if (!authenticated) {
    const error: IError = new Error('account details invalid');
    error.statusCode = 401;
    return next(error);
  }

  //3. generate token with a payload
  const payload = {
    name: user.name,
    email: user.email,
    userId: user._id.toString(),
    verified: user.verified,
  };

  let token;
  try {
    token = await jwtCreateToken(payload);
  } catch (err: any) {
    const error: IError = new Error('generate token failed');
    error.statusCode = err.status;
    return next(error);
  }

  //4. send response including token
  const formattedResponse = {
    data: {
      id: user._id.toString(),
      type: 'user',
      attributes: {
        name: user.name,
        email: user.email,
      },
    },
    meta: {
      token,
      message: 'User successfully logged in.',
    },
  };
  return res.status(200).json(formattedResponse);
};
