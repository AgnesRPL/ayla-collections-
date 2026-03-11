# Dokumentasi API SERVER TOKO PAKAIAN

**Nama:** Agnes Layla Angelita
**Base URL:** http://localhost:3000
**Database:** postgres/toko_online

## Judul project
Toko Online API (Node.js & PostgreSQL)

## Deskripsi mengenai project
Dokumentasi ini bertujuan untuk memberikan panduan komprehensif mengenai Toko Pakaian API, yaitu backend yang menangani seluruh operasi data untuk sebuah sistem toko online berbasis pakaian. API ini dikembangkan menggunakan Node.js dengan framework Express, dan mengandalkan PostgreSQL sebagai sistem manajemen database. Fokus utama dokumentasi adalah menjelaskan bagaimana mengakses, mengelola, dan mengamankan data produk, kategori, transaksi, dan akun pengguna melalui berbagai endpoint HTTP yang tersedia.

## Tujuan project
Tujuan utama dari proyek ini adalah untuk menyediakan layanan data (data service) yang aman, cepat, dan terstruktur bagi aplikasi frontend (baik itu web e-commerce, aplikasi mobile, atau sistem kasir internal). Secara spesifik, proyek ini bertujuan untuk:
> Memastikan Keamanan Data melalui implementasi otentikasi JSON Web Token (JWT) dan sistem otorisasi berbasis peran (Admin, Kasir).
> Mengelola Inventaris Produk secara efisien, mencakup operasi CRUD (Create, Read, Update, Delete) pada data produk dan kategorinya.
> Memproses Transaksi dengan andal dan mencatat riwayat penjualan secara akurat, mendukung kebutuhan operasional bisnis pakaian sehari-hari.

## Perangkat lunak yang harus diinstal sebelum memulai
> Node.js
> PostgreSQL (versi 17)
> Insomnia atau Postman (untuk pengujian API)
> npm (untuk manajemen paket)

## Bagian terpenting untuk menghubungkan API ke database dan mengatur variabel kunci
* 1. Siapkan Database: Buat database PostgreSQL baru, misalnya bernama toko_online.
* 2. Konfigurasi Variabel Lingkungan: Buat dan isi file .env di root proyek.
    > DB Credentials (dari db/pool.js): DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME
    > JWT Secrets (dari middleware/auth.js dan authController.js): JWT_SECRET_KEY, JWT_ACCESS_EXPIRATION (misalnya 120s atau 1h)
> `Didukung oleh file:` .env
* 3. Siapkan Password: Jelaskan cara membuat hash password untuk pengguna Admin/Kasir menggunakan get_hash.js sebelum memasukkannya ke tabel users.
> `Didukung oleh file:` get_hash.js

## Langkah-langkah untuk menjalankan aplikasi
* Development Mode (Auto-Reload): npm run dev
> `Didukung oleh file:` package.json

* Production Mode: npm start. Server akan berjalan di http://localhost:<APP_PORT> (misalnya http://localhost:3000).
> `Didukung oleh file:` package.json

## 📁 Folder controllers
`Fungsi dan Peran:` Folder ini adalah tempat semua Logika Bisnis dan Interaksi Database didefinisikan. Setiap file di dalamnya (misalnya userController.js, productController.js) berisi fungsi-fungsi yang langsung menangani permintaan HTTP (Request) dan mengirimkan respons (Response) yang sesuai. Ini adalah inti dari aplikasi Anda, yang memisahkan logika "apa yang harus dilakukan" dari logika "bagaimana cara merespon route."
> `Contoh Fungsi:` Validasi data input, hashing password, query ke database (CRUD), implementasi Database Transaction (seperti pada fungsi createTransaction).
> `Kebutuhan Kode:` Anda sudah mengirimkan banyak controller (authController.js, userController.js, transactionController.js, dll.). Jika Anda ingin saya memastikan semua controller sudah lengkap, saya bisa mencantumkannya kembali.

## 📂 File db/pool.js
`Fungsi dan Peran:` File ini bertanggung jawab untuk mengatur dan mengekspor objek koneksi ke database PostgreSQL. Ini menggunakan package pg (PostgreSQL client for Node.js), khususnya objek Pool, yang mengelola kumpulan koneksi ke database. Penggunaan Pool sangat penting untuk aplikasi web yang memiliki banyak permintaan secara bersamaan, karena menghindari pembuatan koneksi baru setiap saat, sehingga meningkatkan performa dan efisiensi.
> `Tanggung Jawab:` Membaca kredensial database dari file .env dan membuat Pool koneksi yang dapat digunakan kembali.
> `Kebutuhan Kode:` File ini krusial. Saya akan menyertakan kode standar untuk file ini.

## 📂 File middleware/auth.js
`Fungsi dan Peran:` File ini berisi semua fungsi middleware yang terkait dengan Otentikasi (Authentication) dan Otorisasi (Authorization). Middleware adalah fungsi yang berjalan di antara permintaan klien dan fungsi controller.
> verifyToken `(Authentication)`: Memastikan bahwa permintaan datang dengan token JWT yang valid. Jika valid, ia mendekode token dan menyisipkan data user (id, role, dll.) ke objek req.user.
> isAdmin, isCashierOrAdmin `(Authorization)`: Fungsi-fungsi ini menggunakan data req.user yang disisipkan oleh verifyToken untuk memeriksa apakah peran user memenuhi syarat untuk mengakses endpoint tertentu.
> `Kebutuhan Kode:` File ini vital untuk keamanan. Saya akan menyertakan kode standar untuk file ini.

## 📁 Folder routes
`Fungsi dan Peran:` Folder ini berisi definisi Route aplikasi. Setiap file route (misalnya userRoutes.js, productRoutes.js) bertanggung jawab untuk:
> Menentukan path URL (/users, /products/:id).
> Menentukan metode HTTP (GET, POST, PUT, DELETE).
> Menghubungkan path tersebut ke urutan middleware (verifyToken, isAdmin, dll.) dan fungsi controller yang akan mengeksekusi logika. Ini adalah bagian "bagaimana cara merespon route," memetakan permintaan masuk ke logika bisnis yang tepat.
> `Kebutuhan Kode:` Anda sudah mengirimkan semua file route.

## 📂 File app.js
`Fungsi dan Peran:` File ini adalah entry point utama atau server setup dari aplikasi Node.js Anda. Ini adalah tempat di mana Anda:
> Menginisialisasi framework `Express`.
> Menggunakan middleware global (seperti body-parser untuk JSON, cors, dll.).
> Mengimpor dan "menggunakan" semua file route Anda (misalnya app.use('/api/v1/users', userRoutes)).
> Menjalankan server agar siap mendengarkan permintaan (menghubungkan ke APP_PORT).
> `Kebutuhan Kode:` File ini wajib. Saya akan menyertakan kode lengkapnya.

## 📂 File .env
`Fungsi dan Peran:` Ini adalah file konfigurasi lingkungan (Environment Configuration). File ini menyimpan semua pengaturan sensitif atau pengaturan yang dapat berubah antar lingkungan (misalnya, development, staging, production). Penggunaan file .env sangat penting untuk keamanan karena file ini tidak boleh di-commit ke repositori (harus masuk ke .gitignore).
> `Tanggung Jawab:` Menyimpan rahasia (seperti secret key JWT dan password database) dan konfigurasi koneksi.
> `Kebutuhan Kode:` Saya akan memberikan contoh file .env lengkap.

## 📂 File get_hash.js
`Fungsi dan Peran:` File ini adalah utility script yang digunakan di luar alur utama aplikasi. Tujuannya adalah untuk menghasilkan nilai hash dari password yang diberikan, sehingga Admin dapat memasukkan password yang sudah di-hash secara manual ke dalam tabel users di database. Ini diperlukan untuk membuat akun Admin atau Kasir pertama tanpa melalui endpoint registrasi (yang mungkin memiliki batasan role).
> `Tanggung Jawab:` Menerima input password dari baris perintah dan mencetak hasil hash menggunakan bcryptjs.
> `Kebutuhan Kode:` Saya akan menyertakan kode lengkapnya.

## 📂 File package.json
`Fungsi dan Peran:` Ini adalah file manifest aplikasi Node.js Anda. File ini mencatat metadata proyek (nama, versi, deskripsi) dan yang paling penting, semua dependensi (paket/libraries) yang dibutuhkan proyek agar dapat berjalan. File ini juga mendefinisikan script yang dapat dijalankan melalui npm run <script_name>.
> `Tanggung Jawab:` Melacak dependensi, mendefinisikan scripts untuk pengembangan dan produksi, dan menentukan entry point aplikasi (main).
> `Kebutuhan Kode:` Saya akan menyertakan contoh file package.json yang mencakup semua library yang kita gunakan.

### Endpoint API (Bagian Categories)
Modul Categories menangani pengelolaan data categories product, seperti "Kemeja," "Celana," atau "Aksesoris." Operasi CRUD (Create, Update, Delete) pada categories dibatasi hanya untuk peran Admin, sementara melihat daftar categories terbuka untuk publik (tidak memerlukan token).

####
> `Metode:` GET
> `Path:` /categories
> `Deskripsi:` Mengambil daftar semua kategori produk.
> `Otorisasi:` Publik
> `Keterangan:` Tidak memerlukan token.

####
> `Metode:` GET
> `Path:` /categories/:id
> `Deskripsi:` Mengambil detail kategori berdasarkan ID.
> `Otorisasi:` Publik
> `Keterangan:` Tidak memerlukan token.

####
> `Metode:` POST
> `Path:` /categories
> `Deskripsi:` Membuat kategori baru.
> `Otorisasi:` Admin
> `Keterangan:` Membutuhkan Token Admin di header.

####
> `Metode:` PUT
> `Path:` /categories/:id
> `Deskripsi:` Memperbarui nama kategori berdasarkan ID.
> `Otorisasi:` Admin
> `Keterangan:` Membutuhkan Token Admin di header.

####
> `Metode:` DELETE
> `Path:` /categories/:id
> `Deskripsi:` Menghapus kategori berdasarkan ID.
> `Otorisasi:` Admin
> `Keterangan:` Membutuhkan Token Admin di header.

### Endpoint API (Bagian Product)
Modul Product adalah inti dari manajemen inventaris, mengizinkan Admin untuk melakukan operasi CRUD pada data produk (nama, harga, stock, categories). Endpoint untuk melihat daftar product diamankan, hanya dapat diakses oleh user yang sudah terotentikasi (Admin atau Kasir).

####
> `Metode:` GET
> `Path:` /products
> `Deskripsi:` Mengambil daftar semua produk, termasuk nama kategori (JOIN).
> `Otorisasi:` Authenticated User
> `Keterangan:` Membutuhkan Token (Admin atau Kasir).

####
> `Metode:` GET
> `Path:` /products/:id
> `Deskripsi:` Mengambil detail produk berdasarkan ID, termasuk nama kategori.
> `Otorisasi:` Authenticated User
> `Keterangan:` Membutuhkan Token (Admin atau Kasir).

####
> `Metode:` POST
> `Path:` /products
> `Deskripsi:` Membuat produk baru. Membutuhkan name, category_id, price, dan stock.
> `Otorisasi:` Admin
> `Keterangan:` Membutuhkan Token Admin.

####
> `Metode:` PUT
> `Path:` /products/:id
> `Deskripsi:` Memperbarui detail produk berdasarkan ID. Mendukung pembaruan parsial.
> `Otorisasi:` Admin
> `Keterangan:` Membutuhkan Token Admin.

####
> `Metode:` DELETE
> `Path:` /products/:id
> `Deskripsi:` Menghapus produk secara permanen berdasarkan ID.
> `Otorisasi:` Admin
> `Keterangan:` Membutuhkan Token Admin.

### Endpoint API (Bagian Transactions)
Modul Transactions bertanggung jawab untuk mencatat setiap penjualan yang terjadi. Proses pembuatan transaksi baru sangat penting karena melibatkan Database Transactions untuk memastikan pengurangan stok product dan pencatatan riwayat transaksi berjalan atomik (sukses semua atau gagal semua). Modul ini hanya dapat diakses oleh Admin dan Kasir.

####
> `Metode:` GET
> `Path:` /transactions
> `Deskripsi:` Mengambil daftar semua transaksi penjualan.
> `Otorisasi:` Kasir atau Admin
> `Keterangan:` Membutuhkan Token.

####
> `Metode:` GET
> `Path:` /transactions/:id
> `Deskripsi:` Mengambil detail transaksi berdasarkan ID, termasuk daftar item yang dibeli.
> `Otorisasi:` Kasir atau Admin
> `Keterangan:` Membutuhkan Token.

####
> `Metode:` POST
> `Path:` /transactions
> `Deskripsi:` Memproses dan menyimpan transaksi penjualan baru. Fungsi ini secara otomatis mengurangi stok produk.
> `Otorisasi:` Kasir atau Admin
> `Keterangan:` Membutuhkan body items (array) dan payment_method.

####
> `Metode:` PUT
> `Path:` /transactions/:id
> `Deskripsi:` Memperbarui detail transaksi yang sudah ada (saat ini hanya mendukung perubahan payment_method).
> `Otorisasi:` Admin
> `Keterangan:` Membutuhkan token Admin.

### Endpoint API (Bagian User)
Modul User Management memungkinkan pengguna baru untuk mendaftar (Kasir default) dan memungkinkan user yang sudah login untuk mengambil data profil mereka sendiri. Endpoint sensitif seperti penonaktifan user hanya dapat dilakukan oleh peran Admin untuk menjaga kontrol dan keamanan sistem.

####
> `Metode:` GET
> `Path:` /users/profile
> `Deskripsi:` Mengambil data profil lengkap user yang saat ini sedang login.
> `Otorisasi:` Authenticated User
> `Keterangan:` Membutuhkan token di header.

####
> `Metode:` POST
> `Path:` /users/register
> `Deskripsi:` Mendaftarkan user baru. Role default untuk pendaftaran publik adalah Kasir.
> `Otorisasi:` Publik
> `Keterangan:` Membutuhkan fullname, username, email, dan password.

####
> `Metode:` PUT
> `Path:` /users/deactivate-user
> `Deskripsi:` Menonaktifkan user berdasarkan ID.
> `Otorisasi:` Admin
> `Keterangan:` Membutuhkan token Admin. ID user yang akan dinonaktifkan harus dikirim di request body.

### Endpoint API (Bagian Auth)
Modul Autentikasi adalah pintu masuk utama ke sistem. Modul ini bertanggung jawab untuk memverifikasi identitas pengguna (login) dan mengeluarkan token akses JWT yang diperlukan untuk mengakses endpoint yang terlindungi. Terdapat juga endpoint untuk memperbarui token kadaluwarsa (refresh token).

####
> `Metode:` POST
> `Path:` /auth/login
> `Deskripsi:` Otentikasi user dan dapatkan token JWT.
> `Keterangan:` Publik

####
> `Metode:` POST
> `Path:` /auth/refresh-token
> `Deskripsi:` Perbarui token JWT yang hampir kadaluwarsa.
> `Keterangan:` Membutuhkan token lama.

####
> `Metode:` POST
> `Path:` /auth/logout
> `Deskripsi:` Konfirmasi logout (klien harus menghapus token).
> `Keterangan:` Publik