//returns true/false
export const jwtCheckIsTokenValid = (token: string) => {
  if (!token) {
    console.log('there is no token');
    return true;
  }
  // Step 1: Split the token into its three parts
  const tokenParts = token.split('.');
  if (tokenParts.length !== 3) {
    // Invalid token format
    console.log('invalid token format');
    return false;
  }

  // Step 2: Decode the payload (middle part)
  //atob() is used to decode 64bit encoded data..
  const payload = JSON.parse(atob(tokenParts[1]));
  // console.log('payload: ', payload);
  if (!payload || !payload.exp) {
    // Invalid payload or missing expiration time
    return false;
  }

  // Step 3: Get the current time in seconds
  const currentTime = Math.floor(Date.now() / 1000);

  // Step 4: Compare the current time with the expiration time
  const isValid = payload.exp > currentTime;
  console.log('isValid:', isValid);

  return isValid;
};
