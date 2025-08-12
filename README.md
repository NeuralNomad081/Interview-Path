# Flask Authentication API

This Flask application provides a complete authentication system with JWT tokens.

## Features

- User registration (`/signup`)
- User login (`/login`)
- User logout (`/logout`)
- Protected routes with JWT authentication
- Password hashing with Werkzeug
- Input validation and error handling
- Profile management
- Password change functionality

## API Endpoints

### Authentication Routes

#### POST /signup
Register a new user.

**Request Body:**
```json
{
    "email": "user@example.com",
    "password": "password123",
    "name": "John Doe" // optional
}
```

**Response (201):**
```json
{
    "message": "User created successfully",
    "user": {
        "email": "user@example.com",
        "name": "John Doe"
    }
}
```

#### POST /login
Authenticate a user and receive JWT token.

**Request Body:**
```json
{
    "email": "user@example.com",
    "password": "password123"
}
```

**Response (200):**
```json
{
    "message": "Login successful",
    "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "user": {
        "email": "user@example.com",
        "name": "John Doe"
    }
}
```

#### POST /logout
Logout user (requires authentication).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (200):**
```json
{
    "message": "Logout successful"
}
```

### Protected Routes

#### GET /profile
Get user profile information.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (200):**
```json
{
    "user": {
        "email": "user@example.com",
        "name": "John Doe",
        "created_at": "2024-01-01T12:00:00"
    }
}
```

#### PUT /change-password
Change user password.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
    "current_password": "oldpassword123",
    "new_password": "newpassword123"
}
```

### Utility Routes

#### GET /health
Health check endpoint.

**Response (200):**
```json
{
    "status": "healthy",
    "timestamp": "2024-01-01T12:00:00"
}
```

## Setup Instructions

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Update the `.env` file with your secret key:
   ```
   SECRET_KEY=your-super-secret-key-here
   ```

3. Run the application:
   ```bash
   python app.py
   ```

The server will start on `http://localhost:5000`

## Security Features

- Passwords are hashed using Werkzeug's security functions
- JWT tokens expire after 24 hours
- Input validation and sanitization
- Proper error handling without exposing sensitive information
- Protected routes require valid JWT tokens

## Frontend Integration

To use these endpoints in your frontend:

1. **Registration:** POST to `/signup` with user data
2. **Login:** POST to `/login` to get JWT token
3. **Store token:** Save the JWT token in localStorage or cookies
4. **Authenticated requests:** Include token in Authorization header: `Bearer <token>`
5. **Logout:** Remove token from client storage and optionally call `/logout`

## Example Frontend Usage (JavaScript)

```javascript
// Login
const login = async (email, password) => {
    const response = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
    });
    const data = await response.json();
    if (response.ok) {
        localStorage.setItem('token', data.token);
    }
    return data;
};

// Authenticated request
const getProfile = async () => {
    const token = localStorage.getItem('token');
    const response = await fetch('http://localhost:5000/profile', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    return response.json();
};
```

## Production Notes

- Replace the in-memory user storage with a proper database (PostgreSQL, MongoDB, etc.)
- Use environment variables for all sensitive configuration
- Implement rate limiting
- Add CORS configuration for frontend integration
- Consider implementing refresh tokens for better security
- Add email verification for new accounts
- Implement password reset functionality
