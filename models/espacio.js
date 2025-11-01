import { query } from "../config/database";
export class EspacioModel {
  static getAll = async () => {
    const { rows: espacios } = await query("SELECT * FROM espacio");
    return espacios;
  };
  static getById = async (id) => {
    const { rows: espacio } = await query(
      "SELECT * FROM espacio WHERE id = $1",
      [id]
    );
    return espacio[0];
  };
  static postEspacio = async (input) => {
    const { nombre, descripcion, imagen } = await input;

    await query(
      `INSERT INTO espacio (nombre,
    descripcion,imagen)
         VALUES ($1, $2, $3);`,
      [nombre, descripcion, imagen]
    );
    return true;
  };
  static deleteById = async (id) => {
    try {
      await query(`DELETE FROM espacio WHERE id = $1`, [id]);
    } catch (e) {
      console.log(e);
    }
  };
  static updateEspacio = async (id, input) => {
    const { rows: espacio } = await this.getById(id);
    const newEspacio = {
      ...espacio[0],
      ...input,
    };

    await query(
      `UPDATE espacio
     SET nombre = $1,
         descripcion = $2,
         imagen=$3
     WHERE id = $4;`,
      [newEspacio.nombre, newEspacio.descripcion, newEspacio.imagen, id]
    );
  };
 static addCategorias = async (id, input) => {
  const { categoria } = input
  
    await query(
      `INSERT INTO categoriaxespacio (id_categoria, id_espacio)
       VALUES ($1, $2);`,
      [categoria.id, id]
    )
};
static removeCategoria = async (id, input) => {
  const { categoria } = input
  
    await query(
      `DELETE FROM categoriaxespacio 
       WHERE id_categoria = $1 AND id_espacio = $2;`,
      [categoria.id, id]
    )
}
}

export class CategoriaModel {
  static getAll = async () => {
    const { rows: categorias } = await query("SELECT * FROM categoria");
    return categorias;
  };
  static getById = async (id) => {
    const { rows: categoria } = await query(
      "SELECT * FROM categoria WHERE id = $1",
      [id]
    );
    return categoria[0];
  };
  static postCategoria = async (input) => {
    const { nombre} = await input;

    await query(
      `INSERT INTO categoria (nombre)
         VALUES ($1);`,
      [nombre]
    );
    return true;
  };
  static deleteById = async (id) => {
    try {
      await query(`DELETE FROM categoria WHERE id = $1`, [id]);
    } catch (e) {
      console.log(e);
    }
  };
  static updateCategoria = async (id, input) => {
    const { rows: categoria } = await this.getById(id);
    const newCategoria = {
      ...categoria[0],
      ...input,
    };

    await query(
      `UPDATE categoria
     SET nombre = $1
     WHERE id = $2;`,
      [newCategoria.nombre, id]
    );
  };
}
