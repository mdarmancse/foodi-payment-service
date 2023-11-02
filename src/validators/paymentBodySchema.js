// @ts-nocheck
import { z } from "zod";

export const paymentBodySchema = z.object({
  amount: z.string({
    required_error: "Amount is required",
    invalid_type_error: "Amount should be a string",
  }),
  paymentMethod: z.string({
    required_error: "Payment Method type is required",
    invalid_type_error: "Payment Method type should be a string",
  }),
  paymentReference: z.string({
    required_error: "Payment reference is required",
    invalid_type_error: "Payment reference should be a string",
  }),
  cardType: z.string().optional(),
  successUrl: z.string({
    required_error: "Success URL is required",
    invalid_type_error: "Success URL should be a string",
  }),
  cancelUrl: z.string({
    required_error: "Cancel URL is required",
    invalid_type_error: "Cancel URL should be a string",
  }),
  failureUrl: z.string({
    required_error: "failureUrl  is required",
    invalid_type_error: "failureUrl should be a string",
  }),
  customer: z.object({
    firstName: z.string({
      required_error: "Customer first name is required",
      invalid_type_error: "Customer first name should be a string",
    }),
    lastName: z.string({
      required_error: "Customer last name is required",
      invalid_type_error: "Customer last name should be a string",
    }),
    mobileNo: z.string().optional(),
    email: z.string().optional(),
  }),


  channel: z
    .number()
    .optional()
    // @ts-ignore
    .refine((val) => val >= 1 && val <= 6, {
      message: "Channel must be between 1 and 6",
      path: ["channel"],
    }),
});
