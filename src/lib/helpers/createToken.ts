import crypto from 'crypto';

const generateRandomBytes = (length: number) => {
  return new Promise((resolve, reject) => {
    //randomBytes() uses callback syntax
    crypto.randomBytes(length, (err, buffer) => {
      if (err) {
        return reject(err);
      }
      return resolve(buffer);
    });
  });
};

//this is different from jwt token as there is nothing to decode, its just a random string token used for: validating user, reset token.
export const createToken = async () => {
  const length = 32;
  const buffer = await generateRandomBytes(length);
  return (buffer as Buffer).toString('hex');
};
