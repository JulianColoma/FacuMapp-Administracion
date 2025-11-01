import { query } from "../config/database";
export class ActividadModel {

  static getAll = async () => {  
    const { rows: actividades } = await query("SELECT * FROM actividad");
    return actividades;
  };

  static getById = async (id) => {
    const { rows: actividad } = await query(
      "SELECT * FROM actividad WHERE id = $1",
      [id]
    );
    return actividad[0];
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
         VALUES ($1, $2, $3, $4, $5, $6, $7);`,
      [nombre, descripcion, fecha, hora_inicio, hora_fin, id_espacio, id_evento]
    );
    return true;
  };

  static deleteById = async (id) => {
    try {
      await query(`DELETE FROM actividad WHERE id = $1`, [id]);
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
     SET nombre = $1,
         descripcion = $2,
         fecha = $3,
         hora_inicio = $4,
         hora_fin = $5,
         id_espacio = $6,
         id_evento = $7
     WHERE id = $8;`,
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
