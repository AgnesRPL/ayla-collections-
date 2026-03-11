const bcrypt = require('bcryptjs');

// Password yang akan di-hash adalah 'password123'
const plaintextPassword = 'password123'; 
const saltRounds = 10;

// Menghasilkan hash secara sinkron
const hash = bcrypt.hashSync(plaintextPassword, saltRounds);

console.log('----------------------------------------------------');
console.log('HASH BARU untuk "password123":');
console.log(hash);
console.log('----------------------------------------------------');
console.log('SALIN STRING HASH DI ATAS DAN GUNAKAN DI PGADMIN!');
