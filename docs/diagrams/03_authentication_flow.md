# Authentication Flow

## Overview
Detailed flow of how JSON Web Token (JWT) authentication is handled between the client and server.

## How it works:
1. The user provides a username and password on the frontend.
2. The Node.js API queries the database for the user.
3. `bcrypt.compare` is used to securely check the entered password against the hashed database value.
4. If valid, a JWT token is signed using a secret key and returned to the client.
5. The frontend stores this token (e.g., using Zustand state) and attaches it as a `Bearer` token in the `Authorization` header for all subsequent protected API requests.

```mermaid
sequenceDiagram
    participant User
    participant Client as React Frontend
    participant API as Express Backend
    participant DB as MongoDB Atlas

    User->>Client: Enters credentials
    Client->>API: POST /api/auth/login (username, password)
    API->>DB: Query User by username
    DB-->>API: Return User document (with hash)
    API->>API: bcrypt.compare(password, hash)
    alt Invalid Credentials
        API-->>Client: 401 Unauthorized
        Client-->>User: Show Error
    else Valid Credentials
        API->>API: Sign JWT with SECRET
        API-->>Client: 200 OK + { token, user }
        Client->>Client: Store token in Zustand / localStorage
        Client-->>User: Redirect to Dashboard
    end
```
