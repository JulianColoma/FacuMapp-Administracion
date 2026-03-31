import { query } from "../config/database.js";
import { encodeCursor } from "../utils/pagination.js";
export class EspacioModel {
  static getAll = async ({ search = "", category = "", limit, cursorId }) => {
    const conditions = [];
    const pageParams = [];
    const countParams = [];
    const normalizedSearch = String(search).trim();
    const normalizedCategory = String(category).trim();

    if (normalizedSearch) {
      conditions.push(`(e.nombre LIKE ? OR e.descripcion LIKE ?)`);
      const searchValue = `%${normalizedSearch}%`;
      pageParams.push(searchValue, searchValue);
      countParams.push(searchValue, searchValue);
    }

    if (normalizedCategory) {
      conditions.push(`ce.id_categoria = ?`);
      pageParams.push(normalizedCategory);
      countParams.push(normalizedCategory);
    }

    if (cursorId) {
      conditions.push(`e.id < ?`);
      pageParams.push(cursorId);
    }

    const whereClause = conditions.length > 0 ? ` WHERE ${conditions.join(" AND ")}` : "";
    const idsQuery = `
      SELECT DISTINCT e.id
      FROM espacio e
      LEFT JOIN categoriaxespacio ce ON e.id = ce.id_espacio
      ${whereClause}
      ORDER BY e.id DESC
      LIMIT ?`;
    const idRows = await query(idsQuery, [...pageParams, limit + 1]);
    const hasMore = idRows.length > limit;
    const pageIds = (hasMore ? idRows.slice(0, limit) : idRows).map((row) => row.id);

    const countWhereClause = conditions
      .filter((condition) => condition !== `e.id < ?`)
      .join(" AND ");
    const totalQuery = `
      SELECT COUNT(DISTINCT e.id) AS total
      FROM espacio e
      LEFT JOIN categoriaxespacio ce ON e.id = ce.id_espacio
      ${countWhereClause ? ` WHERE ${countWhereClause}` : ""}`;
    const [{ total }] = await query(totalQuery, countParams);

    if (pageIds.length === 0) {
      return { items: [], nextCursor: null, hasMore: false, limit, total };
    }

    const placeholders = pageIds.map(() => "?").join(", ");
    const rows = await query(
      `SELECT e.*, c.id AS categoria_id, c.nombre AS categoria_nombre, c.color AS categoria_color
       FROM espacio e
       LEFT JOIN categoriaxespacio ce ON e.id = ce.id_espacio
       LEFT JOIN categoria c ON ce.id_categoria = c.id
       WHERE e.id IN (${placeholders})`,
      pageIds
    );

    const espaciosMap = new Map();
    for (const r of rows) {
      if (!espaciosMap.has(r.id)) {
        espaciosMap.set(r.id, {
          id: r.id,
          nombre: r.nombre,
          descripcion: r.descripcion,
          imagen: r.imagen,
          capacidad: r.capacidad,
          categorias: [],
        });
      }
      if (r.categoria_id) {
        espaciosMap.get(r.id).categorias.push({ id: r.categoria_id, nombre: r.categoria_nombre, color: r.categoria_color });
      }
    }

    const items = pageIds
      .map((id) => espaciosMap.get(id))
      .filter(Boolean);
    const nextCursor = hasMore ? encodeCursor(items[items.length - 1].id) : null;

    return { items, nextCursor, hasMore, limit, total };
  };
  static getById = async (id) => {
    const rows = await query(
      `SELECT e.*, c.id AS categoria_id, c.nombre AS categoria_nombre, c.color AS categoria_color
       FROM espacio e
       LEFT JOIN categoriaxespacio ce ON e.id = ce.id_espacio
       LEFT JOIN categoria c ON ce.id_categoria = c.id
       WHERE e.id = ?`,
      [id]
    );

    if (!rows || rows.length === 0) return null;

    const first = rows[0];
    const espacio = {
      id: first.id,
      nombre: first.nombre,
      descripcion: first.descripcion,
      imagen: first.imagen,
      capacidad: first.capacidad,
      categorias: [],
    };

    for (const r of rows) {
      if (r.categoria_id) espacio.categorias.push({ id: r.categoria_id, nombre: r.categoria_nombre, color: r.categoria_color });
    }

    return espacio;
  };
  static postEspacio = async (input) => {
    const { nombre, descripcion, imagen = null, capacidad } = await input;

    await query(
      `INSERT INTO espacio (nombre,
    descripcion, imagen, capacidad)
         VALUES (?, ?, ?, ?);`,
      [nombre, descripcion, imagen ?? null, capacidad]
    );
    return true;
  };
  static deleteById = async (id) => {
    try {
      await query(`DELETE FROM espacio WHERE id = ?`, [id]);
    } catch (e) {
      console.log(e);
    }
  };
  static updateEspacio = async (id, input) => {
    const espacio = await this.getById(id);
    if (!espacio) throw new Error('Espacio no encontrado');
    const newEspacio = {
      ...espacio,
      ...input,
    };
    const imagenValue = newEspacio.imagen ?? null;

    await query(
      `UPDATE espacio
     SET nombre = ?,
         descripcion = ?,
         imagen=?,
         capacidad=?
     WHERE id = ?;`,
      [newEspacio.nombre, newEspacio.descripcion, imagenValue, newEspacio.capacidad, id]
    );
  };
  static addCategorias = async (id, input) => {
    const { categoria } = input

    await query(
      `INSERT INTO categoriaxespacio (id_categoria, id_espacio)
       VALUES (?, ?);`,
      [categoria, id]
    )
  };
  static removeCategoria = async (id, input) => {
    const { categoria } = input

    await query(
      `DELETE FROM categoriaxespacio 
       WHERE id_categoria = ? AND id_espacio = ?;`,
      [categoria, id]
    )
  }
}

export class CategoriaModel {
  static getAll = async () => {
    const categorias = await query("SELECT * FROM categoria");
    return categorias;
  };
  static getById = async (id) => {
    const categoria = await query(
      "SELECT * FROM categoria WHERE id = ?",
      [id]
    );
    return categoria;
  };
  static postCategoria = async (input) => {
    const { nombre, color } = await input;

    const result = await query(
      `INSERT INTO categoria (nombre, color)
         VALUES (?, ?);`,
      [nombre, color]
    );
    return { id: result.insertId, nombre, color };
  };
  static deleteById = async (id) => {
    try {
      await query(`DELETE FROM categoria WHERE id = ?`, [id]);
    } catch (e) {
      console.log(e);
    }
  };
  static updateCategoria = async (id, input) => {
    const categoria = await this.getById(id);
    const newCategoria = {
      ...categoria[0],
      ...input,
    };

    await query(
      `UPDATE categoria
     SET nombre = ?,
         color = ?
     WHERE id = ?;`,
      [newCategoria.nombre, newCategoria.color, id]
    );
  };
}
