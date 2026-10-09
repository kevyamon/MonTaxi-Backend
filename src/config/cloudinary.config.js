const cloudinary = require('cloudinary').v2;
const envConfig = require('./env.config');

cloudinary.config({
  cloud_name: envConfig.cloudinary.cloudName,
  api_key: envConfig.cloudinary.apiKey,
  api_secret: envConfig.cloudinary.apiSecret,
  secure: true
});

module.exports = cloudinary;
