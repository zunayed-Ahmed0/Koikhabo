# Create virtual environment
python -m venv venv

# Activate virtual environment (Windows)
venv\Scripts\activate

# Install Django dependencies
pip install django djangorestframework django-cors-headers python-decouple

# Create Django project
django-admin startproject koikhabo_backend
cd koikhabo_backend
python manage.py startapp foodapp