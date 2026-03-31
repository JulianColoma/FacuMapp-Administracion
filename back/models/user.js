import { query } from "../config/database.js";
import bcrypt from "bcryptjs"
import { encodeCursor } from "../utils/pagination.js";

export class UserModel {
  static create = async (input) => {
    const { nombre, contrasena, administrador } = input;

    const [existingUser] = await query('SELECT * FROM users WHERE nombre = ?', [nombre]);
    if (existingUser) {
      throw new Error('Duplicated username');
    }

    const cryptPass = await bcrypt.hash(contrasena, 10);

    await query(
      `INSERT INTO users (nombre, contrasena, administrador)
       VALUES (?, ?, ?);`,
      [nombre, cryptPass, administrador || false]
    );
    return true;
  }

  static login = async (input) => {
    const { nombre, contrasena } = input;

    const [user] = await query('SELECT * FROM users WHERE nombre = ?', [nombre]);
    if (!user) {
      throw new Error('User not found');
    }

    const valid = await bcrypt.compare(contrasena, user.contrasena);
    if (!valid) {
      throw new Error('invalid password');
    }

    const { contrasena: _, ...publicUser } = user;
    return publicUser;
  }

  static deleteUser = async (id) => {
    try {
      await query(`DELETE FROM users WHERE id = ?`, [id]);
    } catch (e) {
      console.log(e);
    }
  }

  static getAll = async ({ search = "", limit, cursorId }) => {
    const conditions = [];
    const params = [];
    const countParams = [];
    const normalizedSearch = String(search).trim();

    if (normalizedSearch) {
      conditions.push(`(nombre LIKE ? OR (CASE WHEN administrador = 1 THEN 'administrador' ELSE 'usuario' END) LIKE ?)`);
      const searchValue = `%${normalizedSearch}%`;
      params.push(searchValue, searchValue);
      countParams.push(searchValue, searchValue);
    }

    if (cursorId) {
      conditions.push(`id < ?`);
      params.push(cursorId);
    }

    const whereClause = conditions.length > 0 ? ` WHERE ${conditions.join(" AND ")}` : "";
    const users = await query(
      `SELECT id, nombre, administrador
       FROM users
       ${whereClause}
       ORDER BY id DESC
       LIMIT ?`,
      [...params, limit + 1]
    );
    const countWhereClause = conditions
      .filter((condition) => condition !== `id < ?`)
      .join(" AND ");
    const [{ total }] = await query(
      `SELECT COUNT(*) AS total FROM users${countWhereClause ? ` WHERE ${countWhereClause}` : ""}`,
      countParams
    );

    const hasMore = users.length > limit;
    const items = hasMore ? users.slice(0, limit) : users;
    const nextCursor = hasMore ? encodeCursor(items[items.length - 1].id) : null;

    return { items, nextCursor, hasMore, limit, total };
  };

}
