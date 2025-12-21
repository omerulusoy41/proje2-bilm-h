module.exports = (sequelize, DataTypes) => {
    const OrderItem = sequelize.define('OrderItem', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
  
      orderId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'order_id'
      },
  
      productName: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'product_name'
      },
  
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
      },
  
      unitPrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        field: 'unit_price'
      }
  
    }, {
      tableName: 'order_items',
      timestamps: false,
      underscored: true
    });
  
    OrderItem.associate = (models) => {
        OrderItem.belongsTo(models.Order, {
          foreignKey: 'orderId',
          as: 'order_items',
          onDelete: 'CASCADE'
        });
      };
  
    return OrderItem;
  };
  