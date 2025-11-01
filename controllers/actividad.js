import { actividadSchema } from "../schemas/actividad.js"
import { ActividadModel } from "../models/actividad.js"

export class ActividadController {
    static getAll = async (req, res) => {
        //Validamos la session
        const { user } = req.session
        if(!user) return res.status(403).send('Access not authorized')

        try{
        const actividades = await ActividadModel.getAll()
        res.json(actividades)
        res.status(200).end()
        } catch (error) {
            console.error(error);
            res.status(400).json({ error: error.message });
        }
    }
    
    static getById = async (req, res) => {
        //Validamos la session
        const { user } = req.session
        if(!user) return res.status(403).send('Access not authorized')

        try{
        const { id } = req.params
        const actividad = await ActividadModel.getById(id)
        res.json(actividad)
        res.status(200).end()
        } catch (error) {
            console.error(error);
            res.status(400).json({ error: error.message });
        }
    }
    static postActividad = async (req, res) => {
        //Validamos la session
        const { user } = req.session
        if(!user) return res.status(403).send('Access not authorized')

        try {
            const validated_input = actividadSchema.parse(req.body);
            await ActividadModel.postActividad(validated_input)
            res.status(201).json({"ok": true}).end(); 
        } catch (error) {
            console.error(error);
            res.status(400).json({ error: error.message });
        }
    }
    static deleteActividad = async (req, res) => {
        //Validamos la session
        const { user } = req.session
        if(!user) return res.status(403).send('Access not authorized')

        try{
        const { id } = req.params
        await ActividadModel.deleteById(id)
        res.status(200).json({"ok": true}).end()
        } catch (error) {
            console.error(error);
            res.status(400).json({ error: error.message });
        }
    }
    static updateActividad = async (req, res) => {
        //Validamos la session
        const { user } = req.session
        if(!user) return res.status(403).send('Access not authorized')
            
        try{
        const { id } = req.params
        const validated_input = actividadSchema.parse(req.body);
        await ActividadModel.updateActividad(id, validated_input)
        res.status(200).json({"ok": true}).end()
        } catch (error) {
            console.error(error);
            res.status(400).json({ error: error.message });
        }
    }
}