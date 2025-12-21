const express = require('express');
const router = express.Router();
const logger = require('../lib/logger');
const orderService = require('../services/order-service');

/**
 * @swagger
 * components:
 *   schemas:
 *     OrderItem:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         orderId:
 *           type: integer
 *           example: 1
 *         productName:
 *           type: string
 *           example: "Laptop"
 *         quantity:
 *           type: integer
 *           example: 2
 *         unitPrice:
 *           type: number
 *           format: float
 *           example: 4500.50
 *
 *     Order:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         customerId:
 *           type: integer
 *           example: 1
 *         status:
 *           type: string
 *           example: "pending"
 *         totalAmount:
 *           type: number
 *           format: float
 *           example: 9001.0
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/OrderItem'
 */

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Tüm siparişleri listeler
 *     tags: [Orders]
 *     responses:
 *       200:
 *         description: Sipariş listesi
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 *
 *   post:
 *     summary: Yeni sipariş oluşturur
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - customerId
 *               - status
 *               - items
 *             properties:
 *               customerId:
 *                 type: integer
 *               status:
 *                 type: string
 *                 example: "pending"
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - productName
 *                     - quantity
 *                     - unitPrice
 *                   properties:
 *                     productName:
 *                       type: string
 *                     quantity:
 *                       type: integer
 *                     unitPrice:
 *                       type: number
 *                       format: float
 *     responses:
 *       201:
 *         description: Oluşturulan sipariş
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *
 * /api/orders/{id}:
 *   get:
 *     summary: ID ile sipariş getirir
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Sipariş detayları
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       404:
 *         description: Sipariş bulunamadı
 *
 *   put:
 *     summary: Mevcut siparişi günceller
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     productName:
 *                       type: string
 *                     quantity:
 *                       type: integer
 *                     unitPrice:
 *                       type: number
 *                       format: float
 *     responses:
 *       200:
 *         description: Güncellenen sipariş
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       404:
 *         description: Sipariş bulunamadı
 *
 *   delete:
 *     summary: Siparişi siler
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Silme başarılı
 *       404:
 *         description: Sipariş bulunamadı
 */

router.get('/', async (req, res, next) => {
  try {
    const { status, customerId, limit, offset } = req.query;

    const orders = await orderService.listOrders({
      status,
      customerId,
      limit: Number(limit) || 20,
      offset: Number(offset) || 0
    });

    res.json(orders);
  } catch (err) {
    logger.error('Error listing orders', { err });
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { customerId, status, items } = req.body;

    if (!customerId || !status) {
      return res.status(400).json({
        message: 'customerId ve status zorunludur'
      });
    }

    const order = await orderService.createOrder({
      customerId,
      status,
      items
    });

    res.status(201).json(order);
  } catch (err) {
    if (err.message === 'CUSTOMER_NOT_FOUND') {
      return res.status(404).json({
        message: 'Customer bulunamadı'
      });
    }

    logger.error('Error creating order', { err });
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const order = await orderService.getOrderById(req.params.id);
    res.json(order);
  } catch (err) {
    if (err.message === 'ORDER_NOT_FOUND') {
      return res.status(404).json({ message: 'Order bulunamadı' });
    }

    logger.error('Error getting order', { err });
    next(err);
  }
});

// DELETE /api/orders/:id
router.delete('/:id', async (req, res, next) => {
  try {
    await orderService.deleteOrder(req.params.id);
    res.status(204).send();
  } catch (err) {
    if (err.message === 'ORDER_NOT_FOUND') {
      return res.status(404).json({ message: 'Order bulunamadı' });
    }

    logger.error('Error deleting order', { err });
    next(err);
  }
});


module.exports = router;
