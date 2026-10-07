const Redis = require('ioredis');
const envConfig = require('./env.config');

let redisClient = null;

try {
  redisClient = new Redis({
    host: envConfig.redis.host,
    port: envConfig.redis.port,
    password: envConfig.redis.password,
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    retryStrategy: (times) => {
      if (times > 5) {
        console.warn('[Redis] Nombre maximal de tentatives atteint. Mode dégradé sans cache.');
        return null;
      }
      return Math.min(times * 1000, 3000);
    },
    lazyConnect: true
  });

  redisClient.on('connect', () => {
    console.log('[Redis] Connexion établie');
  });

  redisClient.on('error', (err) => {
    console.warn('[Redis] Avertissement de connexion :', err.message);
  });
} catch (err) {
  console.warn('[Redis] Initialisation ignorée :', err.message);
}

module.exports = redisClient;
