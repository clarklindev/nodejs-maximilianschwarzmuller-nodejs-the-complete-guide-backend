//resetPassword
import { Request, Response, NextFunction } from 'express';

import User from '../../../lib/models/user';
import { getEmailTransporter } from '../../../lib/helpers/getEmailTransporter';
import { IError } from '../../../lib/interfaces/IError';
import { IUser } from '../../../lib/interfaces/IUser';
import { createToken } from '../../../lib/helpers/createToken';

const updateUserResetToken = async (user: IUser, token: string) => {
  user.resetToken = token;
  user.resetTokenExpiration = Date.now() + 60 * 60 * 1000; //UTC time + 1 hour (in milliseconds)
  return user.save();
};

const sendResetPasswordEmail = async (email: string, token: string) => {
  return await getEmailTransporter().sendMail({
    to: email,
    from: {
      name: process.env.EMAIL_FROM as string,
      address: process.env.GMAIL_USER as string,
    },
    subject: 'password reset',

    // should be a frontend link or use postman with backend link
    html: `<p>update</p>
        <p>Click this <a href="${process.env.FRONTEND_URL}:${process.env.FRONTEND_PORT}/auth/password-reset/${token}">link</a> to set a new password.
      `,
  });
};

//------------------------------------------------------------------------------------------------

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  const { email } = req.body.data.attributes;

  //1. find user
  const user: IUser | null = await User.findOne({ email });
  //use return [] if not found
  if (!user) {
    const error: IError = new Error('user not found');
    error.statusCode = 404;
    return next(error);
  }

  //2. create reset token + update reset token
  //handle catch differently
  let token;
  try {
    token = await createToken();
    await updateUserResetToken(user as IUser, token);
  } catch (err: any) {
    // Set the HTTP status code to 500 for Internal Server Error
    const error: IError = new Error(err.message);
    error.statusCode = err.status;
    return next(error);
  }

  //3. send reset password email
  try {
    await sendResetPasswordEmail(email, token);
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
