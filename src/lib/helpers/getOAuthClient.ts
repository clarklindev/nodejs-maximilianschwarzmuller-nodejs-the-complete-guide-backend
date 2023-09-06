import { google } from 'googleapis';

let oAuth2ClientInstance = null;

// Create and return the OAuth2 client instance
export const getOAuthClient = () => {
  if (!oAuth2ClientInstance) {
    oAuth2ClientInstance = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.URL}:${process.env.PORT}/auth/oauth/google/callback`, //backend url
    );
  }
  return oAuth2ClientInstance;
};
