
export class actividadController {
    static getAll = async (req, res) => {
        try{
        const actividades = await //aca va el modelo
        res.json(actividades)
        res.status(200).end()
        } catch (error) {
            console.error(error);
            res.status(400).json({ error: error.message });
        }
    }
    
    static getById = async (req, res) => {
        try{
        const { id } = req.params
        const actividad = await //aca va el modelo
        res.json(actividad)
        res.status(200).end()
        } catch (error) {
            console.error(error);
            res.status(400).json({ error: error.message });
        }
    }
    static postActividad = async (req, res) => {
        try {
            await //aca va el modelo
            res.status(201).json({"ok": true}).end(); 
        } catch (error) {
            console.error(error);
            res.status(400).json({ error: error.message });
        }
    }
    static deleteActividad = async (req, res) => {
        try{
        const { id } = req.params
        await //aca va el modelo
        res.status(200).json({"ok": true}).end()
        } catch (error) {
            console.error(error);
            res.status(400).json({ error: error.message });
        }
    }
    static updateActividad = async (req, res) => {
        try{
        const { id } = req.params
        await //aca va el modelo
        res.status(200).json({"ok": true}).end()
        } catch (error) {
            console.error(error);
            res.status(400).json({ error: error.message });
        }
    }
}