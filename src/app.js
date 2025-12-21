const express = require('express');
const logger = require('./lib/logger');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const customersRouter = require('./routes/customers');
const ordersRouter = require('./routes/orders');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./docs/swagger');



const app = express();
app.use(express.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(cors({
  origin: '*', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100,                
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

app.use((req, res, next) => {
  logger.info(`${req.method} ${req.originalUrl}`);
  next();
});

app.use('/api/customers', customersRouter);
app.use('/api/orders', ordersRouter);


app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Endpoint bulunamadı'
    }
  });
});

app.use((err, req, res, next) => {
  logger.error('Unhandled error', { err });

  const status = err.status || 500;

  res.status(status).json({
    success: false,
    error: {
      code: err.code || 'INTERNAL_SERVER_ERROR',
      message: err.message || 'Bir hata oluştu'
    }
  });
});

module.exports = app;
