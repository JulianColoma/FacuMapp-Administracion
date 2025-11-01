import {CategoriasSchema, EspacioSchema, CategoriaSchema} from "../schemas/espacio.js"
import {EspacioModel, CategoriaModel} from "../models/espacio.js"
export class EspacioController {
    static getAll = async (req, res) => {
        //Validamos la session
        const { user } = req.session
        if(!user || !user.administrador) return res.status(403).send('Access not authorized')

        try{
        const espacios = await EspacioModel.getAll()
        res.json(espacios)
        res.status(200).end()
        } catch (error) {
            console.error(error);
            res.status(400).json({ error: error.message });
        }
    }
    
    static getById = async (req, res) => {
        //Validamos la session
        const { user } = req.session
        if(!user || !user.administrador) return res.status(403).send('Access not authorized')

        try{
        const { id } = req.params
        const espacios = await EspacioModel.getById(id)
        res.json(espacios)
        res.status(200).end()
        } catch (error) {
            console.error(error);
            res.status(400).json({ error: error.message });
        }
    }
    static postEspacio = async (req, res) => {
        //Validamos la session
        const { user } = req.session
        if(!user || !user.administrador) return res.status(403).send('Access not authorized')

        try {
            const validated_input = EspacioSchema.parse(req.body);
             if (req.file) {
                validated_input.imagen = `/uploads/${req.file.filename}`;
             }
            await EspacioModel.postEspacio(validated_input)
            res.status(201).json({"ok": true}).end(); 
        } catch (error) {
            console.error(error);
            res.status(400).json({ error: error.message });
        }
    }
    static deleteEspacio = async (req, res) => {
        //Validamos la session
        const { user } = req.session
        if(!user || !user.administrador) return res.status(403).send('Access not authorized')

        try{
        const { id } = req.params
        await EspacioModel.deleteById(id)
        res.status(200).json({"ok": true}).end()
        } catch (error) {
            console.error(error);
            res.status(400).json({ error: error.message });
        }
    }
    static updateEspacio = async (req, res) => {
        //Validamos la session
        const { user } = req.session
        if(!user || !user.administrador) return res.status(403).send('Access not authorized')

        try{
        const { id } = req.params
        const validated_input = EspacioSchema.parse(req.body);
        if (req.file) {
            //Obtener el espacio actual de la BD
            const espacioActual = await EspacioModel.getById(id);
            //Borrar la imagen anterior del servidor si existe
            if (espacioActual && espacioActual.imagen) {
                const oldPath = path.join(process.cwd(), espacioActual.imagen);
            //Guardar la nueva ruta
            if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
            }
            validated_input.imagen = `/uploads/${req.file.filename}`;
        }
        await EspacioModel.updateEspacio(id, validated_input)
        res.status(200).json({"ok": true}).end()
        } catch (error) {
            console.error(error);
            res.status(400).json({ error: error.message });
        }
    }
    static addCategoria = async (req, res) => {
        //Validamos la session
        const { user } = req.session
        if(!user || !user.administrador) return res.status(403).send('Access not authorized')

        try {
            const { id } = req.params
            const validated_input = CategoriasSchema.parse(req.body); 
            await EspacioModel.addCategorias(id, validated_input)
            res.status(201).json({"ok": true}).end(); 
        } catch (error) {
            console.error(error);
            res.status(400).json({ error: error.message });
        }
    }
}
export class CategoriaController {
    static getAll = async (req, res) => {
        //Validamos la session
        const { user } = req.session
        if(!user || !user.administrador) return res.status(403).send('Access not authorized')

        try{
        const categorias = await CategoriaModel.getAll()
        res.json(categorias)
        res.status(200).end()
        } catch (error) {
            console.error(error);
            res.status(400).json({ error: error.message });
        }
    }
    
    static getById = async (req, res) => {
        //Validamos la session
        const { user } = req.session
        if(!user || !user.administrador) return res.status(403).send('Access not authorized')

        try{
        const { id } = req.params
        const categoria = await CategoriaModel.getById(id)
        res.json(categoria)
        res.status(200).end()
        } catch (error) {
            console.error(error);
            res.status(400).json({ error: error.message });
        }
    }
    static postCategoria = async (req, res) => {
        //Validamos la session
        const { user } = req.session
        if(!user || !user.administrador) return res.status(403).send('Access not authorized')

        try {
            const validated_input = CategoriaSchema.parse(req.body);
            await CategoriaModel.postCategoria(validated_input)
            res.status(201).json({"ok": true}).end(); 
        } catch (error) {
            console.error(error);
            res.status(400).json({ error: error.message });
        }
    }
    static deleteCategoria = async (req, res) => {
        //Validamos la session
        const { user } = req.session
        if(!user || !user.administrador) return res.status(403).send('Access not authorized')

        try{
        const { id } = req.params
        await CategoriaModel.deleteById(id)
        res.status(200).json({"ok": true}).end()
        } catch (error) {
            console.error(error);
            res.status(400).json({ error: error.message });
        }
    }
    static updateCategoria = async (req, res) => {
        //Validamos la session
        const { user } = req.session
        if(!user || !user.administrador) return res.status(403).send('Access not authorized')
            
        try{
        const { id } = req.params
        const validated_input = CategoriaSchema.parse(req.body);
        await CategoriaModel.updateCategoria(id, validated_input)
        res.status(200).json({"ok": true}).end()
        } catch (error) {
            console.error(error);
            res.status(400).json({ error: error.message });
        }
    }
}