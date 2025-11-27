import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'

dotenv.config()

export function getUserData(req, res, next) {
    let token = null;

    if (req.cookies.access_token) {
        token = req.cookies.access_token;
    } else if (req.headers.authorization) {
        const [bearer, authToken] = req.headers.authorization.split(' ');
        if (bearer === 'Bearer') {
            token = authToken;
        }
    }

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