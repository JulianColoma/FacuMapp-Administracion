import { Router } from "express"


export const eventoRouter = Router()

// CRUD eventoes
eventoRouter.get('/evento', console.log("devuelve todos los eventos"))
eventoRouter.get('/evento/:id', console.log("devuelve un evento"))
eventoRouter.post('/evento', console.log("crea un evento"))
eventoRouter.patch('/evento/:id', console.log("actualiza un evento"))
eventoRouter.delete('/evento/:id', console.log("borra un evento"))

