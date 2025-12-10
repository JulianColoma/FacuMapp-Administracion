import { z } from "zod";

export const userSchema = z.object({
  nombre: z.string()
    .trim()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(255, "El nombre no puede exceder 255 caracteres")
    .regex(/^[a-zA-Z0-9_]+$/, "El nombre solo puede contener letras, números y guiones bajos"),
  contrasena: z.string()
    .min(6, "La contraseña debe tener al menos 6 caracteres")
    .max(100, "La contraseña no puede exceder 100 caracteres"),
  administrador: z.boolean().optional(), 
});
export const userLoginSchema = userSchema.omit({ administrador: true });