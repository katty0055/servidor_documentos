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

});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor en ejecución en http://localhost:${PORT}`);
});
