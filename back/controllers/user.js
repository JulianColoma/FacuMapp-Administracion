import { UserModel } from "../models/user.js";
import { userLoginSchema, userSchema } from "../schemas/user.js";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();

export class UserController {
  static create = async (req, res) => {
    //Validamos la session
    //const { user } = req.session
    //if(!user || !user.admin) return res.status(403).send('Access not authorized')

    try {
      const validated_input = userSchema.parse(req.body);
      await UserModel.create(validated_input);
      res.status(201).json({ ok: true }).end();
    } catch (error) {
      console.error(error);
      if (error.name === 'ZodError') {
        const errorMessage = error.errors[0]?.message || 'Error de validación';
        return res.status(400).json({ error: errorMessage });
      }
      res.status(400).json({ error: error.message });
    }
  };
  static login = async (req, res) => {
    try {
      const validated_input = userLoginSchema.parse(req.body);
      const user = await UserModel.login(validated_input);
      const exp = user.admin ? process.env.ADMINEXP : process.env.USEREXP;
      const token = jwt.sign(
        { name: user.nombre, user_id: user.id, admin: user.administrador },
        process.env.SECRET,
        {
          expiresIn: exp,
        }
      );
      res
        .cookie("access_token", token, {
          httpOnly: true,
          // In dev we need SameSite=None so the cookie is sent from http://localhost:5173
          // Secure can remain false locally because we are not on HTTPS
          secure: process.env.ENV === "production",
          sameSite: process.env.ENV === "production" ? "None" : "None",
        })
        .send({ user, token });
    } catch (error) {
      console.error(error);
      if (error.name === 'ZodError') {
        const errorMessage = error.errors[0]?.message || 'Error de validación';
        return res.status(400).json({ error: errorMessage });
      }
      res.status(400).json({ error: error.message });
    }
  };

  static getAll = async (req, res) => {
    try {
      const users = await UserModel.getAll();
      res.status(200).json(users);
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: error.message });
    }
  };

  static logout = async (req, res) => {
    res
      .clearCookie("access_token")
      .json({ ok: true, message: "Logout successful" });
  };

  static deleteUser = async (req, res) => {
    //Validamos la session
    const { user } = req.session;
    if (!user || !user.admin)
      return res.status(403).send("Access not authorized");
    try {
      const { id } = req.params;
      await UserModel.deleteUser(id);
      res.status(200).json({ ok: true, message: "User deleted successfully" });
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: error.message });
    }
  };
}
