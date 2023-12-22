//configuraciones
const express = require('express');
const cors = require('cors');
const app = express();
const fs = require('fs');
const path = require('path');

const corsOptions = {
  origin: 'http://localhost:5173',
  methods: 'POST',
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));

app.use(express.json());
const multer = require('multer');


//configuracion del almacenamiento del multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const nombreCarpeta = req.body.nombreCarpeta;
    const postulacionesDir = path.join(__dirname, 'postulaciones'); // Cambié 'carpetas' a 'postulaciones'
    const carpetaPath = path.join(postulacionesDir, nombreCarpeta);

    if (!fs.existsSync(carpetaPath)) {
      fs.mkdirSync(carpetaPath);
    }

    cb(null, carpetaPath);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

app.post('/cargararchivo', upload.single('archivo'), (req, res) => {
  res.json({ mensaje: 'Archivo cargado exitosamente.' });
});

app.post('/crearcarpeta', upload.array('archivos', 15), (req, res) => {
  const nombreCarpeta = req.body.nombreCarpeta;
  const arrayRecibido = req.body.arrayRecibido;

  console.log('Nombre de la carpeta:', nombreCarpeta);
  console.log('Array recibido:', arrayRecibido);

  if (!nombreCarpeta) {
    return res.status(400).json({ error: 'El nombre de la carpeta es requerido.' });
  }  

  const postulacionesDir = path.join(__dirname, 'postulaciones');
  const carpetaPath = path.join(postulacionesDir, nombreCarpeta);

  if (!fs.existsSync(carpetaPath) || !fs.statSync(carpetaPath).isDirectory()) {
    return res.status(404).json({ error: 'La postulación no existe.' });
  }

  const archivos = fs.readdirSync(carpetaPath);


   // Construir la URL de la carpeta
   const urlCarpeta = `http://localhost:3000/postulaciones/${nombreCarpeta}`;

   // Enviar la URL como parte de la respuesta JSON
   res.status(200).json({ mensaje: 'Carpeta creada exitosamente.', urlCarpeta, archivos });

});

// Ruta GET para ver los archivos físicos de una postulación específica
app.get('/postulaciones/:nombreCarpeta', (req, res) => {
  const nombreCarpeta = req.params.nombreCarpeta;
  const postulacionesDir = path.join(__dirname, 'postulaciones');
  const carpetaPath = path.join(postulacionesDir, nombreCarpeta);

  if (!fs.existsSync(carpetaPath) || !fs.statSync(carpetaPath).isDirectory()) {
    return res.status(404).json({ error: 'La postulación no existe.' });
  }

  const archivos = fs.readdirSync(carpetaPath);
  res.status(200).json({ archivos });
});

// Ruta GET para acceder al contenido de un archivo específico
app.get('/postulaciones/:nombreCarpeta/:nombreArchivo', (req, res) => {
  const nombreCarpeta = req.params.nombreCarpeta;
  const nombreArchivo = req.params.nombreArchivo;
  const postulacionesDir = path.join(__dirname, 'postulaciones');
  const carpetaPath = path.join(postulacionesDir, nombreCarpeta);
  const filePath = path.join(carpetaPath, nombreArchivo);

  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    return res.status(404).json({ error: 'El archivo no existe.' });
  }

  // Configurar el encabezado Content-Type
  res.setHeader('Content-Type', 'application/pdf');

  // Leer el contenido del archivo y enviarlo como respuesta
  const contenidoArchivo = fs.readFileSync(filePath);
  res.status(200).send(contenidoArchivo);
});


// Ruta GET para obtener la lista de archivos en la carpeta 'Postulaciones'
app.get('/postulaciones', (req, res) => {
  const postulacionesDir = path.join(__dirname, 'postulaciones');

  if (!fs.existsSync(postulacionesDir) || !fs.statSync(postulacionesDir).isDirectory()) {
    return res.status(404).json({ error: 'La carpeta de postulaciones no existe.' });
  }

  const archivos = fs.readdirSync(postulacionesDir);
  res.status(200).json({ archivos });
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor en ejecución en http://localhost:${PORT}`);
});
