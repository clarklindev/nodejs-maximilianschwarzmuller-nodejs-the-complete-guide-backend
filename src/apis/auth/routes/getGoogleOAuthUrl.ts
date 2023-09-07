import { Request, Response, NextFunction } from 'express';

import { getGoogleOAuthClient } from '../../../lib/helpers/getGoogleOAuthClient';

////hey google, generate an authorization code url user can click on, and these are the permissions i need access to - this will then be sent back to user to be send back to the auth server.
export const getGoogleOAuthUrl = (req: Request, res: Response, next: NextFunction) => {
  const scopes = ['https://www.googleapis.com/auth/userinfo.email', 'https://www.googleapis.com/auth/userinfo.profile'];

  const url = getGoogleOAuthClient().generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: scopes,
  });

  return res.status(200).json({ url });
};
