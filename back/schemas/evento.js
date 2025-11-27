import { z } from "zod";

export const EventoSchema = z.object({
    nombre: z.string().min(2, "El título no puede estar vacío").max(255, "El título no puede exceder 255 caracteres"),
    descripcion: z.string().min(3, "La descripción no puede estar vacía"),
    fecha_inicio: z.coerce.date(),
    fecha_fin: z.coerce.date(),
  })
  .refine((data) => data.fecha_inicio >= new Date(new Date().toDateString()), {
    message: "La fecha de inicio no puede ser anterior a hoy",
    path: ["fecha_inicio"],
  })
  .refine((data) => data.fecha_fin >= data.fecha_inicio, {
    message: "La fecha de fin debe ser posterior o igual a la de inicio",
    path: ["fecha_fin"],
  });
