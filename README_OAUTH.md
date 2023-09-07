# OAuth with google

## cloud.console.google

### OAuth Consent screen

1. create a project
2. set up OAuth Consent screen

- user type: external
- app name
- user support email
- developer contact information
- save + continue

3. setup scopes

- things / data you will get access to
  - user email
  - user profile
- update

4. add test users

- test gmail account email

### create credentials

- create credentials -> oauth client id
  - application type: web application
  - name: "name of project"
  - Authorized JS origins: set (BACKEND) server url: localhost://localhost:3000
  - authorized Redirect URI (BACKEND) localhost:3000/auth/oauth/google/callbacks
    (Make sure that the Redirect URIs you specified when creating your OAuth 2.0 client in the Google Developers Console match the URL to which you're redirecting users during the OAuth flow )
  - GIVES: clientID and clientSecret which we add to .env

## add .env

GOOGLE_CLIENT_ID=clientID
GOOGLE_CLIENT_SECRET=clientSecret

## install dependencies

- googleapis

```
npm i googleapis
```

## route

```ts
router.get('/oauth/google', getGoogleOAuthUrl); //oAuth
```

## helper files - getGoogleOAuthClient.ts

```ts
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
```

## route - getGoogleOAuthUrl.ts

```ts
//auth/routes/getGoogleOAuthUrl
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
```
