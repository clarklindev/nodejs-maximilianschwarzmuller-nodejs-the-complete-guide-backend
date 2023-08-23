// signup
import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';

import User from '../../../lib/models/user';
import { getEmailTransporter } from '../../../lib/helpers/getEmailTransporter';
import { IError } from '../../../lib/interfaces/IError';
import { IUser } from '../../../lib/interfaces/IUser';
import { createToken } from '../../../lib/helpers/createToken';
export const signup = async (req: Request, res: Response, next: NextFunction) => {
  const { username, email, password } = req.body.data.attributes;

  //1. check if user exists
  let user: IUser | null;
  try {
    user = await User.findOne({ email });
    if (user) {
      const error: IError = new Error('account exists');
      error.statusCode = 409; //conflict
      return next(error);
    }
  } catch (err: any) {
    const error: IError = new Error('Database error');
    error.statusCode = err.status;
    return next(error);
  }

  //2. create token for verification
  let verificationToken;
  try {
    verificationToken = await createToken();
  } catch (err: any) {
    const error: IError = new Error('generate verification token failed');
    error.statusCode = err.status;
    return next(error);
  }

  //3. add new user
  let newUser;
  let saved;
  try {
    newUser = new User({
      username,
      email,
      password: await bcrypt.hash(password, 12),
      verified: false,
      verificationToken,
      verificationTokenExpiration: Date.now() + 60 * 60 * 1000, //UTC time + 1 hour (in milliseconds)
      cart: { items: [] },
      products: [],
    });

    saved = await newUser.save();
  } catch (err: any) {
    const error: IError = new Error('creating new user failed');
    error.statusCode = err.status;
    return next(error);
  }

  //4. send signup email
  try {
    //senMail() uses callback syntax
    getEmailTransporter().sendMail(
      {
        to: email,
        from: {
          name: process.env.EMAIL_FROM_NAME as string,
          address: process.env.GMAIL_USER as string,
        },
        subject: 'signup succeeded',
        html: `<h1>you successfully signed up</h1><br><p>please click <a href="${process.env.FRONTEND_URL}:${process.env.FRONTEND_PORT}/auth/verify/${verificationToken}">this link</a> to confirm email.</p>`,
      },
      (err: Error | null, info: any) => {
        if (err) {
          throw err;
        }
        return info;
      },
    );
  } catch (err: any) {
    const error: IError = new Error('Send signup email failed');
    error.statusCode = err.status;
    return next(error);
  }

  // //5. send response
  const formattedResponse = {
    data: {
      type: 'users',
      id: saved._id.toString(), //return user._id - this is the important part...
      attributes: {
        username,
        email,
      },
    },
    meta: {
      message: 'User successfully signed up.',
    },
  };

  return res.status(201).json(formattedResponse);
};
