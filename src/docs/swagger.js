const swaggerJSDoc = require('swagger-jsdoc');
const path = require('path');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Order API',
      version: '1.0.0',
      description: 'proje'
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Local'
      }
    ]
  },

  apis: [
    path.join(__dirname, '../routes/*.js'),
    path.join(__dirname, '../models/*.js')
  ]
};

module.exports = swaggerJSDoc(options);
