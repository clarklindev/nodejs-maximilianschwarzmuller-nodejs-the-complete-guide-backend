import { Request, Response, NextFunction } from 'express';

import { IUser } from '../../../lib/interfaces/IUser';
import User from '../../../lib/models/user';

export const verifyResetToken = async (req: Request, res: Response, next: NextFunction) => {
  const { token } = req.params;

  //try get user associated with token -
  //1. check that the token isnt expired
  //2. check that this token belongs to a User - even if someone gets hold of token, it can only be used to reset password who received the email

  const user: IUser | null = await User.findOne({
    resetToken: token,
    resetTokenExpiration: { $gt: Date.now() },
  });

  //3.
  const isResetTokenValid = !user ? false : true;

  const formattedResponse = {
    data: {
      type: 'user',
      attributes: {},
    },
    meta: {
      isResetTokenValid,
    },
  };

  return res.status(200).json(formattedResponse);
};
