import { query } from "../config/database.js";
export class EspacioModel {
  static getAll = async () => {
    const espacios  = await query("SELECT * FROM espacio");
    return espacios;
  };
  static getById = async (id) => {
    const espacio  = await query(
      "SELECT * FROM espacio WHERE id = ?",
      [id]
    );
    return espacio[0];
  };
  static postEspacio = async (input) => {
    const { nombre, descripcion, imagen } = await input;

    await query(
      `INSERT INTO espacio (nombre,
    descripcion,imagen)
         VALUES (?, ?, ?);`,
      [nombre, descripcion, imagen]
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
    const newEspacio = {
      ...espacio[0],
      ...input,
    };

    await query(
      `UPDATE espacio
     SET nombre = ?,
         descripcion = ?,
         imagen=?
     WHERE id = ?;`,
      [newEspacio.nombre, newEspacio.descripcion, newEspacio.imagen, id]
    );
  };
 static addCategorias = async (id, input) => {
  const { categoria } = input
  
    await query(
      `INSERT INTO categoriaxespacio (id_categoria, id_espacio)
       VALUES (?, ?);`,
      [categoria.id, id]
    )
};
static removeCategoria = async (id, input) => {
  const { categoria } = input
  
    await query(
      `DELETE FROM categoriaxespacio 
       WHERE id_categoria = ? AND id_espacio = ?;`,
      [categoria.id, id]
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
    const { nombre } = await input;

    await query(
      `INSERT INTO categoria (nombre)
         VALUES (?);`,
      [nombre]
    );
    return true;
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
     SET nombre = ?
     WHERE id = ?;`,
      [newCategoria.nombre, id]
    );
  };
}
