import { Router } from "express"
import { ActividadController } from "../controllers/actividad"

export const actividadRouter = Router()

// CRUD actividades
actividadRouter.get('/actividad', ActividadController.getAll)
actividadRouter.get('/actividad/:id', ActividadController.getById)
actividadRouter.post('/actividad', ActividadController.postActividad)
actividadRouter.put('/actividad/:id', ActividadController.updateActividad)
actividadRouter.delete('/actividad/:id', ActividadController.deleteActividad)

