import bcrypt from "bcrypt";
import { z } from "zod";

import { RegisterErrorCode } from "@/components/interactive/Auth/RegisterForm";
import { sendVerificationCodeEmail } from "@/helpers/mail";
import { RegisterSchema } from "@/schemas";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/server/api/trpc";
import { accounts, users, verificationTokens } from "@/server/db/schema";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";

interface RegisterErrorResponse {
  error: RegisterErrorCode;
  success?: undefined;
}
interface RegisterSuccessResponse {
  success: string;
  error?: undefined;
}
type RegisterResponse = RegisterErrorResponse | RegisterSuccessResponse;

export const userRouter = createTRPCRouter({
  // ********* Queries *********
  getUserById: publicProcedure.input(z.object({ id: z.string() })).query(({ ctx, input }) => {
    return ctx.db.query.users.findFirst({
      where: (users, { eq }) => eq(users.id, input.id),
    });
  }),

  getUserByEmail: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .query(({ ctx, input }) => {
      return ctx.db.query.users.findFirst({
        where: (users, { eq }) => eq(users.email, input.email),
      });
    }),

  getUserSettings: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.query.users.findFirst({
        where: (users, { eq }) => eq(users.id, input.userId),
      });
      if (!user) return { error: "userNotFound" };
      return {
        id: user.id,
        language: user.language,
        theme: user.theme,
        themeParticles: user.themeParticles,
        region: user.region,
      };
    }),

  getVerificationTokenByEmail: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.query.verificationTokens.findFirst({
        where: (tokens, { eq }) => eq(tokens.identifier, input.email),
      });
    }),

  // ********* Mutations *********
  createAccount: publicProcedure
    .input(RegisterSchema)
    .mutation<RegisterResponse>(async ({ ctx, input }) => {
      const validatedFields = RegisterSchema.safeParse(input);
      if (!validatedFields.success) return { error: "INVALID_FIELDS" };

      // Check existing user
      const mailInUse = await ctx.db.query.users.findFirst({
        where: (users, { eq }) => eq(users.email, input.email),
      });
      if (mailInUse) return { error: "ACCOUNT_ALREADY_EXISTS" };
      const usernameInUse = await ctx.db.query.users.findFirst({
        where: (users, { eq }) => eq(users.name, input.name),
      });
      if (usernameInUse) return { error: "USERNAME_ALREADY_EXISTS" };

      // Create user
      await ctx.db
        .insert(users)
        .values({ name: input.name, email: input.email, region: input.region });
      return { success: "ACCOUNT_CREATED" };
    }),

  storeAndSendVerificationToken: publicProcedure
    .input(z.object({ email: z.string().email(), token: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await sendVerificationCodeEmail(input.email, input.token);
      const hashedToken = await bcrypt.hash(input.token, 10);
      await ctx.db.insert(verificationTokens).values({
        identifier: input.email,
        token: hashedToken,
        expires: new Date(Date.now() + 10 * 60 * 1000),
      });
    }),

  verifyVerificationToken: publicProcedure
    .input(z.object({ email: z.string().email(), token: z.string() }))
    .query(async ({ ctx, input }) => {
      const tokenData = await ctx.db.query.verificationTokens.findFirst({
        where: (tokens, { eq }) => eq(tokens.identifier, input.email),
      });
      if (!tokenData) return { error: "tokenNotFound" };

      const isValid = await bcrypt.compare(input.token, tokenData.token);
      if (!isValid) return { error: "invalidToken" };

      if (tokenData.expires < new Date()) return { error: "expiredToken" };

      return { success: "validToken" };
    }),

  deleteVerificationTokenByEmail: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(verificationTokens).where(eq(verificationTokens.identifier, input.email));
    }),

  editUserMail: protectedProcedure
    .input(z.object({ id: z.string(), email: z.string().email() }))
    .mutation(async ({ ctx, input }) => {
      const mailInUse = await ctx.db.query.users.findFirst({
        where: (users, { eq }) => eq(users.email, input.email),
      });
      if (mailInUse) throw new TRPCError({ code: "CONFLICT", message: "Mail already in use" });

      await ctx.db.update(users).set({ email: input.email }).where(eq(users.id, input.id));
    }),

  editUserName: protectedProcedure
    .input(z.object({ id: z.string(), name: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const usernameInUse = await ctx.db.query.users.findFirst({
        where: (users, { eq }) => eq(users.name, input.name),
      });

      if (usernameInUse)
        throw new TRPCError({ code: "CONFLICT", message: "Username already in use" });

      await ctx.db.update(users).set({ name: input.name }).where(eq(users.id, input.id));
    }),

  deleteUserAndAccountsByUserId: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(users).where(eq(users.id, input.userId)).returning();
    }),

  setUserSettings: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        language: z.string().optional(),
        theme: z.string().optional(),
        themeParticles: z.boolean().optional(),
        region: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(users)
        .set({
          language: input.language ?? ctx.session.user.language,
          theme: input.theme ?? ctx.session.user.theme,
          themeParticles: input.themeParticles ?? ctx.session.user.themeParticles,
          region: input.region ?? ctx.session.user.region,
        })
        .where(eq(users.id, input.id));
    }),

  unlinkSpotifyAccount: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(accounts).where(eq(accounts.userId, input.userId)).returning();
    }),
});
