# Panduan Setup Google Drive API

Ikuti langkah-langkah ini buat nyalain Google Drive API supaya app bisa nyimpen foto dan notes ke Drive lu.

---

## Langkah 1 — Buat Project di Google Cloud Console

1. Buka [https://console.cloud.google.com](https://console.cloud.google.com)
2. Login pakai Google Account yang mau dipake
3. Klik dropdown project di pojok kiri atas → **"New Project"**
4. Kasih nama project-nya (misal: `Kumala Space`)
5. Klik **"Create"**

---

## Langkah 2 — Aktifkan Google Drive API

1. Di sidebar kiri, klik **"APIs & Services"** → **"Library"**
2. Search **"Google Drive API"**
3. Klik hasilnya → klik tombol **"Enable"**

---

## Langkah 3 — Buat OAuth 2.0 Client ID

1. Di sidebar kiri, klik **"APIs & Services"** → **"Credentials"**
2. Klik tombol **"+ Create Credentials"** → pilih **"OAuth client ID"**
3. Kalau diminta setup consent screen dulu:
   - Pilih **"External"** → klik **"Create"**
   - Isi **App name**: `Kumala's Space`
   - Isi **User support email**: email lu
   - Scroll ke bawah, isi **Developer contact email**: email lu
   - Klik **"Save and Continue"**
   - Di bagian **Scopes**, klik **"Add or Remove Scopes"**
   - Search dan centang: `https://www.googleapis.com/auth/drive.file`
   - Klik **"Update"** → **"Save and Continue"**
   - Di bagian **Test Users**, klik **"+ Add Users"**
   - Tambahkan email Kumala (dan email lu kalau mau test)
   - Klik **"Save and Continue"** → **"Back to Dashboard"**
4. Balik ke **"Credentials"** → **"+ Create Credentials"** → **"OAuth client ID"**
5. Pilih **Application type**: **"Web application"**
6. Kasih nama (misal: `Kumala Space Web`)
7. Di bagian **"Authorized JavaScript origins"**, klik **"+ Add URI"** dan tambahkan:
   - `http://localhost:5173` (untuk development)
   - URL Netlify lu nanti (setelah deploy, misal: `https://kumala-space.netlify.app`)
8. Di bagian **"Authorized redirect URIs"**, kosongkan dulu (tidak diperlukan untuk Implicit Flow)
9. Klik **"Create"**
10. Akan muncul popup berisi **Client ID** — copy Client ID-nya

---

## Langkah 4 — Pasang Client ID ke Project

1. Di folder `kumala-space/`, buat file baru bernama **`.env`** (tanpa ekstensi apapun)
2. Isi file tersebut dengan:

```
VITE_GOOGLE_CLIENT_ID=CLIENT_ID_LU_DI_SINI.apps.googleusercontent.com
```

3. Ganti `CLIENT_ID_LU_DI_SINI` dengan Client ID yang tadi lu copy

---

## Langkah 5 — Jalankan App

```bash
cd kumala-space
npm run dev
```

Buka `http://localhost:5173` di browser, klik **"Login dengan Google"**, dan selesai!

---

## Catatan Penting

- File `.env` **jangan di-commit ke GitHub** (sudah ada di `.gitignore`)
- Kalau mau deploy ke Netlify, tambahkan `VITE_GOOGLE_CLIENT_ID` di **Environment Variables** di dashboard Netlify
- Semua foto dan notes tersimpan di Google Drive akun yang login, di folder bernama **"Kumala's Space"**
- App ini hanya bisa diakses oleh akun yang terdaftar sebagai **Test User** (selama app masih dalam mode testing)



980785884518-33upbk5fvfipc8sf7t3gi4okb3993ujp.apps.googleusercontent.com

GOCSPX-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx