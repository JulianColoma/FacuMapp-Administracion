import { query } from "../config/database.js";
import { encodeCursor } from "../utils/pagination.js";
export class EventoModel {
  static getAll = async ({ upcoming, search = "", limit, cursorId }) => {
    let q = `
      SELECT e.id, e.nombre, e.descripcion, 
             DATE_FORMAT(e.fecha_inicio, '%Y-%m-%d') as fecha_inicio,
             DATE_FORMAT(e.fecha_fin, '%Y-%m-%d') as fecha_fin,
             e.id_espacio, es.nombre as nombre_espacio 
      FROM evento e 
      LEFT JOIN espacio es ON e.id_espacio = es.id`;
    const conditions = [];
    const countConditions = [];
    const params = [];
    const countParams = [];

    if (upcoming === 'true' || upcoming === true) {
      conditions.push(`e.fecha_fin >= CURDATE()`);
      countConditions.push(`e.fecha_fin >= CURDATE()`);
    }

    const normalizedSearch = String(search).trim();
    if (normalizedSearch) {
      conditions.push(`(e.nombre LIKE ? OR e.descripcion LIKE ?)`);
      countConditions.push(`(e.nombre LIKE ? OR e.descripcion LIKE ?)`);
      const searchValue = `%${normalizedSearch}%`;
      params.push(searchValue, searchValue);
      countParams.push(searchValue, searchValue);
    }

    if (cursorId) {
      conditions.push(`e.id < ?`);
      params.push(cursorId);
    }

    if (conditions.length > 0) {
      q += ` WHERE ${conditions.join(" AND ")}`;
    }
    const countQuery = `SELECT COUNT(*) as total FROM evento e${
      countConditions.length > 0 ? ` WHERE ${countConditions.join(" AND ")}` : ""
    }`;

    q += ` ORDER BY e.id DESC LIMIT ?`;
    const eventos = await query(q, [...params, limit + 1]);
    const [{ total }] = await query(countQuery, countParams);

    const hasMore = eventos.length > limit;
    const items = hasMore ? eventos.slice(0, limit) : eventos;
    const nextCursor = hasMore ? encodeCursor(items[items.length - 1].id) : null;

    return { items, nextCursor, hasMore, limit, total };
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
