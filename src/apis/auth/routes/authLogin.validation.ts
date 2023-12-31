export const validationSchema = {
  email: {
    presence: true,
    email: {
      message: 'is invalid',
    },
  },

  password: {
    presence: true,
    length: {
      minimum: 3,
      message: 'is invalid',
    },
  },
};
