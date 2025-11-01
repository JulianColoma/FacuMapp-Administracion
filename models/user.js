import { query } from "../config/database";
import bcrypt from "bcrypt"
export class  UserModel{
static create = async (input) =>{

    const { name, password } = await input
    
    const {rows:user} = await query(`SELECT * FROM users WHERE nombre = $1`, [name])
    if(user[0]) throw new Error('Duplicated username');

    if (!name || !password)  throw new Error('Missing required fields');
    
    const cryptPass = await bcrypt.hash(password, 10)

    await query(
        `INSERT INTO users (nombre, contraseña, administrador)
         VALUES ($1, $2, $3);`,
        [name, cryptPass, false]
    );
    return true
} 
static login = async (input) =>{
    const { name, password } = await input
    
    const {rows:user} = await query(`SELECT * FROM users WHERE nombre = $1`, [name])
    if(!user) throw new Error('User not found');

    const valid = await bcrypt.compare(password, user[0].password)
    if(!valid) throw new Error('invalid password');
    
    const {password: _, ...publicUser} = user[0]
    return publicUser
}
static deleteUser = async (name) => {
    try{
        await query(`DELETE FROM users WHERE nombre = $1`, [name])
        }catch(e){
            console.log(e)
        }
}
}