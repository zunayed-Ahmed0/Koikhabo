@echo off
echo 🍽️ Starting Koikhabo Campus Food Discovery Platform...
echo.

REM Backend Setup
echo 📦 Setting up Backend...
cd koikhabo_backend

REM Activate virtual environment
if exist "venv\Scripts\activate.bat" (
    echo ✅ Activating virtual environment...
    call venv\Scripts\activate.bat
) else (
    echo ❌ Virtual environment not found. Please run setup_commands.bat first.
    pause
    exit /b 1
)

REM Apply migrations
echo 🔄 Applying database migrations...
python manage.py makemigrations
python manage.py migrate

REM Populate sample data
echo 📊 Populating sample data...
python populate_data.py

REM Start backend server
echo 🚀 Starting Django backend server...
start "Koikhabo Backend" cmd /k "python manage.py runserver"

REM Wait a moment for backend to start
timeout /t 3 /nobreak > nul

REM Frontend Setup
cd ..\koikhabo-frontend
echo 📦 Setting up Frontend...

REM Install dependencies if needed
if not exist "node_modules" (
    echo 📥 Installing frontend dependencies...
    npm install
)

REM Start frontend server
echo 🚀 Starting React frontend server...
start "Koikhabo Frontend" cmd /k "npm start"

echo.
echo ✅ Koikhabo Platform Started Successfully!
echo.
echo 🌐 Frontend: http://localhost:3000
echo 🔧 Backend API: http://localhost:8000/api
echo 👨‍💼 Admin Panel: http://localhost:8000/admin
echo.
echo Press any key to exit...
pause > nul