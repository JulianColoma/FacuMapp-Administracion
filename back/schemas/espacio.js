import { z } from 'zod'
export const EspacioSchema = z.object({
  nombre: z.string().trim().min(1, "El nombre es obligatorio").max(255, "El nombre no puede exceder 255 caracteres"),
  descripcion: z.string().trim().min(1, "La descripción es obligatoria"),
  capacidad: z.coerce.number().positive("La capacidad debe ser mayor a 0").int("La capacidad debe ser un número entero"),
});

export const CategoriaSchema = z.object({
  nombre: z.string().min(2, "El título no puede estar vacío").max(255, "El título no puede exceder 255 caracteres"),
});

export const CategoriasSchema = z.object({
  categoria: z.number(),
})