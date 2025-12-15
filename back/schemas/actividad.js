import { z } from 'zod'

export const actividadSchema = z.object({
    nombre: z.string()
        .trim()
        .min(1, "El nombre es obligatorio")
        .max(255, "El nombre no puede exceder 255 caracteres"),
        
    descripcion: z.string()
        .trim()
        .min(1, "La descripción es obligatoria")
        .max(500, "La descripción no puede exceder 500 caracteres"), 
        
    fecha: z.coerce.date({ required_error: "La fecha es obligatoria" }),
        
    hora_inicio: z.string().time("La hora de inicio debe ser una hora válida"),
    
    hora_fin: z.string().time("La hora de fin debe ser una hora válida"),

    id_espacio: z.number({
        required_error: "El espacio es obligatorio",
        invalid_type_error: "El espacio debe ser un número"
    })
    .int("El espacio debe ser un número entero")
    .positive("Debes seleccionar un espacio válido"),

    
    id_evento: z.number({
        required_error: "El evento es obligatorio",
        invalid_type_error: "El evento debe ser un número"
    })
    .int("El evento debe ser un número entero")
    .positive("Debes seleccionar un evento válido")

})
.refine((data) => data.hora_fin > data.hora_inicio, {
    message: "La hora de fin debe ser posterior a la hora de inicio",
    path: ["hora_fin"],
});