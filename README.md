# Project Setup Guide

This repository contains both frontend and backend components of the project. Below are the instructions to set up and run the application.

## Backend Setup

1. Initialize npm project:
```bash
npm init -y
```

2. Install required dependencies:
```bash
npm install express cors morgan pg dotenv helmet jsonwebtoken bcrypt
```

3. Install development dependencies:
```bash
npm install nodemon --save-dev
```

4. Configure the database connection:
   - Update the database configuration in `index.js` with your SQL database information.

## Frontend Setup

1. Install required dependencies:
```bash
npm install react-router-dom axios firebase bootstrap
```

## Running the Application

1. Start the backend server:
```bash
cd backend
npm start
```

2. Start the frontend application:
```bash
cd frontend
npm start
```

The application should now be running and accessible through your browser.

## Notes

- Make sure the database is properly set up and running before starting the backend server.
- Ensure all environment variables are correctly configured in a `.env` file.
- The frontend is built with React and uses additional libraries.