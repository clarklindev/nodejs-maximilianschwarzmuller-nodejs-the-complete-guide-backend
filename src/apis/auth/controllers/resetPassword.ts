//resetPassword
import { Request, Response, NextFunction } from 'express';

import User from '../../../lib/models/user';
import { IError } from '../../../lib/interfaces/IError';
import { IUser } from '../../../lib/interfaces/IUser';
import { createToken } from '../../../lib/helpers/createToken';
import { sendEmail } from '../../../lib/helpers/sendEmail';

//------------------------------------------------------------------------------------------------

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  const { email } = req.body.data.attributes;

  //1. find user
  const user: IUser | null = await User.findOne({ email });
  //returns [] if not found
  if (!user) {
    const error: IError = new Error('user not found');
    error.statusCode = 404;
    return next(error);
  }

  //2. create reset token + update user.resetToken and user.resetTokenExpiration in db
  let token;
  try {
    token = await createToken();
    user.resetToken = token;
    user.resetTokenExpiration = Date.now() + 60 * 60 * 1000; //UTC time + 1 hour (in milliseconds)
    await user.save();
  } catch (err: any) {
    const error: IError = new Error(err.message);
    error.statusCode = err.status;
    return next(error);
  }

  //3. send reset password email
  try {
    const html = `<p>update</p><p>Click this <a href="${process.env.FRONTEND_URL}:${process.env.FRONTEND_PORT}/auth/password-reset/${token}">link</a> to set a new password.`;
    sendEmail(email, 'password reset', html);
  } catch (err: any) {
    const error: IError = new Error('failed to send email');
    error.statusCode = err.status;
    return next(error);
  }

  //4. send response
  const formattedResponse = {
    data: {
      type: 'success',
      attributes: {
        email: email,
      },
    },
    meta: {
      status: 'success',
    },
  };
  return res.json(formattedResponse);
};
