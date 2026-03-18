import { VerificationTokenTemplate } from "@/components/email-templates/VerificationTokenTemplate";
import { env } from "@/env";
import { Resend } from "resend";

const resend = new Resend(env.EMAIL_SERVER_PASSWORD);

export const sendVerificationCodeEmail = async (email: string, verificationCode: string) => {
  const { data, error } = await resend.emails.send({
    from: "TrackScout <contact@trackscout.app>",
    to: [email],
    subject: "Your verification code for TrackScout",
    react: VerificationTokenTemplate({ verificationCode }),
  });

  return { data, error };
};
