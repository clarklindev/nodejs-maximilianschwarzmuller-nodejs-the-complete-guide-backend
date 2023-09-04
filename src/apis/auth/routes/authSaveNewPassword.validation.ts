export const validationSchema = {
  password: {
    presence: true,
    length: {
      minimum: 3,
      message: 'must be at least 3 characters long',
    },
  },
};
