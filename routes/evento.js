import { Router } from "express"
import { EventoController } from "../controllers/evento"

export const eventoRouter = Router()

// CRUD eventoes
eventoRouter.get('/evento', EventoController.getAll)
eventoRouter.get('/evento/:id', EventoController.getById)
eventoRouter.post('/evento', EventoController.postEvento)
eventoRouter.put('/evento/:id', EventoController.updateEvento)
eventoRouter.delete('/evento/:id', EventoController.deleteEvento)

