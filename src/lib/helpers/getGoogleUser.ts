import { getOAuthClient } from './getOAuthClient';

//make a url to access users data - takes an access token, this is after google redirects user back to our server
const getAccessAndBearerTokenUrl = ({ accessToken }) => {
  return `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${accessToken}`;
};

//takes in code that google oAuth sent back to us when it redirected the user
export const getGoogleUser = async ({ code }) => {
  const { tokens } = await getOAuthClient().getToken(code);

  const response = await fetch(getAccessAndBearerTokenUrl({ accessToken: tokens.access_token }), {
    headers: { Authorization: `Bearer ${tokens.id_token}` },
  });

  //returns user data given to us from google
  const data = await response.json();
  return data;
};
