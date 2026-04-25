import z from "zod";

export const userIdSchema = z.string().uuid().brand("user");
export const userSchema = z.object({
  id: userIdSchema,
  username: z.string().min(1, "Le nom est requis"),
  email: z.email("Email invalide"),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  password: z.string().min(8, "8 caractères minimum"),
  color: z.string()
});
export type User = z.infer<typeof userSchema>;
