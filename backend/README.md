# Ecobazaar Backend

This is the backend for the Ecobazaar project, which provides functionalities for user authentication and product management.

## Features

- User signup and login
- Add, retrieve, and delete products
- Secure routes with authentication middleware

## Technologies Used

- Node.js
- Express.js
- MongoDB (with Mongoose)
- JWT for authentication
- dotenv for environment variable management

## Project Structure

```
backend
├── src
│   ├── app.js                # Entry point of the application
│   ├── controllers           # Contains controllers for handling requests
│   │   ├── authController.js # Handles user authentication
│   │   └── productController.js # Manages product-related operations
│   ├── models                # Contains Mongoose models
│   │   ├── user.js           # User model
│   │   └── product.js        # Product model
│   ├── routes                # Defines API routes
│   │   ├── authRoutes.js     # Authentication routes
│   │   └── productRoutes.js  # Product management routes
│   ├── config                # Configuration files
│   │   └── db.js            # Database connection logic
│   └── middleware            # Middleware functions
│       └── authMiddleware.js # Authentication middleware
├── package.json              # NPM dependencies and scripts
├── .env                      # Environment variables
└── README.md                 # Project documentation
```

## Setup Instructions

1. Clone the repository:
   ```
   git clone <repository-url>
   cd backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the root directory and add your MongoDB connection string and JWT secret:
   ```
   MONGODB_URI=<your_mongodb_connection_string>
   JWT_SECRET=<your_jwt_secret>
   ```

4. Start the server:
   ```
   npm start
   ```

## API Usage

### Authentication

- **POST /api/auth/signup**: Create a new user
- **POST /api/auth/login**: Authenticate a user and return a token

### Products

- **POST /api/products**: Add a new product (requires authentication)
- **GET /api/products**: Retrieve all products

## License

This project is licensed under the MIT License.