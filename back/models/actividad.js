import { query } from "../config/database.js";
export class ActividadModel {

  static getAll = async (id) => {  
    const actividades = await query(
      `SELECT id, nombre, descripcion,
              DATE_FORMAT(fecha, '%Y-%m-%d') as fecha,
              hora_inicio, hora_fin, id_espacio, id_evento
       FROM actividad WHERE id_evento = ?`, 
      [id]
    );
    return actividades;
  };

  static getById = async (id) => {
    const actividad = await query(
      `SELECT id, nombre, descripcion,
              DATE_FORMAT(fecha, '%Y-%m-%d') as fecha,
              hora_inicio, hora_fin, id_espacio, id_evento
       FROM actividad WHERE id = ?`,
      [id]
    );
    return actividad[0] ?? null;
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

    // Validar que la fecha de la actividad esté dentro del rango del evento
    const [evento] = await query(
      "SELECT fecha_inicio, fecha_fin FROM evento WHERE id = ?",
      [id_evento]
    );

    if (!evento) {
      throw new Error('El evento no existe');
    }

    const fechaActividad = new Date(fecha);
    const fechaInicio = new Date(evento.fecha_inicio);
    const fechaFin = new Date(evento.fecha_fin);

    // Comparar solo las fechas (sin hora)
    fechaActividad.setHours(0, 0, 0, 0);
    fechaInicio.setHours(0, 0, 0, 0);
    fechaFin.setHours(0, 0, 0, 0);

    if (fechaActividad < fechaInicio) {
      throw new Error('La fecha de la actividad no puede ser anterior a la fecha de inicio del evento');
    }

    if (fechaActividad > fechaFin) {
      throw new Error('La fecha de la actividad no puede ser posterior a la fecha de fin del evento');
    }

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
    const actividad = await this.getById(id);
    if (!actividad) {
      throw new Error('Actividad no encontrada');
    }
    const newActividad = {
      ...actividad,
      ...input,
    };

    // Validar que la fecha de la actividad esté dentro del rango del evento
    const [evento] = await query(
      "SELECT fecha_inicio, fecha_fin FROM evento WHERE id = ?",
      [newActividad.id_evento]
    );

    if (!evento) {
      throw new Error('El evento no existe');
    }

    const fechaActividad = new Date(newActividad.fecha);
    const fechaInicio = new Date(evento.fecha_inicio);
    const fechaFin = new Date(evento.fecha_fin);

    // Comparar solo las fechas (sin hora)
    fechaActividad.setHours(0, 0, 0, 0);
    fechaInicio.setHours(0, 0, 0, 0);
    fechaFin.setHours(0, 0, 0, 0);

    if (fechaActividad < fechaInicio) {
      throw new Error('La fecha de la actividad no puede ser anterior a la fecha de inicio del evento');
    }

    if (fechaActividad > fechaFin) {
      throw new Error('La fecha de la actividad no puede ser posterior a la fecha de fin del evento');
    }

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
