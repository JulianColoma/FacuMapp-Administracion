import {
  CategoriasSchema,
  EspacioSchema,
  CategoriaSchema,
} from "../schemas/espacio.js";
import { EspacioModel, CategoriaModel } from "../models/espacio.js";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class EspacioController {
  static getAll = async (req, res) => {
    try {
      const espacios = await EspacioModel.getAll();
      res.status(200).json(espacios);
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: error.message });
    }
  };

  static getById = async (req, res) => {
    try {
      const { id } = req.params;
      const espacio = await EspacioModel.getById(id);
      res.json(espacio);
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: error.message });
    }
  };

  static postEspacio = async (req, res) => {
    //Validamos la session
    const { user } = req.session;
    if (!user || !user.admin)
      return res.status(403).send("Access not authorized");

    try {
      const validated_input = EspacioSchema.parse(req.body);
      if (req.file) {
        validated_input.imagen = `/uploads/${req.file.filename}`;
      }
      await EspacioModel.postEspacio(validated_input);
      res.status(201).json({ ok: true });
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: error.message });
    }
  };
  
  
  static deleteEspacio = async (req, res) => {
    const { user } = req.session;
    if (!user || !user.admin)
      return res.status(403).send("Access not authorized");

    try {
      const { id } = req.params;
      const espacio = await EspacioModel.getById(id);

      if (espacio && espacio.imagen) {
        const oldPath = path.join(__dirname, "../uploads", espacio.imagen);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }

      await EspacioModel.deleteById(id);
      res.status(200).json({ ok: true });
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: error.message });
    }
  };

  static updateEspacio = async (req, res) => {
    const { user } = req.session;
    if (!user || !user.admin)
      return res.status(403).send("Access not authorized");

    try {
      const { id } = req.params;
      const validated_input = EspacioSchema.parse(req.body);

      if (req.file) {
        const espacioActual = await EspacioModel.getById(id);
        if (espacioActual && espacioActual.imagen) {
          const oldPath = path.join(
            __dirname,
            "../uploads",
            espacioActual.imagen
          );
          if (fs.existsSync(oldPath)) {
            fs.unlinkSync(oldPath);
          }
        }
        validated_input.imagen = req.file.filename;
      } else {
        // Si no se sube una nueva imagen, mantenemos la anterior
        const espacioActual = await EspacioModel.getById(id);
        validated_input.imagen = espacioActual.imagen;
      }

      await EspacioModel.updateEspacio(id, validated_input);
      res.status(200).json({ ok: true });
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: error.message });
    }
  };

  static addCategoria = async (req, res) => {
    //Validamos la session
    const { user } = req.session;
    if (!user || !user.admin)
      return res.status(403).send("Access not authorized");

    try {
      const { id } = req.params;
      const validated_input = CategoriasSchema.parse(req.body);
      await EspacioModel.addCategorias(id, validated_input);
      res.status(201).json({ ok: true });
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: error.message });
    }
  };

  static removeCategoria = async (req, res) => {
    //Validamos la session
    const { user } = req.session;
    if (!user || !user.admin)
      return res.status(403).send("Access not authorized");

    try {
      const { id } = req.params;
      const validated_input = CategoriasSchema.parse(req.body);
      await EspacioModel.removeCategoria(id, validated_input);
      res.status(201).json({ ok: true });
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: error.message });
    }
  };
}

export class CategoriaController {
  static getAll = async (req, res) => {
    try {
      const categorias = await CategoriaModel.getAll();
      res.json(categorias);
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: error.message });
    }
  };

  static getById = async (req, res) => {
    try {
      const { id } = req.params;
      const categoria = await CategoriaModel.getById(id);
      res.json(categoria);
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: error.message });
    }
  };

  static postCategoria = async (req, res) => {
    //Validamos la session
    const { user } = req.session;
    if (!user || !user.admin)
      return res.status(403).send("Access not authorized");

    try {
      const validated_input = CategoriaSchema.parse(req.body);
      await CategoriaModel.postCategoria(validated_input);
      res.status(201).json({ ok: true });
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: error.message });
    }
  };
  static deleteCategoria = async (req, res) => {
    //Validamos la session
    const { user } = req.session;
    if (!user || !user.admin)
      return res.status(403).send("Access not authorized");

    try {
      const { id } = req.params;
      await CategoriaModel.deleteById(id);
      res.status(200).json({ ok: true });
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: error.message });
    }
  };

  static updateCategoria = async (req, res) => {
    //Validamos la session
    const { user } = req.session;
    if (!user || !user.admin)
      return res.status(403).send("Access not authorized");

    try {
      const { id } = req.params;
      const validated_input = CategoriaSchema.parse(req.body);
      await CategoriaModel.updateCategoria(id, validated_input);
      res.status(200).json({ ok: true });
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: error.message });
    }
  };
}
