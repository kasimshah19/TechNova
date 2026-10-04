# Backend API Routing Structure

## Overview
How the Node.js/Express backend handles, parses, and routes incoming HTTP requests.

## How it works:
1. Every request passes through global middleware: CORS (Cross-Origin), Helmet (Security Headers), and Body Parsers (JSON).
2. The router splits traffic based on path prefixes:
   - `/api/auth`: Public routes for login.
   - `/api/gemini`: AI generation routes.
   - `/api/history`: Database fetch routes.
3. Protected routes pass through an Auth Middleware that verifies the JWT token.
4. If an error occurs anywhere in the chain, execution jumps to the Global Error Handler, ensuring the API never crashes and always returns a clean JSON error response.

```mermaid
graph TD
    App[Express App entry point] --> Middleware[Global Middleware: CORS, Helmet, JSON Parser]
    Middleware --> AuthRouter[/api/auth]
    Middleware --> GeminiRouter[/api/gemini]
    Middleware --> HistoryRouter[/api/history]
    
    AuthRouter --> Login[POST /login]
    AuthRouter --> Register[POST /register]
    
    GeminiRouter --> AuthCheck[Auth Middleware]
    AuthCheck --> Scan[POST /scan]
    AuthCheck --> Content[POST /content]
    AuthCheck --> Image[POST /image]
    AuthCheck --> Code[POST /code]
    
    HistoryRouter --> AuthCheck2[Auth Middleware]
    AuthCheck2 --> GetHistory[GET /]
    AuthCheck2 --> DeleteHistory[DELETE /:id]
    
    Scan --> ErrorHandler[Global Error Handler]
    Content --> ErrorHandler
```
