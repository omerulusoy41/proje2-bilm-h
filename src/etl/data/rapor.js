const XLSX = require('xlsx');
const fs = require('fs');

const normalizePhone = (phone) => {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, '');

  if (digits.length === 10) return `+90${digits}`;
  if (digits.length === 11 && digits.startsWith('0')) return `+9${digits}`;
  if (digits.length === 12 && digits.startsWith('90')) return `+${digits}`;
  return null;
};

const isValidEmail = (email) => {
  if (!email) return false;
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

const cleanName = (name) => {
  if (!name) return null;
  return name
    .replace(/["“”]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
};

const isSuspiciousName = (name) => {
  return name.split(' ').length === 1 || name.includes('.');
};

const workbook = XLSX.readFile('customers.xlsx');
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const rawData = XLSX.utils.sheet_to_json(sheet);

const cleanCustomers = [];
const invalidRecords = [];
const duplicateRecords = [];

const phoneIndex = new Map();

rawData.forEach((row, index) => {
  const cleaned = {
    name: cleanName(row.name),
    phone: normalizePhone(row.phone),
    email: isValidEmail(row.email) ? row.email.toLowerCase() : null,
    address: row.address || null,
    note: row.note || null,
    flags: []
  };

  // Phone validation
  if (!cleaned.phone) {
    cleaned.flags.push('INVALID_PHONE');
  }

  // Name validation
  if (!cleaned.name || isSuspiciousName(cleaned.name)) {
    cleaned.flags.push('SUSPICIOUS_NAME');
  }

  // Duplicate check
  if (cleaned.phone && phoneIndex.has(cleaned.phone)) {
    duplicateRecords.push({
      row: index + 2,
      phone: cleaned.phone,
      reason: 'DUPLICATE_PHONE'
    });
    return;
  }

  // Classification
  if (cleaned.flags.includes('INVALID_PHONE')) {
    invalidRecords.push({ row: index + 2, reason: cleaned.flags });
    return;
  }

  phoneIndex.set(cleaned.phone, true);
  cleanCustomers.push(cleaned);
});

/* =====================
   OUTPUT FILES
===================== */

// Clean Excel
const cleanWB = XLSX.utils.book_new();
const cleanWS = XLSX.utils.json_to_sheet(cleanCustomers);
XLSX.utils.book_append_sheet(cleanWB, cleanWS, 'CleanCustomers');
XLSX.writeFile(cleanWB, 'clean_customers.xlsx');

// ETL Report
const report = {
  total_records: rawData.length,
  successful: cleanCustomers.length,
  invalid: invalidRecords.length,
  duplicates: duplicateRecords.length,
  invalidRecords,
  duplicateRecords
};

fs.writeFileSync('etl_report.json', JSON.stringify(report, null, 2));

console.log('ETL completed successfully');
