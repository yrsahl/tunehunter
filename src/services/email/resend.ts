import { VerificationTokenTemplate } from "@/components/email-templates/VerificationTokenTemplate";
import { env } from "@/env";
import { redis } from "@/lib/redis";
import { sendTelegram } from "@/lib/telegram";
import { Resend } from "resend";

const resend = new Resend(env.EMAIL_SERVER_PASSWORD);

export const sendVerificationCodeEmail = async (email: string, verificationCode: string) => {
  const { data, error } = await resend.emails.send({
    from: "TuneHunter <contact@tunehunter.app>",
    to: [email],
    subject: "Your verification code for TuneHunter",
    react: VerificationTokenTemplate({ verificationCode }),
  });

  if (error) {
    const failures = await redis.incr("email:circuit");
    if (failures === 1) void redis.expire("email:circuit", 600);
    if (failures >= 3) {
      const alreadySent = await redis.get("email:circuit:sent");
      if (!alreadySent) {
        void Promise.all([
          sendTelegram(
            `<b>⚠️ Magic link emails failing</b>\n` +
            `${failures} send failures in the last 10 minutes.\n` +
            `Users cannot sign in. Error: ${error.message}`,
          ),
          redis.set("email:circuit:sent", "1", { ex: 3600 }),
        ]);
      }
    }
  }

  return { data, error };
};
