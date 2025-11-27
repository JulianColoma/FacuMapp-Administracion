import { query } from "../config/database.js";
import bcrypt from "bcrypt"

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

  static getAll = async () => {
    const users = await query("SELECT id, nombre, administrador FROM users");
    return users;
  };

}
