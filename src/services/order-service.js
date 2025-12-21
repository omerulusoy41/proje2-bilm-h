const { Order, OrderItem, Customer, sequelize } = require('../models');

async function listOrders({ status, customerId, limit = 20, offset = 0 }) {
  const where = {};

  if (status) where.status = status;
  if (customerId) where.customerId = customerId;

  return Order.findAll({
    where,
    limit,
    offset,
    include: [
      {
        model: OrderItem,
        as: 'OrderItems'
      }
    ],
    order: [['createdAt', 'DESC']]
  });
}

function calculateTotalAmount(items = []) {
    return items.reduce((sum, item) => {
      const quantity = item.quantity ?? 1;
      return sum + quantity * item.unitPrice;
    }, 0);
  }
  
  async function createOrder({ customerId, status, items }) {
    return sequelize.transaction(async (t) => {
      const customer = await Customer.findByPk(customerId, { transaction: t });
      if (!customer) {
        throw new Error('CUSTOMER_NOT_FOUND');
      }
  
      const totalAmount = calculateTotalAmount(items);
  
      const order = await Order.create(
        {
          customerId,
          status: status || 'pending',
          totalAmount
        },
        { transaction: t }
      );
  
      if (items?.length) {
        const orderItems = items.map(i => ({
          orderId: order.id,
          productName: i.productName,
          quantity: i.quantity ?? 1,
          unitPrice: i.unitPrice
        }));
  
        await OrderItem.bulkCreate(orderItems, { transaction: t });
      }
  
      return order;
    });
  }

  async function getOrderById(id) {
    const order = await Order.findByPk(id, {
      include: [
        { model: OrderItem, as: 'OrderItems' }
      ]
    });
  
    if (!order) {
      throw new Error('ORDER_NOT_FOUND');
    }
  
    return order;
  }
  
  async function deleteOrder(id) {
    const order = await Order.findByPk(id);
    if (!order) {
      throw new Error('ORDER_NOT_FOUND');
    }
  
    await order.destroy();
  }
  

module.exports = {
  listOrders,
  createOrder,
  deleteOrder,
  getOrderById
};
