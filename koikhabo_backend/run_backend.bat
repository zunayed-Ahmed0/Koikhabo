@echo off
echo Starting Koikhabo Backend Server...
echo.

REM Activate virtual environment if it exists
if exist "venv\Scripts\activate.bat" (
    echo Activating virtual environment...
    call venv\Scripts\activate.bat
)

REM Apply migrations
echo Applying database migrations...
python manage.py makemigrations
python manage.py migrate

REM Create superuser if needed (optional)
echo.
echo To create admin user, run: python manage.py createsuperuser
echo.

REM Start development server
echo Starting Django development server...
echo Backend will be available at: http://127.0.0.1:8000
echo Admin panel at: http://127.0.0.1:8000/admin
echo API endpoints at: http://127.0.0.1:8000/api
echo.
python manage.py runserver