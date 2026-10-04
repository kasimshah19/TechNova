# Backend API Routing Structure

How Express handles and routes incoming HTTP requests.

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
