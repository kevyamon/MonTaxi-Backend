const http = require('http');
const app = require('./src/app');
const envConfig = require('./src/config/env.config');
const connectDatabase = require('./src/config/db.config');
const { initSocketServer } = require('./src/sockets/socket.server');

const server = http.createServer(app);

// Initialisation de Socket.io
const io = initSocketServer(server);
app.set('io', io);

const startServer = async () => {
  try {
    await connectDatabase();

    server.listen(envConfig.port, () => {
      console.log(`========================================`);
      console.log(`  MONTAXI API DÉMARRÉE SUR LE PORT ${envConfig.port}`);
      console.log(`  Environnement : ${envConfig.nodeEnv}`);
      console.log(`========================================`);
    });
  } catch (error) {
    console.error('Erreur fatale lors du démarrage du serveur :', error);
    process.exit(1);
  }
};

const handleShutdown = () => {
  console.log('Arrêt gracieux du serveur...');
  server.close(() => {
    console.log('Serveur HTTP fermé.');
    process.exit(0);
  });
};

process.on('SIGTERM', handleShutdown);
process.on('SIGINT', handleShutdown);

startServer();
