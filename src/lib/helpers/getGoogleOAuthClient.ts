import { OAuth2Client } from 'google-auth-library';
import { google } from 'googleapis';

let oAuth2ClientInstance: OAuth2Client;

const createGoogleOAuthInstance = () => {
  oAuth2ClientInstance = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.URL}:${process.env.PORT}/auth/oauth/google/callback`, //backend url
  );
  return oAuth2ClientInstance;
};

// Create and return the OAuth2 client instance
export const getGoogleOAuthClient = () => {
  return oAuth2ClientInstance === undefined ? createGoogleOAuthInstance() : oAuth2ClientInstance;
};
