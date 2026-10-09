const streamifier = require('streamifier');
const cloudinary = require('../../config/cloudinary.config');

/**
 * Téléverse un buffer mémoire vers Cloudinary
 * @param {Buffer} buffer - Données binaires du fichier
 * @param {Object} options - Options Cloudinary (folder, transformations, tags)
 * @returns {Promise<Object>} - Résultat Cloudinary (url, public_id, format, etc.)
 */
const uploadBuffer = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const defaultOptions = {
      folder: 'montaxi/general',
      resource_type: 'image',
      format: 'webp',
      quality: 'auto:good'
    };

    const uploadOptions = { ...defaultOptions, ...options };

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          console.error('[Cloudinary] Échec téléversement :', error);
          return reject(new Error('Erreur lors du téléversement sur le stockage distant.'));
        }
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          format: result.format,
          width: result.width,
          height: result.height,
          bytes: result.bytes
        });
      }
    );

    // Si streamifier n'est pas installé, on peut utiliser un Readable stream natif de Node.js
    const { Readable } = require('stream');
    const readableStream = new Readable();
    readableStream.push(buffer);
    readableStream.push(null);
    readableStream.pipe(uploadStream);
  });
};

/**
 * Téléverse un avatar utilisateur optimisé
 * @param {Buffer} buffer - Buffer de l'image
 * @param {string} userId - Identifiant unique de l'utilisateur
 */
const uploadAvatar = async (buffer, userId) => {
  return uploadBuffer(buffer, {
    folder: 'montaxi/avatars',
    public_id: `avatar_${userId}_${Date.now()}`,
    transformation: [
      { width: 400, height: 400, crop: 'fill', gravity: 'face' },
      { fetch_format: 'auto', quality: 'auto' }
    ]
  });
};

/**
 * Téléverse un document officiel (permis, carte grise, etc.)
 * @param {Buffer} buffer - Buffer de l'image
 * @param {string} driverId - Identifiant du chauffeur
 * @param {string} docType - Type de document (license, insurance, id_card)
 */
const uploadDriverDocument = async (buffer, driverId, docType) => {
  return uploadBuffer(buffer, {
    folder: `montaxi/documents/${driverId}`,
    public_id: `${docType}_${Date.now()}`,
    transformation: [
      { width: 1200, height: 1200, crop: 'limit' },
      { fetch_format: 'auto', quality: 'auto' }
    ]
  });
};

/**
 * Supprime un asset sur Cloudinary par son public_id
 * @param {string} publicId - Identifiant public Cloudinary
 */
const deleteAsset = async (publicId) => {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.warn('[Cloudinary] Échec suppression asset :', publicId, error.message);
  }
};

module.exports = {
  uploadBuffer,
  uploadAvatar,
  uploadDriverDocument,
  deleteAsset
};
