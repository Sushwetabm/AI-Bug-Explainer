# Bug Explainer Backend

A Node.js + Express.js backend for identifying code bugs and providing educational explanations with fix suggestions.

## Features

- User authentication (JWT)
- Code analysis submission
- Bug detection and explanation
- User history tracking
- Comprehensive API documentation

## Technologies

- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT Authentication
- Swagger API Documentation
- Winston Logging

## Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Create `.env` file based on `.env.example`
4. Start MongoDB service
5. Run the server: `npm run dev`

## API Documentation

After starting the server, access the API documentation at: `http://localhost:3000/api-docs`

## Testing

Run tests with: `npm test`

## Deployment

For production deployment:

1. Set `NODE_ENV=production` in `.env`
2. Configure production MongoDB URI
3. Set strong JWT secrets
4. Start with: `npm start` or use PM2
