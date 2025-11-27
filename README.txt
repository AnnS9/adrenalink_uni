Project Title
Adrenalink Web Application

Overview
Adrenalink is a web platform designed to help users discover adventure and extreme sports activities across the UK. It includes map-based exploration, activity listings, user reviews, and basic community interaction. The application was developed for an academic project and follows a mobile-first, user-centred approach.

Usage

Register or log in to your account.

Explore activities using the map or list interface.

View detailed activity information and reviews.

Save favourites and contribute your own reviews or tips.

Engage with other users through community features.

Notes

All images used in the prototype were sourced from Pexels, Pixabay, and Pngegg to represent authentic outdoor and adventure contexts.

The platform is currently a prototype; future updates will focus on scalability, enhanced community features, and additional adventure sports coverage.




Features
Map-based activity discovery
User accounts and authentication
Create, edit, and delete activity reviews
Admin panel for managing activities
Responsive design for mobile and desktop

Technology Stack
Frontend: React
Backend: Flask (Python)
Database: SQLite
Mapping: Leaflet
Deployment: Render.com

Dependencies

This project uses the following libraries:

@fortawesome/fontawesome-svg-core  – Core Font Awesome library for SVG icons.

@fortawesome/free-solid-svg-icons  – Free solid-style icons from Font Awesome.

@fortawesome/react-fontawesome  – React integration for Font Awesome icons.

@testing-library/dom  – Utilities for DOM testing.

@testing-library/jest-dom  – Custom Jest matchers for DOM nodes.

@testing-library/react  – React testing utilities.

jwt-decode  – Decode JWT tokens.

leaflet  – Interactive maps library.

react-leaflet  – React integration for Leaflet maps.

lucide-react  – Icon library for React.

react-icons  – Popular icons for React components.

react-router-dom – Routing and navigation for React apps.

react-scripts  – Scripts and configuration used by Create React App.

react-toastify  – Toast notifications for React.

web-vitals – Performance monitoring for React applications.


The backend of Adrenalink uses the following Python libraries:


Flask – Lightweight web framework for building APIs and web applications.

Gunicorn – Production-ready WSGI server for running Flask applications.

Flask-CORS – Enables Cross-Origin Resource Sharing (CORS) to allow requests from different domains.

python-dotenv – Loads environment variables from a .env file for secure configuration.

requests – Sends HTTP requests to interact with external APIs or web services.

PyJWT – Handles JSON Web Tokens (JWT) for authentication and secure data exchange.
bcrypt

# Python dependencies
pip install -r requirements.txt

# JavaScript dependencies
npm install


Frontend

Navigate to the frontend directory:

cd frontend


Install JavaScript dependencies:

npm install

Start the development server:

npm start

Backend

Navigate to the frontend directory:
 cd backend


python -m venv venv
source venv/bin/activate   # Linux/macOS
venv\Scripts\activate      # Windows
Install Python dependencies:

pip install -r requirements.txt

Run the Flask application:

flask run