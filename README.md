
<p align="center">
	<img src="https://readme-typing-svg.demolab.com?font=Fira+Code&size=22&pause=1000&color=36BCF7&center=true&vCenter=true&width=440&lines=ScriptAds+🚀+Google+Ads+to+Google+Sheets"/>
</p>

<p align="center">
	<img src="https://img.shields.io/badge/Google%20Ads%20Script-Automation-blue?style=for-the-badge"/>
	<img src="https://img.shields.io/badge/Google%20Sheets-Integration-green?style=for-the-badge"/>
	<img src="https://img.shields.io/badge/Append%20Only-No%20Data%20Loss-orange?style=for-the-badge"/>
</p>

---


Kumpulan script Google Ads (Google Ads Script) untuk otomatisasi ekspor data performa iklan ke Google Sheets. Ada beberapa versi script yang bisa kamu pilih sesuai kebutuhan:
## 🧩 Full Code Script - Versi 4 (Manual Range & Append + Conversion Action)
Ambil data performa iklan Google Ads berdasarkan rentang tanggal manual, dan menambahkan detail Conversion Action pada laporan. Data tetap di-append ke Google Sheet tanpa menghapus data lama.

**Fitur:**
- Pilih rentang tanggal secara manual
- Ekspor 4 jenis laporan: Performa Iklan, Rentang Usia, Gender, dan Conversion Action
- Data baru akan di-append ke sheet
- Otomatis membuat sheet jika belum ada


## 📝 Full Code Script - Versi 1 (Manual Range & Append)
Ambil data performa iklan Google Ads berdasarkan rentang tanggal manual (`START_DATE` & `END_DATE`). Data akan di-append ke Google Sheet tanpa menghapus data lama.

**Fitur:**
- Pilih rentang tanggal secara manual
- Ekspor 3 jenis laporan: Performa Iklan, Rentang Usia, dan Gender
- Data baru akan di-append ke sheet
- Otomatis membuat sheet jika belum ada


## ⏰ Full Code Script - Versi 2 (Yesterday & Append)
Ambil data performa iklan Google Ads untuk tanggal kemarin (`yesterday`) secara otomatis setiap kali dijalankan. Data juga di-append ke Google Sheet target.

**Fitur:**
- Tanggal otomatis: selalu mengambil data kemarin
- Ekspor 3 jenis laporan: Performa Iklan, Rentang Usia, dan Gender
- Data baru akan di-append ke sheet
- Otomatis membuat sheet jika belum ada

## 📅 Full Code Script - Versi 3 (30Day Historical & Append)
Ambil data performa iklan Google Ads secara historis per batch 30 hari, cocok untuk migrasi data lama atau update berkala. Script akan otomatis lanjut ke batch berikutnya sampai tanggal target tercapai.

**Fitur:**
- Otomatis tarik data per 30 hari (bisa diubah)
- Cocok untuk migrasi data lama atau update bulk
- Ekspor 3 jenis laporan: Performa Iklan, Rentang Usia, dan Gender
- Data baru akan di-append ke sheet
- Otomatis membuat sheet jika belum ada


---

## 🚦 Cara Penggunaan
```bash
1. Pilih script yang sesuai kebutuhan kamu:
	- Versi 1: Manual Range & Append
	- Versi 2: Yesterday & Append
	- Versi 3: 30Day Historical & Append
	- Versi 4: Manual Range & Append + Conversion Action / Yesterday & Append + Conversion Action
2. Salin script ke Google Ads Script Editor
3. Ganti `SPREADSHEET_URL` dengan link Google Sheet kamu (share editor)
4. Untuk versi 1 & 4 (Manual), atur `START_DATE` dan `END_DATE` sesuai kebutuhan
5. Untuk versi 2 & 4 (Yesterday), script otomatis ambil data kemarin
6. Untuk versi 3, atur `INITIAL_START_DATE`, `TARGET_END_DATE`, dan `BATCH_DAYS` jika perlu
7. Jalankan fungsi `main()`
```


## 📊 Sheet yang Digunakan
- `AD_PERFORMANCE`: Laporan performa iklan
- `AGE_REPORT`: Laporan berdasarkan rentang usia
- `GENDER_REPORT`: Laporan berdasarkan gender


## ⚡ Catatan Dev
- Script **tidak menghapus data lama**, hanya menambah (append) data baru
- Pastikan Google Sheet sudah di-share ke akun Google Ads Script kamu
- Format kolom "Cost" otomatis dalam format Rupiah
- Semua script pakai **append only** (no data loss!)

---


---

## 🎯 Deskripsi Singkat Script

| Versi | Deskripsi |
|-------|-----------|
| **Versi 1** | Ambil data performa iklan berdasarkan rentang tanggal manual, lalu append ke Google Sheet |
| **Versi 2** | Ambil data performa iklan untuk tanggal kemarin secara otomatis, lalu append ke Google Sheet |
| **Versi 3** | Ambil data historis per batch 30 hari, cocok untuk migrasi data lama, lalu append ke Google Sheet |
| **Versi 4** | Ambil data performa iklan berdasarkan rentang tanggal manual, plus detail Conversion Action, lalu append ke Google Sheet |


---

<p align="center">
	<img src="https://readme-typing-svg.demolab.com?font=Fira+Code&size=18&pause=1000&color=F7B801&center=true&vCenter=true&width=380&lines=Update:+21+Oktober+2025"/>
</p>
