import { z } from "astro/zod";

export const successOrderLookupResponseSchema = z.object({
  id: z.number(),
  success: z.literal(true),
});

export const failureOrderLookupResponseSchema = z.object({
  success: z.literal(false),
});

export const orderLookupResponseSchema = z.discriminatedUnion("success", [
  successOrderLookupResponseSchema,
  failureOrderLookupResponseSchema,
]);

export const orderLookupBodyValidatorSchema = z.object({
  number: z.string(),
  phone: z.string().regex(/^\d{4}$/),
});

export type OrderLookupResponse = z.infer<typeof orderLookupResponseSchema>;
export type OrderLookupBodyValidator = z.infer<
  typeof orderLookupBodyValidatorSchema
>;
