const fs = require('fs');
const path = require('path');

const diagrams = [
  {
    name: "11_frontend_routing.md",
    content: `# Frontend Routing Architecture

How React Router manages navigation and protected routes.

\`\`\`mermaid
graph TD
    Router[BrowserRouter] --> Routes
    
    Routes --> PublicRoutes[Public Routes]
    Routes --> ProtectedRoutes[Protected Routes - AuthGuard]
    
    PublicRoutes --> Login[/login]
    PublicRoutes --> CatchAll[/* -> Redirect to /login]
    
    ProtectedRoutes --> DashboardLayout
    
    DashboardLayout --> Home[/]
    DashboardLayout --> Scan[/scan]
    DashboardLayout --> Content[/content]
    DashboardLayout --> Image[/image]
    DashboardLayout --> Code[/code]
    DashboardLayout --> History[/history]
\`\`\`
`
  },
  {
    name: "12_error_handling_flow.md",
    content: `# Global Error Handling Flow

How errors are caught and processed across the stack.

\`\`\`mermaid
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
\`\`\`
`
  },
  {
    name: "13_database_connection_lifecycle.md",
    content: `# Database Connection Lifecycle

Mongoose connection management, especially for Serverless environments.

\`\`\`mermaid
stateDiagram-v2
    [*] --> Disconnected
    
    Disconnected --> Connecting : Server Starts / DB Request
    Connecting --> Connected : Authentication Success
    Connecting --> Error : Invalid URI / IP Blocked
    
    Connected --> Disconnected : Connection Lost
    Connected --> Connected : Cached Connection (Serverless reuse)
    
    Error --> [*] : Exit Process / Retry
\`\`\`
`
  },
  {
    name: "14_rate_limiting_architecture.md",
    content: `# Rate Limiting Architecture

Protection against abuse and excessive API calls.

\`\`\`mermaid
graph TD
    IncomingRequest[Incoming Request] --> RouteCheck{Check Route}
    
    RouteCheck -->|/api/auth/*| AuthLimiter[Auth Limiter]
    RouteCheck -->|/api/gemini/*| AILimiter[AI Limiter]
    RouteCheck -->|/api/health| NoLimit[No Limiter]
    
    AuthLimiter -->|10 req / 15 min| AllowAuth{Limit Exceeded?}
    AILimiter -->|8 req / 60 sec| AllowAI{Limit Exceeded?}
    
    AllowAuth -->|Yes| Block1[429 Too Many Requests]
    AllowAuth -->|No| ProcessAuth[Process Login]
    
    AllowAI -->|Yes| Block2[429 Too Many Requests]
    AllowAI -->|No| ProcessAI[Process AI Generation]
\`\`\`
`
  },
  {
    name: "15_code_generation_flow.md",
    content: `# Code Generation Flow

Process of taking user prompts and returning syntax-highlighted code.

\`\`\`mermaid
sequenceDiagram
    participant Developer
    participant UI (CodePanel)
    participant Backend
    participant Gemini API
    
    Developer->>UI (CodePanel): Enter prompt & Select Language
    UI (CodePanel)->>Backend: POST /api/gemini/code (prompt, language)
    Backend->>Gemini API: Construct prompt with specific language constraints
    Gemini API-->>Backend: Return Markdown Code Block
    Backend->>Backend: Parse Markdown & Save to DB
    Backend-->>UI (CodePanel): Return Raw Code
    UI (CodePanel)->>UI (CodePanel): Apply Syntax Highlighting (react-syntax-highlighter)
    UI (CodePanel)-->>Developer: Display Formatted Code
\`\`\`
`
  }
];

diagrams.forEach(diag => {
  fs.writeFileSync(path.join(__dirname, 'diagrams', diag.name), diag.content);
  console.log('Created:', diag.name);
});
