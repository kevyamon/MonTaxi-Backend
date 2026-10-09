const multer = require('multer');

// Stockage temporaire en mémoire RAM pour traitement direct en flux
const storage = multer.memoryStorage();

// Filtre de sécurité des types MIME autorisés
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp'
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    const error = new Error('Format de fichier non supporté. Formats acceptés : JPEG, PNG, WEBP.');
    error.statusCode = 400;
    cb(error, false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // Limite stricte de 5 Mo par fichier
  }
});

module.exports = {
  uploadSingleImage: upload.single('image'),
  uploadSingleDocument: upload.single('document'),
  uploadMultipleDocs: upload.array('documents', 4)
};
