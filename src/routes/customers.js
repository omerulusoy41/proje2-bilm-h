const express = require('express');
const router = express.Router();
const customerService = require('../services/customerService');
const logger = require('../lib/logger');
const multer = require('multer');          
const upload = multer({ dest: 'uploads/' }); 
const path = require('path');

/**
 * @swagger
 * components:
 *   schemas:
 *     Customer:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         firstName:
 *           type: string
 *           example: "Ahmet"
 *         lastName:
 *           type: string
 *           example: "Yılmaz"
 *         phone:
 *           type: string
 *           example: "+905551234567"
 *         email:
 *           type: string
 *           example: "ahmet@example.com"
 *         address:
 *           type: string
 *           example: "Istanbul, Turkey"
 *         isActive:
 *           type: boolean
 *           example: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/customers:
 *   get:
 *     summary: Tüm müşterileri listeler
 *     tags: [Customers]
 *     responses:
 *       200:
 *         description: Müşteri listesi
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Customer'
 *
 *   post:
 *     summary: Yeni müşteri oluşturur
 *     tags: [Customers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *               address:
 *                 type: string
 *     responses:
 *       201:
 *         description: Oluşturulan müşteri
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Customer'
 *
 * /api/customers/{id}:
 *   get:
 *     summary: ID ile müşteri getirir
 *     tags: [Customers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Müşteri detayları
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Customer'
 *       404:
 *         description: Müşteri bulunamadı
 *
 *   put:
 *     summary: Mevcut müşteriyi günceller
 *     tags: [Customers]
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
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *               address:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Güncellenen müşteri
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Customer'
 *       404:
 *         description: Müşteri bulunamadı
 *
 *   delete:
 *     summary: Müşteriyi siler
 *     tags: [Customers]
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
 *         description: Müşteri bulunamadı
 */


router.get('/', async (req, res, next) => {
  try {
    const customers = await customerService.listCustomers();
    res.json(customers);
  } catch (err) {
    logger.error('Error listing customers', { err });
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const customer = await customerService.createCustomer(req.body);
    res.status(201).json(customer);
  } catch (err) {
    logger.error('Error creating customer', { err });
    next(err);
  }
});

router.post('/import', async (req, res, next) => {
  const filePath = path.join(__dirname, '../data/customers.xlsx'); 

  try {
    console.log(filePath)
    await customerService.importCustomersFromExcel(filePath);
    res.status(200).json({ message: 'Import triggered' }); 
  } catch (err) {
    logger.error('Error importing customers', { err });
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const customer = await customerService.getCustomerById(req.params.id);

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    res.json(customer);
  } catch (err) {
    logger.error('Error getting customer', { err });
    next(err);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const updated = await customerService.updateCustomer(req.params.id, req.body);

    if (!updated) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    res.json(updated);
  } catch (err) {
    logger.error('Error updating customer', { err });
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const deleted = await customerService.deleteCustomer(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    res.status(204).send();
  } catch (err) {
    logger.error('Error deleting customer', { err });
    next(err);
  }
});


module.exports = router;
