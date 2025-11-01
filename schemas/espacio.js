import { z } from 'zod'
export const EspacioSchema = z.object({
    nombre: z.string().min(2, "El título no puede estar vacío").max(255, "El título no puede exceder 255 caracteres"),
    descripcion: z.string().min(3, "La descripcion no puede estar vacía"),
  });

export const CategoriaSchema = z.object({
    nombre: z.string().min(2, "El título no puede estar vacío").max(255, "El título no puede exceder 255 caracteres"),
  });

export const CategoriasSchema = z.object({
  categoria: z.number(),
})