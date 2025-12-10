import {EventoSchema} from "../schemas/evento.js"
import { EventoModel } from "../models/evento.js"
export class EventoController {
    static getAll = async (req, res) => {
       
        try{
        const eventos = await EventoModel.getAll()
        res.json(eventos)
        } catch (error) {
            console.error(error);
            res.status(400).json({ error: error.message });
        }
    }
    
    static getById = async (req, res) => {
        

        try{
        const { id } = req.params
        const evento = await EventoModel.getById(id)
        res.json(evento)
        } catch (error) {
            console.error(error);
            res.status(400).json({ error: error.message });
        }
    }
    static postEvento = async (req, res) => {
        //Validamos la session
        const { user } = req.session
        if(!user) return res.status(403).send('Access not authorized')

        try {
            const validated_input = EventoSchema.parse(req.body);
            await EventoModel.postEvento(validated_input)
            res.status(201).json({"ok": true}); 
        } catch (error) {
            console.error(error);
            if (error.name === 'ZodError') {
                const errorMessage = error.errors[0]?.message || 'Error de validación';
                return res.status(400).json({ error: errorMessage });
            }
            res.status(400).json({ error: error.message });
        }
    }
    static deleteEvento = async (req, res) => {
        //Validamos la session
        const { user } = req.session
        if(!user) return res.status(403).send('Access not authorized')

        try{
        const { id } = req.params
        await EventoModel.deleteById(id)
        res.status(200).json({"ok": true})
        } catch (error) {
            console.error(error);
            res.status(400).json({ error: error.message });
        }
    }
    static updateEvento = async (req, res) => {
        //Validamos la session
        const { user } = req.session
        if(!user) return res.status(403).send('Access not authorized')

        try{
        const { id } = req.params
        const validated_input = EventoSchema.parse(req.body);
        await EventoModel.updateEvento(id, validated_input)
        res.status(200).json({"ok": true})
        } catch (error) {
            console.error(error);
            if (error.name === 'ZodError') {
                const errorMessage = error.errors[0]?.message || 'Error de validación';
                return res.status(400).json({ error: errorMessage });
            }
            res.status(400).json({ error: error.message });
        }
    }
}