import { Router } from "express"
import { EventoController } from "../controllers/evento.js"

export const eventoRouter = Router()

// CRUD eventos
eventoRouter.get('/evento', EventoController.getAll)
eventoRouter.get('/evento/:id', EventoController.getById)
eventoRouter.post('/evento', EventoController.postEvento)
eventoRouter.put('/evento/:id', EventoController.updateEvento)
eventoRouter.delete('/evento/:id', EventoController.deleteEvento)

