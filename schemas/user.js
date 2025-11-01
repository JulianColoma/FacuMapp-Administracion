import { z } from "zod";

export const userSchema = z.object({
  nombre: z.string().min(1, "El nombre no puede estar vacío").max(255, "El nombre no puede exceder 255 caracteres"),
  contraseña: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  administrador: z.boolean(), 
});