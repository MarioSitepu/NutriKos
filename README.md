<div align="center">
  <div style="background-color: #FFD600; padding: 20px; border: 4px solid black; display: inline-block; margin-bottom: 20px;">
    <h1 style="margin: 0; color: black; font-weight: 900; text-transform: uppercase;">NutriKos AI 🍛</h1>
  </div>
  <p><strong>Gizi Seimbang & Dompet Aman untuk Anak Kos Indonesia</strong></p>
</div>

---

**NutriKos** adalah aplikasi cerdas berbasis AI yang dirancang khusus untuk mahasiswa dan anak kos. Dengan aplikasi ini, Anda bisa memfoto makanan yang Anda beli (misal: nasi warteg, gorengan, mie instan), memasukkan harganya, dan membiarkan AI menganalisis estimasi kalori, protein, status gizi, serta memberikan evaluasi apakah makanan tersebut *worth it* (sepadan) dengan harganya secara finansial.

Aplikasi ini menggunakan gaya desain *Neobrutalism* yang mencolok, dinamis, dan modern.

## 🚀 Fitur Utama
- **Deteksi Gizi via Foto (AI)**: Unggah atau ambil foto makanan Anda, dan AI (Google Gemini) akan mendeteksi nama makanan, estimasi kalori, dan protein.
- **Evaluasi Budget (Financial Advisor)**: AI akan mengevaluasi apakah harga makanan yang Anda bayarkan rasional untuk gizi yang didapatkan, dan memberikan rekomendasi alternatif menu warteg yang lebih sehat & murah.
- **Koran Pengeluaran Malam (Meal Logs)**: Seluruh riwayat makanan Anda dicatat permanen di *cloud database*.
- **Manajemen Target & Saldo**: Atur target protein harian dan budget mingguan Anda. Sistem akan memotong budget secara digital setiap Anda mencatat pengeluaran makan.
- **Autentikasi Aman**: Login terintegrasi dengan Akun Google (Google OAuth) sehingga data riwayat Anda tersimpan aman dan tersinkronisasi antar perangkat.

## 🛠️ Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS v4 (Neobrutalism Design)
- **AI Engine**: Google Gemini (via `@google/genai`)
- **Authentication**: NextAuth.js v4 (Google Provider)
- **Database**: PostgreSQL (dihosting di Neon)
- **ORM**: Prisma v5

---

## 💻 Cara Menjalankan di Lokal (Development)

### Prasyarat
- Node.js (versi 18.x atau lebih baru)
- Akun Google Cloud Console (untuk OAuth Credentials)
- Database PostgreSQL (misal: [Neon.tech](https://neon.tech))
- API Key Google Gemini (dari [Google AI Studio](https://aistudio.google.com/))

### 1. Clone & Instalasi
```bash
git clone https://github.com/MarioSitepu/NutriKos.git
cd NutriKos
npm install
```

### 2. Konfigurasi Environment Variables
Buat file bernama `.env` di folder utama (root) proyek dan isi dengan variabel berikut:

```env
# Kunci API Gemini untuk analisis gambar makanan
GEMINI_API_KEY="AIzaSy..."

# Konfigurasi NextAuth
NEXTAUTH_SECRET="string_acak_rahasia_anda_di_sini"
NEXTAUTH_URL="http://localhost:3000"

# Kredensial Google OAuth (Didapatkan dari Google Cloud Console)
GOOGLE_CLIENT_ID="xxx.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-xxx"

# URL Koneksi PostgreSQL (Contoh menggunakan Neon DB)
DATABASE_URL="postgresql://user:password@host/database?schema=nutrikos"
```
*(Catatan: Anda dapat melihat contoh lengkapnya di file `.env.example`)*

### 3. Setup Database (Prisma)
Setelah `DATABASE_URL` diatur, dorong skema database agar tabel-tabelnya dibuat:
```bash
npx prisma db push
```

### 4. Jalankan Aplikasi
```bash
npm run dev
```
Buka browser Anda dan akses: **`http://localhost:3000`**

---

## ☁️ Deployment (Cloud Run / Vercel)
Aplikasi ini sudah dilengkapi dengan `Dockerfile` standar untuk kemudahan *deployment* ke Google Cloud Run, ataupun bisa langsung di-deploy ke Vercel tanpa konfigurasi tambahan.

Pastikan saat melakukan *deploy*, Anda menyertakan seluruh variabel `.env` di atas pada menu pengaturan rahasia (*Secrets* / *Environment Variables*) di platform *hosting* yang Anda gunakan. Jangan lupa untuk mengatur `NEXTAUTH_URL` sesuai dengan domain produksi Anda (contoh: `https://nutrikos.domainanda.com`).

---
*Dibuat untuk membantu kelangsungan hidup mahasiswa Indonesia menghadapi kerasnya akhir bulan.* 🇮🇩
