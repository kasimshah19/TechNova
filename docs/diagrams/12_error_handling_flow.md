# Global Error Handling Flow

## Overview
How unexpected crashes and expected API errors are caught, formatted, and displayed to the user safely.

## How it works:
- **Backend Controller**: Tries to execute code. If it catches an error (e.g., Gemini API is down), it passes it to the `next(error)` middleware.
- **Error Middleware**: The Express global error handler catches all thrown errors. It hides sensitive stack traces in production, formats the error into a clean JSON object (`{ error: "Message" }`), and sends the appropriate HTTP status code.
- **Frontend Axios Catch**: The frontend receives the 4xx or 5xx code, translates the JSON message, and triggers a UI Toast notification (e.g., using Sonner or standard React state) so the user understands what went wrong.

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Route Controller
    participant Error Middleware
    
    User->>Frontend: Perform Action
    Frontend->>Route Controller: API Request
    
    alt Success
        Route Controller-->>Frontend: 200/201 Success Response
    else Expected Error (e.g. Validation)
        Route Controller->>Error Middleware: next(Error)
        Error Middleware-->>Frontend: 400 Bad Request
    else Unexpected Server Error
        Route Controller->>Error Middleware: Throw Exception
        Error Middleware-->>Frontend: 500 Internal Server Error
    end
    
    Frontend->>Frontend: Catch block (Axios)
    Frontend-->>User: Show Toast Notification / Error Message
```
