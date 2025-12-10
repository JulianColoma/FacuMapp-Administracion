import { z } from "zod";

export const EventoSchema = z.object({
    nombre: z
      .string()
      .trim()
      .min(1, "El nombre es obligatorio")
      .max(255, "El nombre no puede exceder 255 caracteres"),
    descripcion: z
      .string()
      .trim()
      .min(1, "La descripción es obligatoria"),
    fecha_inicio: z.coerce.date({ required_error: "La fecha de inicio es obligatoria" }),
    fecha_fin: z.coerce.date({ required_error: "La fecha de fin es obligatoria" }),
  })
  .refine((data) => data.fecha_fin >= data.fecha_inicio, {
    message: "La fecha de fin no puede ser anterior a la fecha de inicio",
    path: ["fecha_fin"],
  });
