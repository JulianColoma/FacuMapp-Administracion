import { query } from "../config/database.js";
export class EventoModel {
  static getAll = async () => {
    const eventos = await query(
      `SELECT e.id, e.nombre, e.descripcion, 
              DATE_FORMAT(e.fecha_inicio, '%Y-%m-%d') as fecha_inicio,
              DATE_FORMAT(e.fecha_fin, '%Y-%m-%d') as fecha_fin,
              e.id_espacio, es.nombre as nombre_espacio 
       FROM evento e 
       LEFT JOIN espacio es ON e.id_espacio = es.id`
    );
    return eventos;
  };

  static getById = async (id) => {
    const evento = await query(
      `SELECT e.id, e.nombre, e.descripcion, 
              DATE_FORMAT(e.fecha_inicio, '%Y-%m-%d') as fecha_inicio,
              DATE_FORMAT(e.fecha_fin, '%Y-%m-%d') as fecha_fin,
              e.id_espacio, es.nombre as nombre_espacio 
       FROM evento e 
       LEFT JOIN espacio es ON e.id_espacio = es.id 
       WHERE e.id = ?`,
      [id]
    );
    return evento[0];
  };

  static postEvento = async (input) => {
    const { nombre, descripcion, fecha_inicio, fecha_fin, id_espacio } = input;

    await query(
      `INSERT INTO evento (nombre, descripcion, fecha_inicio, fecha_fin, id_espacio)
       VALUES (?, ?, ?, ?, ?);`,
      [nombre, descripcion, fecha_inicio, fecha_fin, id_espacio || null]
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
    const evento = await this.getById(id);
    const newEvento = {
      ...evento,
      ...input,
    };

    await query(
      `UPDATE evento
     SET nombre = ?,
         descripcion = ?,
         fecha_inicio = ?,
         fecha_fin = ?,
         id_espacio = ?
     WHERE id = ?;`,
      [
        newEvento.nombre,
        newEvento.descripcion,
        newEvento.fecha_inicio,
        newEvento.fecha_fin,
        newEvento.id_espacio || null,
        id,
      ]
    );
  };
}
