import { Request, Response, NextFunction } from 'express';

import { IUser } from '../../../lib/interfaces/IUser';
import User from '../../../lib/models/user';

export const verifySignupToken = async (req: Request, res: Response, next: NextFunction) => {
  const { token } = req.params; //note: this is not a jwt token

  //1. try get user associated with token
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

  //2. send response
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
