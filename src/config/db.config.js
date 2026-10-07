const mongoose = require('mongoose');
const envConfig = require('./env.config');

const connectDatabase = async () => {
  try {
    const options = {
      autoIndex: !envConfig.isProduction,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000
    };

    mongoose.connection.on('connected', () => {
      console.log('[MongoDB] Connexion établie avec succès');
    });

    mongoose.connection.on('error', (err) => {
      console.error('[MongoDB] Erreur de connexion :', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('[MongoDB] Connexion interrompue');
    });

    await mongoose.connect(envConfig.mongoUri, options);
  } catch (error) {
    console.error('[MongoDB] Échec de la connexion initiale :', error.message);
    process.exit(1);
  }
};

module.exports = connectDatabase;
