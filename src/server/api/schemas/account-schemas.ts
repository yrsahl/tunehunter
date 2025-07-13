import { RegisterErrorCode } from "@/components/interactive/Auth/RegisterForm";
import { z } from "zod";

// Schemas
export const RegisterSchema = z.object({
  email: z.string().email({ message: "E-Mail is required" }),
  name: z.string().min(3, "Minimum 3 characters required"),
  region: z.string({ message: "Region is required" }),
});

export const ConfirmMailSchema = z.object({
  email: z.string().email({ message: "E-Mail is required" }),
  confirmEmail: z.string().email({ message: "E-Mail is required" }),
});

export const VerificationCodeSchema = z.object({
  verificationCode: z.string().min(1, "Verification code is required"),
});

// Interfaces
interface RegisterErrorResponse {
  error: RegisterErrorCode;
  success?: undefined;
}
interface RegisterSuccessResponse {
  success: string;
  error?: undefined;
}
export type RegisterResponse = RegisterErrorResponse | RegisterSuccessResponse;
