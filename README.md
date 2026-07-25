# Money Note API 💰

REST API berbasis Node.js dan Express.js untuk manajemen pengguna dan sinkronisasi data catatan keuangan (**Money Note**). API ini dilengkapi dengan penyimpanan berbasis file JSON (terletak di folder `database/`), enkripsi kata sandi menggunakan `bcryptjs`, autentikasi token JWT, fitur **bulk sync data transaksi dari Flutter/SQLite**, serta dokumentasi interaktif **Swagger UI**.

---

## 🚀 Fitur Utama

- **Autentikasi Pengguna**:
  - Registrasi Pengguna Baru (`POST /api/register`) dengan hashing password secara otomatis.
  - Login Pengguna (`POST /api/login`) untuk mendapatkan JSON Web Token (JWT).
- **Manajemen Pengguna (CRUD Users)**:
  - **Create**: Menambahkan pengguna baru melalui endpoint khusus (`POST /api/users`).
  - **Read**: Mengambil daftar seluruh pengguna (`GET /api/users`) maupun detail pengguna spesifik berdasarkan ID (`GET /api/users/:id`).
  - **Update**: Memperbarui data pengguna berdasarkan ID (`PUT /api/users/:id`).
  - **Delete**: Menghapus data pengguna berdasarkan ID (`DELETE /api/users/:id`).
- **Sinkronisasi Data Transaksi (Bulk Sync & Filter)**:
  - **Bulk Sync**: Menyingkronkan daftar transaksi keuangan lokal (SQLite Flutter) ke server API secara masif (`POST /api/transactions/sync`) dengan format tanggal `YYYY-MM-DD HH:mm:ss` (contoh: `2026-07-25 16:08:00`).
  - **Get All & Filter Tanggal**: Mengambil daftar transaksi tersimpan di server dengan opsi filter tanggal awal & tanggal akhir (`GET /api/transactions?start_date=2026-07-25&end_date=2026-07-25`).
  - **Delete by ID**: Menghapus 1 data transaksi spesifik berdasarkan ID (`DELETE /api/transactions/:id`).
- **Dokumentasi Swagger UI**:
  - Generator otomatis dokumentasi OpenAPI/Swagger yang dapat langsung dicoba melalui browser.

---

## 🛠️ Prasyarat (Prerequisites)

Sebelum menjalankan projek ini, pastikan komputer Anda telah terinstall:
- [Node.js](https://nodejs.org/) (Versi 14 atau yang terbaru)
- NPM (sudah sepaket saat menginstall Node.js)

---

## ⚙️ Cara Menjalankan Aplikasi

### 1. Mode Pengembangan (Development)
Menjalankan server menggunakan `nodemon` yang secara otomatis memperbarui file Swagger dan melakukan restart server saat ada perubahan kode:
```bash
npm run dev
```

### 2. Mode Produksi (Production)
Menjalankan server secara langsung dengan perintah Node.js standar:
```bash
npm start
```

Setelah server berhasil berjalan, Anda akan melihat output di terminal:
```text
========================================================
Server running on http://localhost:3000
Swagger documentation: http://localhost:3000/api-docs
========================================================
```

---

## 📖 Dokumentasi API (Swagger UI)

Anda dapat mengakses dan mencoba seluruh endpoint API secara langsung melalui browser:
👉 **[http://localhost:3000/api-docs](http://localhost:3000/api-docs)**

---

## 📌 Daftar Endpoint API

Semua endpoint API menggunakan prefix `/api`.

### 🔑 Autentikasi (`Auth`)
| Method | Endpoint | Deskripsi |
| :--- | :--- | :--- |
| `POST` | `/api/register` | Mendaftarkan akun pengguna baru |
| `POST` | `/api/login` | Login pengguna & mendapatkan token JWT |

### 👤 Manajemen Pengguna (`Users`)
| Method | Endpoint | Deskripsi |
| :--- | :--- | :--- |
| `GET` | `/api/users` | Mengambil seluruh daftar pengguna (tanpa password) |
| `GET` | `/api/users/:id` | Mengambil detail pengguna berdasarkan ID |
| `POST` | `/api/users` | Menambahkan data pengguna baru |
| `PUT` | `/api/users/:id` | Memperbarui data pengguna berdasarkan ID |
| `DELETE` | `/api/users/:id` | Menghapus pengguna berdasarkan ID |

### 💳 Sinkronisasi Transaksi (`Transactions`)
| Method | Endpoint | Deskripsi |
| :--- | :--- | :--- |
| `POST` | `/api/transactions/sync` | Mentransfer/sinkronisasi bulk data transaksi dari Flutter ke server API (Format `YYYY-MM-DD HH:mm:ss`) |
| `GET` | `/api/transactions` | Mengambil daftar transaksi (opsional query filter `start_date` & `end_date` contoh: `2026-07-25`) |
| `DELETE` | `/api/transactions/:id` | Menghapus 1 data transaksi spesifik berdasarkan ID |

---

## 🔍 Contoh Query Filter Tanggal pada `GET /api/transactions`

Anda dapat menyaring transaksi berdasarkan rentang tanggal menggunakan format `YYYY-MM-DD`:

- **Mengambil transaksi pada tanggal tertentu (contoh 25 Juli 2026)**:
  `GET http://localhost:3000/api/transactions?start_date=2026-07-25&end_date=2026-07-25`
- **Mengambil transaksi dalam rentang tanggal**:
  `GET http://localhost:3000/api/transactions?start_date=2026-07-01&end_date=2026-07-31`
- **Mengambil seluruh transaksi (tanpa filter)**:
  `GET http://localhost:3000/api/transactions`

---

## 📱 Contoh Penggunaan Bulk Sync di Flutter

Berikut adalah contoh fungsi di Flutter untuk melakukan push/sinkronisasi data `Transaction` ke endpoint `POST http://localhost:3000/api/transactions/sync`:

```dart
import 'dart:convert';
import 'package:http/http.dart' as http;

Future<void> syncTransactionsToServer(List<Transaction> transactions) async {
  // Ganti IP jika menggunakan emulator Android (contoh: http://10.0.2.2:3000/api/transactions/sync)
  final url = Uri.parse('http://localhost:3000/api/transactions/sync');

  // Mengubah List<Transaction> menjadi List<Map>
  final List<Map<String, dynamic>> payload =
      transactions.map((t) => t.toMap()).toList();

  try {
    final response = await http.post(
      url,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(payload),
    );

    if (response.statusCode == 200) {
      print('Sinkronisasi berhasil: ${response.body}');
    } else {
      print('Gagal sinkronisasi: ${response.statusCode} - ${response.body}');
    }
  } catch (e) {
    print('Terjadi kesalahan koneksi: $e');
  }
}
```

---

## 📁 Struktur Folder Proyek

```text
money_note_api/
├── config/
│   └── db.js                 # Util baca & tulis data ke JSON database
├── controllers/
│   ├── authController.js     # Controller autentikasi (Register & Login)
│   ├── userController.js     # Controller CRUD data pengguna
│   └── transactionController.js # Controller bulk sync & filter transaksi
├── database/
│   ├── users.json            # Database lokal users
│   └── transactions.json     # Database lokal transaksi tersimpan
├── routes/
│   └── apiRoutes.js          # Unified Route file untuk seluruh endpoint API
├── package.json              # Konfigurasi dependensi & script proyek
├── README.md                 # Dokumen panduan penggunaan proyek
├── server.js                 # Entry point utama Express server
├── swagger-output.json       # Hasil autogenerate dokumentasi Swagger
└── swagger.js                # Konfigurasi Swagger Autogen
```
