import { query } from "../config/database.js";
export class ActividadModel {

  static getAll = async (id) => {  
    const actividades = await query("SELECT * FROM actividad WHERE id_evento = ?", [id]);
    return actividades;
  };

  static getById = async (id) => {
    const actividad  = await query(
      "SELECT * FROM actividad WHERE id = ?",
      [id]
    );
    return actividad;
  };

  static postActividad = async (input) => {
    const {
      nombre,
      descripcion,
      fecha,
      hora_inicio,
      hora_fin,
      id_espacio,
      id_evento,
    } = await input;

    await query(
      `INSERT INTO actividad (nombre,
    descripcion,
    fecha,
    hora_inicio,
    hora_fin,
    id_espacio,
    id_evento)
         VALUES (?, ?, ?, ?, ?, ?, ?);`,
      [nombre, descripcion, fecha, hora_inicio, hora_fin, id_espacio, id_evento]
    );
    return true;
  };

  static deleteById = async (id) => {
    try {
      await query(`DELETE FROM actividad WHERE id = ?`, [id]);
    } catch (e) {
      console.log(e);
    }
  };

  static updateActividad = async (id, input) => { 
    const { rows: actividad } = await this.getById(id);
    const newActividad = {
      ...actividad[0],
      ...input,
    };

    await query(
      `UPDATE actividad
     SET nombre = ?,
         descripcion = ?,
         fecha = ?,
         hora_inicio = ?,
         hora_fin = ?,
         id_espacio = ?,
         id_evento = ?
     WHERE id = ?;`,
      [
        newActividad.nombre,
        newActividad.descripcion,
        newActividad.fecha,
        newActividad.hora_inicio,
        newActividad.hora_fin,
        newActividad.id_espacio,
        newActividad.id_evento,
        id,
      ]
    );
  };
}
