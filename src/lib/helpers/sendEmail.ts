import { getEmailTransporter } from './getEmailTransporter';

//note: sendMail() uses callback syntax
export const sendEmail = async (email: string, subject: string, html: string) => {
  return await getEmailTransporter().sendMail(
    {
      to: email,

      from: {
        name: process.env.EMAIL_FROM as string,
        address: process.env.GMAIL_USER as string,
      },

      subject,

      html,
    },

    //callback handlers
    (err: Error | null, info: any) => {
      if (err) {
        throw err;
      }
      return info;
    },
  );
};
