# BLP Sign App

Aplikasi web mobile-first untuk menandatangani PDF **Surat Jalan** langsung dari HP/komputer.
Bekerja **sepenuhnya offline** — tidak butuh internet, tidak butuh akun, tidak ada sinkronisasi cloud.
PDF yang sudah ditandatangani otomatis terunduh ke perangkat.

## Cara menjalankan (di komputer)

Butuh **Node.js versi 20.19+ atau 22.12+** (disarankan Node 22 LTS). Cek versi: `node -v`.

1. Buka folder ini di terminal (PowerShell / CMD).
2. Pasang dependency:
   ```
   npm install
   ```
3. Jalankan mode pengembangan:
   ```
   npm run dev
   ```
   Lalu buka alamat yang muncul (biasanya http://localhost:5173).

## Build untuk produksi (file siap di-hosting)

```
npm run build
```
Hasilnya ada di folder `dist/`. Karena `base` di-set `./`, isi folder `dist/` bisa dibuka
langsung dari hosting statis mana pun (atau di-zip dan dibagikan).

Pratinjau hasil build:
```
npm run preview
```

## Alur pemakaian

1. Pilih PDF surat jalan dari HP / WhatsApp.
2. Lihat halaman terakhir, ketuk posisi tanda tangan (kotak panduan "TTD" muncul).
3. Gores tanda tangan.
4. Simpan — file `signed-<nama>.pdf` otomatis terunduh.

## Catatan teknis

- Stack: React 19 + Vite + TypeScript, Tailwind CSS v4.
- Render PDF: `pdfjs-dist` (dikunci di **4.10.38** — versi 5/6 crash di browser).
- Tanda tangan PDF: `pdf-lib`. Gambar tanda tangan: `react-signature-canvas`.
- Tanda tangan ditempel di **halaman terakhir** PDF.
# sign-resi-pdf
