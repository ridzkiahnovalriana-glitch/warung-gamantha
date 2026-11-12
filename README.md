# Web POS & Inventory Management System — Warung Sembako Gamantha

<div align="center">

![React JS](https://img.shields.io/badge/React.js-v18+-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v3-38Bdf8?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-Firestore-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)
![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)

Aplikasi Point of Sales (POS) dan Manajemen Inventaris berbasis Web modern yang dirancang khusus untuk mengotomatisasi pencatatan transaksi, pengelolaan stok real-time, serta pelaporan keuangan UMKM **Warung Sembako Gamantha**.

</div>

---

## 📌 Informasi Proyek
* **Nama UMKM:** Warung Sembako Gamantha
* **Lokasi Usaha:** Jl. Sambong Girang, Mangkubumi
* **Pengembang / Peneliti:** Ridzki Ahnovalrian Arifin (NIM: 2503010031)
* **Program Studi:** Teknik Informatika (Kelas B)
* **Platform:** Responsive Web (Desktop, Tablet, & Mobile Optimized)

---

## 🚀 Fitur Utama Sistem

1. **Dashboard Overview & Analitik Bisnis**
   * Kartu statistik interaktif untuk memantau Total Pendapatan, Jumlah Transaksi, dan Peringatan Stok Menipis secara *real-time*.
   * Daftar transaksi terbaru dan sistem *alert* otomatis untuk produk yang memerlukan restock.
2. **Web POS Kasir (Point of Sales)**
   * Katalog produk interaktif dilengkapi pencarian cepat dan filter berdasarkan kategori (*Sembako, Minuman, Rokok, Kebutuhan Rumah Tangga*).
   * Perhitungan otomatis subtotal, kembalian tunai, serta pengurangan stok di database secara instan setelah pembayaran diselesaikan.
   * **Fitur Cetak Struk Belanja:** Pratinjau dan pencetakan struk transaksi termal standar untuk pembeli.
3. **Manajemen Data Barang (CRUD)**
   * Pengelolaan inventaris lengkap: Tambah, Ubah, Hapus, dan Cari data barang berdasarkan kode, nama, kategori, harga jual, dan jumlah stok.
4. **Manajemen Stok Masuk (Restock)**
   * Pencatatan penambahan stok barang kulakan dari pemasok yang terintegrasi langsung dengan log riwayat database.
5. **Riwayat Transaksi & Detail Penjualan**
   * Menu audit terpusat untuk meninjau kembali daftar transaksi masa lalu beserta rincian produk yang dibeli pada nomor transaksi tertentu.

---

## 🛠️ Tech Stack

* **Frontend:** React JS (Vite / Single Page Application)
* **Styling:** Tailwind CSS v3 (Custom Design & Responsive Grid)
* **Database & Cloud:** Firebase Firestore (Real-time NoSQL Database)
* **Icons & UI Utilities:** Lucide React

---

## 📂 Struktur Direktori Proyek

```text
warung-sembako-gamantha/
├── public/
│   └── favicon.ico
├── src/
│   ├── assets/              # Aset statis & gambar
│   ├── components/          # Modul komponen utama
│   │   ├── DashboardView.jsx# Modul laporan & ringkasan statistik
│   │   ├── HistoryView.jsx  # Modul riwayat transaksi & detail
│   │   ├── InventoryView.jsx# Modul CRUD data sembako & kategori
│   │   ├── PosView.jsx      # Modul kasir, keranjang, & cetak struk
│   │   └── StockView.jsx    # Modul restock barang masuk
│   ├── App.jsx              # Layout utama & navigasi responsif
│   ├── firebase.js          # Konfigurasi koneksi Firebase Firestore
│   └── index.css            # Pengaturan kustom Tailwind & CSS global
├── tailwind.config.js       # Konfigurasi Tailwind CSS v3
├── package.json             # Daftar dependencies proyek
└── README.md                # Dokumentasi proyek