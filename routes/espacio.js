import { Router } from "express"


export const espacioRouter = Router()

// CRUD espacios
espacioRouter.get('/espacio', console.log("devuelve todos los espacios"))
espacioRouter.get('/espacio/:id', console.log("devuelve un espacio"))
espacioRouter.post('/espacio', console.log("crea un espacio"))
espacioRouter.patch('/espacio/:id', console.log("actualiza un espacio"))
espacioRouter.delete('/espacio/:id', console.log("borra un espacio"))

//CRUD categorias
categoriaRouter.get('/categoria', console.log("devuelve todas las categorias"))
categoriaRouter.get('/categoria/:id', console.log("devuelve una categoria"))
categoriaRouter.post('/categoria', console.log("crea una categoria"))
categoriaRouter.patch('/categoria/:id', console.log("actualiza una categoria"))
categoriaRouter.delete('/categoria/:id', console.log("borra una categoria"))
