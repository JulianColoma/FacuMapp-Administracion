import { Router } from "express"
import { ActividadController } from "../controllers/actividad.js"

export const actividadRouter = Router()

// CRUD actividades
actividadRouter.get('/actividadEv/:id?', ActividadController.getAll)
actividadRouter.get('/actividad/:id', ActividadController.getById)
actividadRouter.post('/actividad', ActividadController.postActividad)
actividadRouter.put('/actividad/:id', ActividadController.updateActividad)
actividadRouter.delete('/actividad/:id', ActividadController.deleteActividad)

