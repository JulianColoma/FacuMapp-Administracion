import { query } from "../config/database.js";
export class EspacioModel {
  static getAll = async () => {
    const rows = await query(
      `SELECT e.*, c.id AS categoria_id, c.nombre AS categoria_nombre, c.color AS categoria_color
       FROM espacio e
       LEFT JOIN categoriaxespacio ce ON e.id = ce.id_espacio
       LEFT JOIN categoria c ON ce.id_categoria = c.id`
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

    return Array.from(espaciosMap.values());
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
