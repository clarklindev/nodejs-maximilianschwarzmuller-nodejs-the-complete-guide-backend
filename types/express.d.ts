declare namespace Express {
  interface Request {
    token?: object; //decoded token data (isAuth middleware)
  }
}
