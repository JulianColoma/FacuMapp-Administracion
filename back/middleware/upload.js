import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carpeta destino (uploads/)
const uploadDir = path.join(__dirname, "../uploads");

// Si no existe, la crea
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Configuración de almacenamiento
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
  const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
  const ext = path.extname(file.originalname);
  cb(null, file.fieldname + "-" + uniqueSuffix + ext);
}
});

// Filtro opcional de tipo de archivo
const fileFilter = (req, file, cb) => {
  const allowed = ["image/webp", "image/png", "image/jpeg", "image/jpg"];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error("Solo se permiten imágenes WEBP, PNG, JPG o JPEG"));
};

export const upload = multer({ storage, fileFilter });
