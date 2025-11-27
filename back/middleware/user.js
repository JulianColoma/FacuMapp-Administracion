import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'

dotenv.config()

export function getUserData(req, res, next) {
    const token = req.cookies.access_token
    console.log("token recibido:", token)

    if (!req.session) {
        req.session = {}
    }

    try{
        const data = jwt.verify(token, process.env.SECRET)
        req.session.user = data
    }catch(err){
        req.session.user = null
    }
    next()
}
