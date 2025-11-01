import { Router } from "express"
import { EspacioController, CategoriaController } from "../controllers/espacio"
import { upload } from "../middlewares/upload.js";

export const espacioRouter = Router()

// CRUD espacios
espacioRouter.get('/espacio', EspacioController.getAll)
espacioRouter.get('/espacio/:id', EspacioController.getById)
espacioRouter.post("/espacio", upload.single("imagen"), EspacioController.postEspacio);
espacioRouter.put('/espacio/:id',upload.single('imagen'), EspacioController.updateEspacio)
espacioRouter.delete('/espacio/:id', EspacioController.deleteEspacio)
espacioRouter.post('/espaciocat/:id', EspacioController.addCategoria) 

//CRUD categorias
categoriaRouter.get('/categoria', CategoriaController.getAll)
categoriaRouter.get('/categoria/:id', CategoriaController.getById)
categoriaRouter.post('/categoria', CategoriaController.postCategoria)
categoriaRouter.put('/categoria/:id', CategoriaController.updateCategoria)
categoriaRouter.delete('/categoria/:id', CategoriaController.deleteCategoria)
