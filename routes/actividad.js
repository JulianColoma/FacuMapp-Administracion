import { Router } from "express"


export const actividadRouter = Router()

// CRUD actividades
actividadRouter.get('/actividad', console.log("devuelve todas las act"))
actividadRouter.get('/actividad/:id', console.log("devuelve una act"))
actividadRouter.post('/actividad', console.log("crea una actividad"))
actividadRouter.patch('/actividad/:id', console.log("actualiza una actividad"))
actividadRouter.delete('/actividad/:id', console.log("borra una actividad"))

