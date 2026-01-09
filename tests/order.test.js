const {
  listOrders,
  createOrder,
  getOrderById,
  deleteOrder
} = require('../src/services/order-service');

const {
  sequelize,
  Customer,
  Order,
  OrderItem
} = require('../src/models');

describe('Order Service', () => {

  let customer;

  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  beforeEach(async () => {
    await OrderItem.destroy({ where: {} });
    await Order.destroy({ where: {} });
    await Customer.destroy({ where: {} });

    customer = await Customer.create({
      firstName: 'Test',
      lastName: 'Customer',
      phone: '05321234567',
      email: 'test@customer.com'
    });
  });

  /* ---------------- CREATE ORDER ---------------- */

  test('createOrder creates order with items and calculates totalAmount', async () => {
    const order = await createOrder({
      customerId: customer.id,
      items: [
        { productName: 'Product A', quantity: 2, unitPrice: 100 },
        { productName: 'Product B', quantity: 1, unitPrice: 50 }
      ]
    });

    expect(order.id).toBeDefined();
    expect(order.totalAmount).toBe(250);

    const items = await OrderItem.findAll({ where: { orderId: order.id } });
    expect(items.length).toBe(2);
  });

  test('createOrder defaults status to pending', async () => {
    const order = await createOrder({
      customerId: customer.id,
      items: []
    });

    expect(order.status).toBe('pending');
  });

  test('createOrder throws error if customer not found', async () => {
    await expect(
      createOrder({
        customerId: 9999,
        items: []
      })
    ).rejects.toThrow('CUSTOMER_NOT_FOUND');
  });

  /* ---------------- LIST ORDERS ---------------- */

  test('listOrders returns orders with items', async () => {
    const order = await createOrder({
      customerId: customer.id,
      status: 'completed',
      items: [{ productName: 'X', unitPrice: 10 }]
    });

    const orders = await listOrders({});

    expect(orders.length).toBe(1);
    expect(orders[0].id).toBe(order.id);
    expect(orders[0].OrderItems.length).toBe(1);
  });

  test('listOrders filters by status', async () => {
    await createOrder({
      customerId: customer.id,
      status: 'pending',
      items: []
    });

    await createOrder({
      customerId: customer.id,
      status: 'completed',
      items: []
    });

    const completed = await listOrders({ status: 'completed' });

    expect(completed.length).toBe(1);
    expect(completed[0].status).toBe('completed');
  });

  /* ---------------- GET ORDER ---------------- */

  test('getOrderById returns order with items', async () => {
    const order = await createOrder({
      customerId: customer.id,
      items: [{ productName: 'Item', unitPrice: 20 }]
    });

    const found = await getOrderById(order.id);

    expect(found.id).toBe(order.id);
    expect(found.OrderItems.length).toBe(1);
  });

  test('getOrderById throws error if not found', async () => {
    await expect(
      getOrderById(9999)
    ).rejects.toThrow('ORDER_NOT_FOUND');
  });

  /* ---------------- DELETE ORDER ---------------- */

  test('deleteOrder removes order', async () => {
    const order = await createOrder({
      customerId: customer.id,
      items: []
    });

    await deleteOrder(order.id);

    const deleted = await Order.findByPk(order.id);
    expect(deleted).toBeNull();
  });

  test('deleteOrder throws error if not found', async () => {
    await expect(
      deleteOrder(9999)
    ).rejects.toThrow('ORDER_NOT_FOUND');
  });

});
