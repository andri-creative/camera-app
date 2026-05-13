# Tutorial: Mengubah Proyek ke Aplikasi Android (APK)

Proyek kamu sudah menggunakan **Capacitor**, jadi prosesnya sangat standar. Berikut adalah langkah-langkahnya:

## 1. Persiapan Software
Pastikan kamu sudah menginstal:
*   **Android Studio**: [Download di sini](https://developer.android.com/studio)
*   **Android SDK**: Pastikan sudah terinstal melalui SDK Manager di Android Studio (minimal API level 30+).

## 2. Inisialisasi Android
Jalankan perintah ini di terminal (folder utama proyek):

```powershell
# 1. Build file web terbaru
npm run build

# 2. Tambahkan folder android ke proyek
npx cap add android
```

*Catatan: Jika `npx cap add android` gagal, pastikan kamu sudah menjalankan `npm run build` terlebih dahulu karena Capacitor butuh folder `dist`.*

## 3. Sinkronisasi Kode
Setiap kali kamu mengubah kode di React (di folder `src`), kamu harus menjalankan perintah ini agar perubahannya masuk ke aplikasi Android:

```powershell
npm run build
npx cap sync
```

## 4. Membuka Android Studio
Untuk mulai membuat file APK, buka proyek Android kamu di Android Studio:

```powershell
npx cap open android
```

## 5. Cara Membuat File APK
Setelah Android Studio terbuka dan selesai melakukan "Gradle Sync" (tunggu loading di pojok bawah selesai):

1.  Klik menu **Build** di bagian atas.
2.  Pilih **Build Bundle(s) / APK(s)**.
3.  Klik **Build APK(s)**.
4.  Tunggu sebentar, lalu akan muncul notifikasi di pojok kanan bawah. Klik **Locate** untuk menemukan file `app-debug.apk` kamu.

---

### Tips Penting:
*   **Izin Kamera & GPS**: Karena ini aplikasi Kamera GPS, pastikan kamu sudah mengatur izin di file `AndroidManifest.xml` (biasanya Ionic sudah mengaturnya secara otomatis, tapi perlu dicek jika kamera tidak terbuka).
*   **Icon Aplikasi**: Kamu bisa mengganti ikon aplikasi di folder `android/app/src/main/res`.
