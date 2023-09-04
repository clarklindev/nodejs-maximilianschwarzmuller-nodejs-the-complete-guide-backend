//saveNewPassword
import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';

import User from '../../../lib/models/user';
import { IError } from '../../../lib/interfaces/IError';
import { IUser } from '../../../lib/interfaces/IUser';
import { sendEmail } from '../../../lib/helpers/sendEmail';

//------------------------------------------------------------------------------------------------

export const saveNewPassword = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.params.token;
  const resourceAttributes = req.body.data.attributes;
  const { password: newPassword } = resourceAttributes; //password renamed as newPassword

  //1. find a user in db - where they have the same resetToken (from req.params.token) + not expired
  const user: IUser | null = await User.findOne({
    resetToken: token,
    resetTokenExpiration: { $gt: Date.now() },
  });
  if (!user) {
    const error: IError = new Error('Unauthorized');
    error.statusCode = 401;
    return next(error);
  }

  //2. encrypt user entered password + save to db
  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(newPassword, 12);
    if (hashedPassword) {
      user.password = hashedPassword;
      user.resetToken = undefined;
      user.resetTokenExpiration = undefined;
      await user.save();
    }
  } catch (err: any) {
    const error: IError = new Error('update details failed');
    error.statusCode = err.status;
    return next(error);
  }

  //3. send reset password email
  try {
    const html = `<p>password updated</p><p>Click here <a href="${process.env.FRONTEND_URL}:${process.env.FRONTEND_PORT}/auth/login">link</a> to login.`;
    sendEmail(user.email, 'password updated', html);
  } catch (err: any) {
    const error: IError = new Error('failed to send email');
    error.statusCode = err.status;
    return next(error);
  }

  //4. send response
  const formattedResponse = {
    data: {
      type: 'users',
      id: user._id.toString(),
      attributes: {
        name: user.name,
        password: hashedPassword,
      },
    },
    meta: {
      status: 'password updated',
    },
  };
  return res.status(200).json(formattedResponse);
};
