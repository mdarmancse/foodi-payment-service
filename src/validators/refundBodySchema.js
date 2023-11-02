// @ts-nocheck
import { z } from "zod";

export const refundBodySchema = z.object({
  refund_amount: z.number({
    required_error: "refund_amount is required",
    invalid_type_error: "refund_amount should be a number",
  }),
  refund_remarks: z.string({
    required_error: "refund_remarks is required",
    invalid_type_error: "refund_remarks type should be a string",
  }),
  bank_tran_id: z.string({
    required_error: "bank_tran_id  is required",
    invalid_type_error: "bank_tran_id should be a string",
  }),
  refe_id: z.string().optional(),
  
});
