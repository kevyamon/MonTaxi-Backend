const dotenv = require('dotenv');

dotenv.config();

const envConfig = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  clientUrl: process.env.CLIENT_URL || '*',
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/montaxi_db',
  redisUrl: process.env.REDIS_URL || '',
  redis: {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined
  },
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'dev_secret_access_montaxi_key_2026',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev_secret_refresh_montaxi_key_2026',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d'
  },
  geo: {
    locationIqApiKey: process.env.LOCATIONIQ_API_KEY || '',
    defaultLatitude: parseFloat(process.env.DEFAULT_LATITUDE || '5.359952'),
    defaultLongitude: parseFloat(process.env.DEFAULT_LONGITUDE || '-4.008256'),
    maxDispatchRadiusKm: parseFloat(process.env.MAX_DISPATCH_RADIUS_KM || '15')
  },
  expo: {
    accessToken: process.env.EXPO_ACCESS_TOKEN || ''
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || ''
  }
};

module.exports = envConfig;
