/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Yeni order oluştur
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateOrderRequest'
 *     responses:
 *       201:
 *         description: Order oluşturuldu
 *       404:
 *         description: Customer bulunamadı
 */


module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define('Order', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    customerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'customer_id'
    },

    status: {
      type: DataTypes.ENUM('pending', 'preparing', 'completed', 'cancelled'),
      allowNull: false,
      defaultValue: 'pending'
    },

    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0
    }

  }, {
    tableName: 'orders',
    timestamps: true,
    underscored: true
  });

  Order.associate = (models) => {
    Order.belongsTo(models.Customer, {
      foreignKey: 'customerId',
      as: 'customer',
      onDelete: 'CASCADE'
    });

    Order.hasMany(models.OrderItem, {
      foreignKey: 'orderId',
      as: 'order_items'
    });
  };

  return Order;
};
