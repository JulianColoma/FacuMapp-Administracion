import { z } from 'zod'

export const actividadSchema = z.object({
    nombre: z.string()
        .min(2, "El título no puede estar vacío")
        .max(255, "El título no puede exceder 255 caracteres"),
        
    descripcion: z.string()
        .min(3, "La descripción no puede estar vacía"), 
        
    fecha: z.coerce.date() 
        .refine((d) => d >= new Date(new Date().setHours(0,0,0,0)), {
             message: "La fecha no puede ser anterior a hoy",
        }),
        
    hora_inicio: z.string().time(),
    
    hora_fin: z.string().time(),

    id_espacio: z.number({
        required_error: "El id_espacio es obligatorio",
        invalid_type_error: "El id_espacio debe ser un número"
    })
    .int("El id_espacio debe ser un número entero")
    .positive("El id_espacio debe ser un ID válido (positivo)"),

    
    id_evento: z.number({
        required_error: "El id_evento es obligatorio",
        invalid_type_error: "El id_evento debe ser un número"
    })
    .int("El id_evento debe ser un número entero")
    .positive("El id_evento debe ser un ID válido (positivo)")

})
.refine((data) => data.hora_fin > data.hora_inicio, {
    message: "La hora de fin debe ser posterior a la de inicio",
    path: ["hora_fin"],
});