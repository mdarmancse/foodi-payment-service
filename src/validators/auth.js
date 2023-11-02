import { z } from "zod";

export const HelloWorld = z.object({
  name: z.string({ required_error: "name is required" }),
});
