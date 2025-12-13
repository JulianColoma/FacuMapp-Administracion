import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';

// Routers
import { eventoRouter } from './routes/evento.js';
import { actividadRouter } from './routes/actividad.js';
import { espacioRouter, categoriaRouter } from './routes/espacio.js';
import { userRouter } from './routes/user.js';

// Middleware user
import { getUserData } from './middleware/user.js';

// FIX para __dirname en ESModules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Servidor iniciando...');

const app = express();
const PORT = process.env.PORT || 3000;

let corsOptions;

if (process.env.NODE_ENV === 'development') {
    // Relaxed CORS for development to allow any origin
    corsOptions = {
        origin: true, // Reflects the request origin
        credentials: true,
    };
} else {
    // Stricter CORS for production
    corsOptions = {
        origin: ['http://localhost:5173', 'https://5173-firebase-facumapp-admingit-1764111526599.cluster-udxxdyopu5c7cwhhtg6mmadhvs.cloudworkstations.dev'],
        credentials: true,
    };
}

// Middlewares globales
app.disable('x-powered-by');
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// Middleware user 
app.use(getUserData);

app.get("/test", (req, res) => {
    res.status(200).json({
        ok: true,
        message: "API funcionando correctamente chavales",
        time: new Date().toISOString()
    });
});


// Routers principales
app.use(userRouter);
app.use(eventoRouter);
app.use(actividadRouter);
app.use(espacioRouter);
app.use(categoriaRouter);


app.listen(PORT, () => {
    console.log(`server listening on port http://localhost:${PORT}`);
});
