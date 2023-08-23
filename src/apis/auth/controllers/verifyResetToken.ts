import { Request, Response, NextFunction } from 'express';

import { IUser } from '../../../lib/interfaces/IUser';
import User from '../../../lib/models/user';

export const verifyResetToken = async (req: Request, res: Response, next: NextFunction) => {
  const { token } = req.params;

  //2. try get user associated with token
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
