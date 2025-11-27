import { query } from "../config/database.js";
export class EventoModel {
  static getAll = async () => {
    const eventos = await query("SELECT * FROM evento");
    return eventos;
  };

  static getById = async (id) => {
    const evento = await query(
      "SELECT * FROM evento WHERE id = ?",
      [id]
    );
    return evento[0];
  };

  static postEvento = async (input) => {
    const {
      nombre,
    descripcion,
    fecha_inicio,
    fecha_fin
    } = await input;

    await query(
      `INSERT INTO evento (nombre,
    descripcion,
    fecha_inicio,
    fecha_fin)
         VALUES (?, ?, ?, ?, ?, ?, ?);`,
      [nombre,
    descripcion,
    fecha_inicio,
    fecha_fin]
    );
    return true;
  };

  static deleteById = async (id) => {
    try {
      await query(`DELETE FROM evento WHERE id = ?`, [id]);
    } catch (e) {
      console.log(e);
    }
  };
  static updateEvento = async (id, input) => {
    const  evento  = await this.getById(id);
    const newEvento = {
      ...evento[0],
      ...input,
    };

    await query(
      `UPDATE evento
     SET nombre = ?,
         descripcion = ?,
         fecha_inicio = ?,
         fecha_fin = ?
     WHERE id = ?;`,
      [
        newEvento.nombre,
        newEvento.descripcion,
        newEvento.fecha_inicio,
        newEvento.fecha_fin,
        id,
      ]
    );
  };
}
