Koikhabo? 🍽️

Koikhabo? is a web-based food recommendation system designed for university students built with React, Django, and SQLite. It helps users discover nearby restaurants, view menus, and get personalized recommendations based on their preferences. The platform aims to make decision-making easier when choosing where and what to eat.

Features

Browse nearby restaurants based on the user’s current location.

View detailed information about each restaurant, including menu and reviews.

Personalized food recommendations for students.

Responsive and modern UI for seamless experience on mobile and desktop.

Easy-to-use interface with smooth interactions and dark mode support.

Tech Stack

Frontend: React.js, HTML5, CSS3, JavaScript

Backend: Django, Django REST Framework

Database: SQLite

APIs: Location-based services for fetching nearby restaurants

Deployment: (Optional section if deployed on Vercel/Heroku)

Installation
Prerequisites

Make sure you have the following installed:

Node.js and npm

Python 3.x

Django

SQLite (comes bundled with Django)

Steps

Clone the repository:

git clone https://github.com/your-username/koikhabo.git
cd koikhabo


Set up the backend:

cd backend
python -m venv venv
source venv/bin/activate   # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver


Set up the frontend:

cd frontend
npm install
npm start


Open your browser and navigate to http://localhost:3000 to view the app.

Usage

Allow location access to get nearby restaurant recommendations.

Browse through restaurant lists and click on a restaurant to see more details.

Filter recommendations by cuisine, price, or rating (optional feature if implemented).

Add favorite restaurants to easily access them later.

Contributing

We welcome contributions to improve Koikhabo?

Fork the repository.

Create a new branch:

git checkout -b feature/your-feature-name


Make your changes and commit:

git commit -m "Add feature: description"


Push to your branch:

git push origin feature/your-feature-name


Open a pull request.

License

This project is licensed under the MIT License. See the LICENSE
 file for details.

Contact

Zunayed Ahmed

Email: zunayed.a.ahmed20@gmail.com

LinkedIn: Zunayed Ahmed
