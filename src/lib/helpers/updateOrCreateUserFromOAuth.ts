import { IError } from '../interfaces/IError';
import User from '../models/user';

//receives data given back from google.
export const updateOrCreateUserFromOAuth = async ({ oAuthUserInfo }) => {
  const { verified_email: verified, email } = oAuthUserInfo;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    const result = await User.findOneAndUpdate({ email }, { $set: { verified } }, { returnOriginal: false });
    return result;
  } else {
    try {
      const newUser = new User({
        email,
        verified,
        info: {},
        cart: { items: [] },
        products: [],
      });

      console.log('newUser: ', newUser);
      const saved = await newUser.save();

      console.log('saved: ', saved);

      return saved;
    } catch (err: any) {
      const error: IError = new Error('creating new user failed');
      error.statusCode = err.status;
      throw error;
    }
  }
};
