# Exercise-Tracker
## Description
The Exercise Tracker API is a simple RESTful service that allows users to create an account, log their exercises, and retrieve their exercise logs with filtering options. This project is built using Node.js, Express, and MongoDB, and it provides a structured way to track workout activities efficiently.

## Features

- Create a user

- Add exercises to a user

- Retrieve a user's exercise log with optional filtering (date range, limit)

- Serve static files from the public directory

- Error handling for invalid requests

## Technologies Used

- Node.js

- Express

- MongoDB with Mongoose

- CORS

- Body-parser

- Morgan

- dotenv


## Installation

1. Clone the repository:

2. Install dependencies:

3. Create a .env file in the root directory and add:

4. Start the server:

# API Endpoints

## Create a new user
POST /api/users

## Get all users

GET /api/users


## Add exercise

POST /api/users/:_id/exercises


## Get exercise log

GET /api/users/:_id/logs?from=YYYY-MM-DD&to=YYYY-MM-DD&limit=number

## Error Handling

- Returns a 400 status code for invalid request bodies.

- Returns a 404 status code when a user is not found.

- Returns a 500 status code for server errors.

## License

This project is open-source and available under the MIT License.




