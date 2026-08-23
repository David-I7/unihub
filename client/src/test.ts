import z from "zod";

const xSchema = z.object({
  x: z.string().min(1, "X is required"),
});

const res = xSchema.safeParse({ x: "" });

console.log(res);

export {};
