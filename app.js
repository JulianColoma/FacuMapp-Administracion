import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { getUserData } from './middleware/user'
import { eventoRouter } from './routes/evento'
import { actividadRouter } from './routes/evento'
import { espacioRouter } from './routes/evento'
import { userRouter } from './routes/user';

console.log('🚀 Servidor iniciando...');

const app = express();
const PORT = process.env.PORT || 3000;

const corsOptions = {
    origin: 'http://localhost:5173', 
    credentials: true,
    sameSite: "None"
  };

// Middlewares
app.disable('x-powered-by')
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(cors(corsOptions))
app.use(express.json())
app.use(cookieParser())
app.use(getUserData)
app.use(userRouter)
app.use(eventoRouter)
app.use(actividadRouter)
app.use(espacioRouter)


app.listen(PORT, () => {
    console.log(`server listening on port http://localhost:${PORT}`)
})