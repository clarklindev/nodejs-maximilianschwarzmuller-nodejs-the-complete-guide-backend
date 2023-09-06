import { Request, Response, NextFunction } from 'express';

import { getGoogleUser } from '../../../lib/helpers/getGoogleUser';
import { updateOrCreateUserFromOAuth } from '../../../lib/helpers/updateOrCreateUserFromOAuth';
import { jwtCreateToken } from '../../../lib/helpers/jwtCreateToken';
import { IError } from '../../../lib/interfaces/IError';

//parse the data given back by oauth
export const googleOAuthCallback = async (req: Request, res: Response, next: NextFunction) => {
  const { code } = req.query; //code will be in query of callback url

  const oAuthUserInfo = await getGoogleUser({ code });
  const updatedUser = await updateOrCreateUserFromOAuth({ oAuthUserInfo });
  const { _id: id, verified, email, info } = updatedUser;

  const payload = { id, verified, email, info };
  try {
    const token = await jwtCreateToken(payload);

    // Close the popup window and pass the token back to the main window
    res.send(
      `<script>window.opener.postMessage("${token}", "${process.env.FRONTEND_URL}:${process.env.FRONTEND_PORT}"); window.close();</script>`,
    );
  } catch (err) {
    const error: IError = new Error('generate token failed');
    error.statusCode = 500;
    return next(error);
  }
};
