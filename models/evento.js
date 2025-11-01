import { query } from "../config/database";
export class EventoModel {
  static getAll = async () => {
    const { rows: eventos } = await query("SELECT * FROM evento");
    return eventos;
  };

  static getById = async (id) => {
    const { rows: evento } = await query(
      "SELECT * FROM evento WHERE id = $1",
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
         VALUES ($1, $2, $3, $4, $5, $6, $7);`,
      [nombre,
    descripcion,
    fecha_inicio,
    fecha_fin]
    );
    return true;
  };

  static deleteById = async (id) => {
    try {
      await query(`DELETE FROM evento WHERE id = $1`, [id]);
    } catch (e) {
      console.log(e);
    }
  };
  static updateEvento = async (id, input) => {
    const { rows: evento } = await this.getById(id);
    const newEvento = {
      ...evento[0],
      ...input,
    };

    await query(
      `UPDATE evento
     SET nombre = $1,
         descripcion = $2,
         fecha_inicio = $3,
         fecha_fin = $4,
     WHERE id = $5;`,
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
