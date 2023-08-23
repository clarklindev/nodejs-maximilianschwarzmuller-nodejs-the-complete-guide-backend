import { Request, Response, NextFunction } from 'express';

import { IUser } from '../../../lib/interfaces/IUser';
import User from '../../../lib/models/user';

export const verifySignupToken = async (req: Request, res: Response, next: NextFunction) => {
  const { token } = req.params;

  //2. try get user associated with token
  const user: IUser | null = await User.findOne({
    verificationToken: token,
  });

  let verified;
  if (!user) {
    verified = false;
  } else {
    //update user
    verified = true;
    user.verified = true;
    await user.save();
  }

  //4. send response including token
  const formattedResponse = {
    data: {
      type: 'user',
      attributes: {
        verified,
      },
    },
  };

  return res.status(200).json(formattedResponse);
};
