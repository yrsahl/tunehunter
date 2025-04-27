import { RegisterErrorCode } from "@/components/interactive/Auth/RegisterForm";
import { VendorData } from "@/types/vendor";
import { z } from "zod";

// Output
interface RegisterErrorResponse {
  error: RegisterErrorCode;
  success?: undefined;
}
interface RegisterSuccessResponse {
  success: string;
  error?: undefined;
}
export type RegisterResponse = RegisterErrorResponse | RegisterSuccessResponse;

interface VendorDataSuccessResponse {
  data: VendorData;
  error?: undefined;
}
interface VendorDataErrorResponse {
  error: string;
  data?: undefined;
}
export type VendorDataResponse = VendorDataSuccessResponse | VendorDataErrorResponse;

// Inputs
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

export const AddUserActivitySchema = z.object({
  type: z.enum(["search", "purchase", "wishlist"]),
  songId: z.string(),
  region: z.string(),
});

export const RemoveUserActivitySchema = z.object({
  type: z.enum(["search", "purchase", "wishlist"]),
  songId: z.string(),
});

export const GetUserActivitySchema = z.object({
  type: z.enum(["search", "purchase", "wishlist"]),
});

export const VendorDataSchema = z.union([
  z.object({
    id: z.string(),
    region: z.string(),
    artist: z.string(),
    title: z.string(),
    duration: z.number(),
    album: z.union([z.string(), z.null()]), // Allow album to be a string or null
  }),
  z.undefined(), // Allow the entire object to be undefined
]);

export const AddSongSchema = z.object({
  id: z.string(),
  title: z.string(),
  duration: z.number(),
  album: z.union([z.string(), z.null()]),
  albumArtUrl: z.union([z.string(), z.null()]),
  year: z.string(),
  spotifyUrl: z.string(),
});

export const AddSimpleArtistSchema = z.object({
  id: z.string(),
  name: z.string(),
});

export const AddArtistSchema = z.object({
  id: z.string(),
  name: z.string(),
  popularity: z.number(),
  followers: z.number(),
  genres: z.array(z.string()),
});

export const AddSearchQueriesSchema = z.array(
  z.object({
    song: AddSongSchema,
    artists: z.array(AddSimpleArtistSchema),
  }),
);

export const ClientCredentialsTokenSchema = z
  .object({
    token: z.string().min(1),
    expiresAt: z.date().min(new Date()),
  })
  .refine(
    (data) => {
      if (data.expiresAt < new Date()) {
        return false;
      }
      return true;
    },
    { message: "Expires must be in the future" },
  );
