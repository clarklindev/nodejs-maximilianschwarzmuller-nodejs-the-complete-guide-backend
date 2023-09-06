import express from 'express';

import {
  login,
  signup,
  resetPassword,
  saveNewPassword,
  verifySignupToken,
  verifyResetToken,
  verifyLoginToken,
} from '../controllers';
import { checkRequestFormat } from '../../../lib/middleware/checkRequestFormat';
import { validationSchema as authLoginValidation } from './authLogin.validation';
import { validationSchema as authSignupValidation } from './authSignup.validation';
import { validationSchema as authResetPasswordValidation } from './authResetPassword.validation';
import { validationSchema as authSaveNewPasswordValidation } from './authSaveNewPassword.validation';
import { validateRequestData } from '../../../lib/middleware/validateRequestData';
import { getGoogleOAuthUrl } from './getGoogleOAuthUrl';
import { googleOAuthCallback } from './googleOAuthCallback';
const router = express.Router();

router.post('/login', checkRequestFormat, validateRequestData(authLoginValidation), login);
router.post('/signup', checkRequestFormat, validateRequestData(authSignupValidation), signup);
router.post('/reset', checkRequestFormat, validateRequestData(authResetPasswordValidation), resetPassword);
router.post('/reset/:token', checkRequestFormat, validateRequestData(authSaveNewPasswordValidation), saveNewPassword);

router.get('/verify/login/:token', verifyLoginToken);
router.get('/verify/signup/:token', verifySignupToken);
router.get('/verify/reset/:token', verifyResetToken);

router.get('/oauth/google/url', getGoogleOAuthUrl); //oAuth
router.get('/oauth/google/callback', googleOAuthCallback); //oAuth
export default router;
