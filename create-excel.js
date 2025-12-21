const XLSX = require('xlsx');

// Excel'e yazılacak customer verileri
const customers = [
  {
    first_name: 'Ahmet',
    last_name: 'Yilmaz',
    phone: '05321112233',
    email: 'ahmet.yilmaz@mail.com',
    address: 'Istanbul Kadikoy'
  },
  {
    first_name: 'Mehmet',
    last_name: 'Ali',
    phone: '05324445566',
    email: '',           // ❗ null yerine boş string
    address: 'Ankara'
  },
  {
    first_name: 'Ayse',
    last_name: 'Kara',
    phone: '05337778899',
    email: 'ayse.kara@mail.com',
    address: 'Ankara'
  }
];

// Workbook oluştur
const wb = XLSX.utils.book_new();

// Header sırasını SABİTLE
const ws = XLSX.utils.json_to_sheet(customers, {
  header: ['first_name', 'last_name', 'phone', 'email', 'address'],
  skipHeader: false
});

// Phone kolonunu TEXT yap (çok önemli)
const range = XLSX.utils.decode_range(ws['!ref']);
for (let R = range.s.r + 1; R <= range.e.r; ++R) {
  const cellAddress = XLSX.utils.encode_cell({ r: R, c: 2 }); // phone = 3. kolon
  if (ws[cellAddress]) {
    ws[cellAddress].t = 's';
  }
}

// Sheet ekle
XLSX.utils.book_append_sheet(wb, ws, 'Customers');

// Dosyayı yaz
XLSX.writeFile(wb, 'customers.xlsx');

console.log('customers.xlsx başarıyla ve DOĞRU formatta oluşturuldu ✅');
