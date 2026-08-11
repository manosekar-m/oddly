@echo off
echo ========================================
echo    ODDLY - Auto Setup (Windows)
echo ========================================
echo.
echo [1/2] Installing Backend packages...
cd backend
call npm install
cd ..
echo.
echo [2/2] Installing Frontend packages...
cd frontend
call npm install
cd ..
echo.
echo ========================================
echo    SETUP COMPLETE!
echo ========================================
echo.
echo NEXT STEPS:
echo 1. Open backend\.env and set your MONGO_URI
echo    For local MongoDB use: mongodb://localhost:27017/oddly
echo.
echo 2. Open TWO terminal windows:
echo.
echo    Terminal 1 - Backend:
echo      cd backend
echo      node server.js
echo.
echo    Terminal 2 - Frontend:
echo      cd frontend
echo      npm run dev
echo.
echo 3. Open browser: http://localhost:5173
echo 4. Admin panel: http://localhost:5173/admin/login
echo    Email: admin@oddly.com
echo    Password: admin123
echo.
echo IMPORTANT: Set your UPI ID in:
echo    frontend\src\pages\Checkout.jsx
echo    Change: const YOUR_UPI_ID = 'yourname@upi'
echo.
pause
