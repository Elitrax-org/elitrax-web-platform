import { z } from "zod";

export const signInInputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(72),
});

export const signUpInputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(72),
  fullName: z.string().min(1).max(120).optional(),
});

export const requestPasswordResetInputSchema = z.object({
  email: z.string().email(),
  redirectTo: z.string().url().optional(),
});

export const updatePasswordInputSchema = z.object({
  password: z.string().min(8).max(72),
});

export type SignInInput = z.infer<typeof signInInputSchema>;
export type SignUpInput = z.infer<typeof signUpInputSchema>;
export type RequestPasswordResetInput = z.infer<
  typeof requestPasswordResetInputSchema
>;
export type UpdatePasswordInput = z.infer<typeof updatePasswordInputSchema>;
