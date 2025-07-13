import { ConfirmMailSchema, VerificationCodeSchema } from "@/server/api/schemas/account-schemas";
import { api } from "@/utils/api";
import { z } from "zod";
import { generateRandomNumbers } from "./random-generators";

const useVerificationToken = () => {
  const utils = api.useUtils();
  const deleteVerificationToken = api.user.deleteVerificationTokenByEmail.useMutation();
  const storeAndSendVerificationToken = api.user.storeAndSendVerificationToken.useMutation();

  const createAndSendVerificationToken = async (email: string) => {
    const numbers = generateRandomNumbers(6);
    const verificationToken = `${numbers}`;

    try {
      // Check if token already exists and delete it
      const existingTokenData = await utils.user.getVerificationTokenByEmail.fetch({ email });
      if (existingTokenData?.token) {
        deleteVerificationToken.mutate({ email });
      }

      // Create new token and hash it for DB
      storeAndSendVerificationToken.mutate({ email, token: verificationToken });

      return { success: "tokenSent" };
    } catch (error) {
      return { error: "generalError" };
    }
  };

  const verifyVerificationToken = async (
    confirmMailValues: z.infer<typeof ConfirmMailSchema>,
    verificationCodeValues: z.infer<typeof VerificationCodeSchema>,
  ) => {
    const validatedMailFields = ConfirmMailSchema.safeParse(confirmMailValues);
    const validatedCodeFields = VerificationCodeSchema.safeParse(verificationCodeValues);

    if (!validatedMailFields.success || !validatedCodeFields.success) {
      return { error: "fieldsInvalid" };
    }

    const isValidToken = await utils.user.verifyVerificationToken.fetch({
      email: confirmMailValues.email,
      token: verificationCodeValues.verificationCode,
    });
    if (isValidToken.error)
      return {
        error: "tokenInvalid",
      };
    return {
      success: "tokenValid",
    };
  };

  return {
    createAndSendVerificationToken,
    verifyVerificationToken,
  };
};

export default useVerificationToken;
