const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const envConfig = require('./config/env.config');
const { apiLimiter } = require('./middlewares/rateLimiter.middleware');
const { notFoundHandler, globalErrorHandler } = require('./middlewares/error.middleware');

const app = express();

// Middlewares de sécurité et d'optimisation
app.use(helmet());
app.use(cors({
  origin: envConfig.clientUrl === '*' ? true : envConfig.clientUrl,
  credentials: true
}));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Limiteur de débit global
app.use('/api/', apiLimiter);

// Route Healthcheck
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'MonTaxi API opérationnelle',
    timestamp: new Date().toISOString(),
    environment: envConfig.nodeEnv
  });
});

// Importation et montage des routes applicatives
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const rideRoutes = require('./routes/ride.routes');
const driverRoutes = require('./routes/driver.routes');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/rides', rideRoutes);
app.use('/api/drivers', driverRoutes);

// Gestion des routes inexistantes et erreurs globales
app.use(notFoundHandler);
app.use(globalErrorHandler);

module.exports = app;
