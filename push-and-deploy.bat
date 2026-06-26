@echo off
SETLOCAL EnableDelayedExpansion

echo ===================================================
echo   Sign Resi - Push to GitHub & Deploy to Vercel
echo ===================================================
echo.

:: Step 1: Check Git
where git >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Git tidak ditemukan. Silakan install Git terlebih dahulu: https://git-scm.com/
    pause
    exit /b 1
)

:: Step 2: Initialize Git if not done
if not exist .git (
    echo [*] Menginisialisasi Git repository...
    git init
    git branch -M main
) else (
    echo [*] Git repository sudah terinisialisasi.
)

:: Step 3: Add and Commit
echo [*] Menambahkan file ke Git...
git add .
echo [*] Melakukan commit pertama...
git commit -m "Initial commit - Sign Resi" 2>nul
if %ERRORLEVEL% neq 0 (
    :: Try setting config if it fails due to no identity
    git config --global user.email "bagasadiprabowo90@gmail.com"
    git config --global user.name "Bagas Adi Prabowo"
    git commit -m "Initial commit - Sign Resi"
)

echo.
echo ===================================================
echo   PILIHAN PUSH KE GITHUB
echo ===================================================
echo [1] Saya sudah membuat repositori kosong di GitHub dan punya URL-nya (e.g. https://github.com/.../...)
echo [2] Saya ingin membuat repositori baru via GitHub CLI (butuh Github CLI terinstall)
echo [3] Lewati langkah GitHub (hanya deploy ke Vercel)
echo.
set /p CHOICE="Pilih opsi (1/2/3): "

if "%CHOICE%"=="1" (
    set /p REPO_URL="Masukkan URL Repositori GitHub Anda: "
    git remote remove origin >nul 2>nul
    git remote add origin !REPO_URL!
    echo [*] Mempush ke GitHub main...
    git push -u origin main
) else if "%CHOICE%"=="2" (
    where gh >nul 2>nul
    if %ERRORLEVEL% neq 0 (
        echo [ERROR] GitHub CLI (gh) tidak ditemukan. Silakan install gh atau gunakan opsi 1.
        pause
    ) else (
        echo [*] Membuat repositori baru di GitHub...
        gh repo create sign-resi --public --source=. --remote=origin --push
    )
) else (
    echo [*] Melewati proses push ke GitHub.
)

echo.
echo ===================================================
echo   DEPLOY KE VERCEL
echo ===================================================
echo [*] Memulai proses deploy ke Vercel...
echo [*] Menjalankan 'npx vercel'...
echo.
echo PENTING: Jika diminta login, pilih login dengan email/GitHub yang terhubung ke bagasadiprabowo90@gmail.com.
echo.

npx vercel --prod

if %ERRORLEVEL% eq 0 (
    echo.
    echo [SUCCESS] Aplikasi berhasil di-deploy ke Vercel!
) else (
    echo.
    echo [WARNING] Deploy Vercel selesai dengan status/peringatan tertentu.
)

echo.
echo Proses selesai.
pause
