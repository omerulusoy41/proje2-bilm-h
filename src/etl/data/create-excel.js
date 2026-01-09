const XLSX = require('xlsx');

const customers = [
  {
    name: 'Ahmet Yılmaz',
    phone: '+90 532 111 22 33',
    email: 'ahmet.yilmaz@mail.com',
    address: 'İstanbul, Kadıköy',
    note: ''
  },
  {
    name: 'Mehmet Ali',
    phone: '05321112233',
    email: '',
    address: 'Ankara',
    note: 'Soyadı yok'
  },
  {
    name: 'Ayşe KARA',
    phone: '5321112233',
    email: 'ayse.kara@mail',
    address: '',
    note: 'Email hatalı'
  },
  {
    name: 'Hasan Demir',
    phone: '+90532 1112233',
    email: 'hasan.demir@mail.com',
    address: 'İzmir',
    note: ''
  },
  {
    name: 'Hakan A. Çelik',
    phone: '905321112233',
    email: 'hakan.celik@gmail.com',
    address: 'İstanbul',
    note: ''
  },
  {
    name: 'Fatma Nur Yilmaz',
    phone: '0 532 111 22 33',
    email: '',
    address: 'Adana',
    note: 'Duplicate olabilir'
  },
  {
    name: 'fatma nur yilmaz',
    phone: '+90 (532) 111 2233',
    email: 'fatma@mail.com',
    address: 'Adana',
    note: 'Aynı kişi mi?'
  },
  {
    name: 'Doğan',
    phone: '532—111—2233',
    email: 'dogan@mail.com',
    address: 'Bursa',
    note: 'Adı boş'
  },
  {
    name: 'Elif',
    phone: '1112233',
    email: 'elif@mail.com',
    address: 'İstanbul',
    note: 'Telefon eksik'
  },
  {
    name: 'Ali Öztürk',
    phone: '+90 555 444 3322',
    email: '',
    address: '',
    note: ''
  },
  {
    name: 'Ali Ozturk',
    phone: '+90 555 444 3322',
    email: 'ali.ozturk@mail.com',
    address: '',
    note: 'Duplicate şüpheli'
  },
  {
    name: '“Merve” Kaya',
    phone: '0532-111-22-33',
    email: 'mervekaya@mail.com',
    address: 'Manisa',
    note: 'Ad alanında tırnak var'
  },
  {
    name: 'Murat Şahin',
    phone: '+90 532 1112233',
    email: '',
    address: 'Konya',
    note: 'Email eksik'
  },
  {
    name: 'Ahmet Yılmaz',
    phone: '+905321112233',
    email: 'ahmet.yilmaz@mail.com',
    address: 'İstanbul',
    note: 'Aynı kişi mi kontrol'
  },
  {
    name: 'Caner Taş',
    phone: '0532 111',
    email: 'caner.tas@mail.com',
    address: '',
    note: 'Telefon eksik'
  },
  {
    name: 'Ceren',
    phone: '+90 5321112233',
    email: 'ceren@@mail.com',
    address: 'İstanbul',
    note: 'Email hatalı'
  },
  {
    name: 'Yusuf Demİr',
    phone: '0(532)1112233',
    email: 'yusuf.demir@mail.com',
    address: 'Hatay',
    note: 'Soyad farklı yazılmış'
  },
  {
    name: 'Esra Arslan',
    phone: '+90-532-111-22-33',
    email: 'esra_arslanmail.com',
    address: 'Antalya',
    note: '@ eksik'
  },
  {
    name: 'Muhammed Ak',
    phone: '5321112233',
    email: '',
    address: 'İstanbul',
    note: 'Email yok'
  },
  {
    name: 'M. Demir',
    phone: '5321112233',
    email: 'mdemir@mail.com',
    address: '',
    note: 'Ad çok belirsiz'
  }
];


const wb = XLSX.utils.book_new();

const ws = XLSX.utils.json_to_sheet(customers, {
  header: ['name', 'phone', 'email', 'address','note'],
  skipHeader: false
});

const range = XLSX.utils.decode_range(ws['!ref']);
for (let R = range.s.r + 1; R <= range.e.r; ++R) {
  const cellAddress = XLSX.utils.encode_cell({ r: R, c: 2 }); // phone = 3. kolon
  if (ws[cellAddress]) {
    ws[cellAddress].t = 's';
  }
}

XLSX.utils.book_append_sheet(wb, ws, 'Customers');

XLSX.writeFile(wb, 'customers.xlsx');

