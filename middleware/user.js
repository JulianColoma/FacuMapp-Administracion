//middleware que intercepta la cookie de sesion de usuario
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'

dotenv.config()

export function getUserData(req, res, next) {
    const token = req.cookies.access_token
    console.log("token recibido:", token)
    req.session = {user: null}

    try{
        const data = jwt.verify(token, process.env.SECRET)
        req.session.user = data
    }catch(err){
        console.error('Error al verificar token:', err);
        req.session.user = null
    }
    next()
}