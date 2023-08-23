//returns payload from token
export const jwtGetTokenPayload = (token: string) => {
  if (!token) {
    throw new Error('Token expected');
  }
  // Step 1: Split the token into its three parts
  const tokenParts = token.split('.');
  if (tokenParts.length !== 3) {
    throw new Error('invalid token format');
  }

  // Step 2: Decode the payload (middle part)
  //atob() is used to decode 64bit encoded data..
  const payload = JSON.parse(atob(tokenParts[1]));
  if (!payload) {
    // Invalid payload or missing expiration time
    throw new Error('invalid payload');
  }

  return payload;
};
