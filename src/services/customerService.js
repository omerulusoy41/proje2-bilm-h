const { Customer ,Order, OrderItem} = require('../models');
const logger = require('../lib/logger');
const XLSX = require('xlsx');
const models = require('../models');


async function listCustomers() {
  console.log(Object.keys(models));
  console.log(OrderItem)
  console.log(Order)
  return Customer.findAll({
    limit : 50,
      include: [
        {
          model: Order,
          as: 'Orders',
          include: [
            {
              model: OrderItem,
              as: 'OrderItems'
            }
          ]
        }
      ]
    }
  );
}

function normalizeCustomerData(payload) {
  const normalized = { ...payload };

  if (normalized.firstName) {
    normalized.firstName = normalized.firstName.trim();
    normalized.firstName = normalized.firstName.charAt(0).toUpperCase() + normalized.firstName.slice(1).toLowerCase();
  }
  if (normalized.lastName) {
    normalized.lastName = normalized.lastName.trim();
    normalized.lastName = normalized.lastName.charAt(0).toUpperCase() + normalized.lastName.slice(1).toLowerCase();
  }

  if (normalized.phone) {
    normalized.phone = normalized.phone.replace(/\D/g, '');
    if (!normalized.phone.startsWith('90')) {
      normalized.phone = '90' + normalized.phone;
    }
    normalized.phone = '+' + normalized.phone;
  }

  if (normalized.email) {
    normalized.email = normalized.email.trim().toLowerCase();
    if (!normalized.email.includes('@') || !normalized.email.includes('.')) {
      throw new Error('Invalid email format');
    }
  }

  return normalized;
}


async function createCustomer(payload) {
  const normalizedPayload = normalizeCustomerData(payload);
  logger.info('Creating customer', { payload }); 
  const customer = await Customer.create(normalizedPayload);
  return customer;
}


async function importCustomersFromExcel(filePath) {
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

  for (const row of data) {
    try {
      await Customer.create({
        firstName: row.first_name,   // 🔥 KRİTİK
        lastName: row.last_name,
        phone: row.phone,
        email: row.email || null,
        address: row.address,
        isActive: 1
      });
    } catch (err) {
      console.log(err.errors?.map(e => e.message) || err.message);
      logger.warn('Skipping invalid row', row);
    }
  }

  logger.info('Finished importing customers from Excel');
}



async function updateCustomer(id, data) {
  const customer = await Customer.findByPk(id);
  if (!customer) return null;

  await customer.update(data);
  return customer;
}

async function deleteCustomer(id) {
  const customer = await Customer.findByPk(id);
  if (!customer) return null;

  await customer.destroy();
  return true;
}
async function getCustomerById(id) {
  return Customer.findByPk(id,{include: [
    {
      model: Order,
      as: 'Orders',
      include: [
        {
          model: OrderItem,
          as: 'OrderItems'
        }
      ]
    }
  ]});
}


module.exports = {
  listCustomers,
  createCustomer,
  importCustomersFromExcel,
  deleteCustomer,
  updateCustomer,
  getCustomerById
};
