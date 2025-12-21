const { Sequelize } = require('sequelize');
const config = require('../config');
const logger = require('../lib/logger');

const sequelize = new Sequelize(
  config.db.database,
  config.db.username,
  config.db.password,
  {
    host: config.db.host,
    port: config.db.port,
    dialect: config.db.dialect,
    logging: msg => logger.debug(msg) 
  }
);

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.Customer = require('./customer')(sequelize, Sequelize.DataTypes);
db.Order = require('./order')(sequelize, Sequelize.DataTypes);
db.OrderItem = require('./order-item')(sequelize, Sequelize.DataTypes);


db.Customer.hasMany(db.Order, { foreignKey: 'customerId' });
db.Order.belongsTo(db.Customer, { foreignKey: 'customerId' });
db.Order.hasMany(db.OrderItem,{foreignKey:'orderId'})
db.OrderItem.belongsTo(db.Order, {foreignKey:'orderId'})

module.exports = db;
