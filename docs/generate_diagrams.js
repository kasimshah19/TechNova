const fs = require('fs');
const path = require('path');

const diagrams = [
  {
    name: "01_system_architecture.md",
    content: `# TechNova System Architecture

## Overview
This diagram illustrates the high-level architecture of the TechNova platform. It maps out how the user interacts with the system, and how the various distributed cloud services communicate with each other.

## How it works:
1. **Client Interaction**: Users interact with the React-based frontend hosted on Vercel's Edge Network, ensuring fast static delivery.
2. **API Requests**: The frontend sends REST API calls to the Express backend hosted on Render.
3. **Data Persistence**: The backend connects to MongoDB Atlas using Mongoose to read and write application state (users, history, logs).
4. **AI Generation**: For heavy lifting (Content, Code, Image generation), the backend securely proxies requests to the Google Gemini API.

\`\`\`mermaid
graph TD
    Client[Web Browser Client] -->|HTTPS| Frontend[Vercel Frontend - React/Vite]
    Frontend -->|REST API| Backend[Render Backend - Node/Express]
    Backend -->|Mongoose/TCP| DB[(MongoDB Atlas)]
    Backend -->|REST API| Gemini[Google Gemini API]
    
    classDef frontend fill:#3b82f6,stroke:#1d4ed8,stroke-width:2px,color:#fff;
    classDef backend fill:#10b981,stroke:#047857,stroke-width:2px,color:#fff;
    classDef db fill:#f59e0b,stroke:#b45309,stroke-width:2px,color:#fff;
    classDef external fill:#8b5cf6,stroke:#5b21b6,stroke-width:2px,color:#fff;
    
    class Frontend frontend;
    class Backend backend;
    class DB db;
    class Gemini external;
\`\`\`
`
  },
  {
    name: "02_database_schema.md",
    content: `# Database Schema (ERD)

## Overview
This Entity-Relationship Diagram (ERD) shows the MongoDB document collections and their relationships. Since MongoDB is NoSQL, these relationships are maintained via \`ObjectId\` references.

## How it works:
- **USER Collection**: The central entity containing authentication data (hashed passwords) and roles.
- **Relational Data**: Every action performed on the platform (SCAN, CONTENT, IMAGE, CODE) is tied to the \`user_id\`.
- **History Tracking**: By linking generations to the user, the platform can fetch and display a comprehensive history dashboard for the admin.

\`\`\`mermaid
erDiagram
    USER ||--o{ SCAN : "performs"
    USER ||--o{ CONTENT : "generates"
    USER ||--o{ IMAGE : "generates"
    USER ||--o{ CODE : "generates"

    USER {
        ObjectId _id
        string username
        string password_hash
        string role
        date createdAt
    }
    
    SCAN {
        ObjectId _id
        ObjectId user_id
        string category
        string result_json
        date scannedAt
    }
    
    CONTENT {
        ObjectId _id
        ObjectId user_id
        string platform
        string original_prompt
        string generated_text
        date createdAt
    }
    
    IMAGE {
        ObjectId _id
        ObjectId user_id
        string prompt
        string image_url
        date generatedAt
    }
\`\`\`
`
  },
  {
    name: "03_authentication_flow.md",
    content: `# Authentication Flow

## Overview
Detailed flow of how JSON Web Token (JWT) authentication is handled between the client and server.

## How it works:
1. The user provides a username and password on the frontend.
2. The Node.js API queries the database for the user.
3. \`bcrypt.compare\` is used to securely check the entered password against the hashed database value.
4. If valid, a JWT token is signed using a secret key and returned to the client.
5. The frontend stores this token (e.g., using Zustand state) and attaches it as a \`Bearer\` token in the \`Authorization\` header for all subsequent protected API requests.

\`\`\`mermaid
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
\`\`\`
`
  },
  {
    name: "04_content_generation_flow.md",
    content: `# AI Content Generation Flow

## Overview
Process of generating platform-specific social media content using the Google Gemini API.

## How it works:
1. The user fills out a form specifying a topic, target platform (e.g., Twitter, LinkedIn), and desired tone.
2. The backend intercepts this request, validates the JWT auth token, and constructs a highly specific prompt.
3. The prompt is sent to the \`gemini-3.5-flash\` text model.
4. Once Gemini returns the formatted markdown text, the backend saves the result in the \`CONTENT\` collection in MongoDB for historical tracking.
5. The response is forwarded to the frontend, where it is rendered beautifully.

\`\`\`mermaid
sequenceDiagram
    participant Client
    participant Backend
    participant Gemini API
    participant DB

    Client->>Backend: POST /api/gemini/content (topic, platform, tone)
    Backend->>Backend: Validate Request & Auth Token
    Backend->>Gemini API: Send Prompt to gemini-3.5-flash
    Gemini API-->>Backend: Return Generated Markdown/Text
    Backend->>DB: Save generated content history
    DB-->>Backend: Acknowledge Save
    Backend-->>Client: 200 OK (Generated Content)
\`\`\`
`
  },
  {
    name: "05_deployment_architecture.md",
    content: `# Deployment Architecture

## Overview
Infrastructure setup for TechNova distributed across multiple cloud providers for maximum free-tier efficiency.

## How it works:
- **Vercel**: Handles the React SPA (Single Page Application). It serves static assets globally via its CDN edge network, ensuring blazing-fast load times.
- **Render**: Hosts the Express Node.js backend. Render is chosen because it supports long-running processes, which are necessary for heavy API tasks and WebSockets (if added later).
- **MongoDB Atlas**: A cloud-managed database service that stores the application's persistent state.
- **Google Cloud**: Provides the Gemini API endpoints used for generative AI capabilities.

\`\`\`mermaid
flowchart LR
    User((User)) -->|DNS/CDN| Vercel(Vercel Edge Network)
    
    subgraph Frontend Hosting [Vercel]
        ReactApp[React SPA Static Files]
    end
    
    Vercel --> ReactApp
    
    ReactApp -->|API Calls| Render(Render Cloud)
    
    subgraph Backend Hosting [Render Web Service]
        NodeApp[Node.js Express Server]
    end
    
    Render --> NodeApp
    
    NodeApp -->|Mongoose| MongoDB[(MongoDB Atlas Cluster)]
    NodeApp -->|HTTPS| GoogleAI(Google Cloud / Gemini)
\`\`\`
`
  },
  {
    name: "06_state_management.md",
    content: `# Frontend State Management (Zustand)

## Overview
The React frontend uses Zustand for lightweight, fast, and scalable global state management.

## How it works:
- **AuthStore**: Manages user authentication state. It holds the JWT token and user profile. UI components read from this store to determine if they should redirect unauthenticated users to the login screen.
- **AppStore**: Manages UI state, such as the currently selected category for tech news, the chosen platform for content generation, and loading states (\`isGenerating\`).
- UI Components selectively subscribe to these stores to prevent unnecessary re-renders.

\`\`\`mermaid
classDiagram
    class AuthStore {
        +User user
        +String token
        +Boolean isAuthenticated
        +login(token, user)
        +logout()
    }
    
    class AppStore {
        +String currentCategory
        +String currentPlatform
        +Boolean isGenerating
        +setCategory(category)
        +setPlatform(platform)
        +setGenerating(status)
    }

    class UIComponents {
        +Sidebar
        +Dashboard
        +LoginScreen
    }

    UIComponents ..> AuthStore : reads/updates
    UIComponents ..> AppStore : reads/updates
\`\`\`
`
  },
  {
    name: "07_api_routing_structure.md",
    content: `# Backend API Routing Structure

## Overview
How the Node.js/Express backend handles, parses, and routes incoming HTTP requests.

## How it works:
1. Every request passes through global middleware: CORS (Cross-Origin), Helmet (Security Headers), and Body Parsers (JSON).
2. The router splits traffic based on path prefixes:
   - \`/api/auth\`: Public routes for login.
   - \`/api/gemini\`: AI generation routes.
   - \`/api/history\`: Database fetch routes.
3. Protected routes pass through an Auth Middleware that verifies the JWT token.
4. If an error occurs anywhere in the chain, execution jumps to the Global Error Handler, ensuring the API never crashes and always returns a clean JSON error response.

\`\`\`mermaid
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
\`\`\`
`
  },
  {
    name: "08_image_generation_flow.md",
    content: `# Image Generation Flow

## Overview
The architecture of prompt-to-image capabilities using the Gemini API.

## How it works:
1. The user types a visual prompt and selects an aspect ratio on the frontend.
2. The backend receives the request and immediately checks the Rate Limiter to ensure the user isn't spamming the expensive image API.
3. The prompt is formatted and sent to \`gemini-3.1-flash-image\`.
4. The Gemini API returns a raw Base64 image string (or URL).
5. The backend forwards this string to the UI.
6. The UI parses the Base64 data into a viewable HTML \`<img>\` tag, allowing the user to download the final image.

\`\`\`mermaid
sequenceDiagram
    participant UI
    participant Backend
    participant Gemini Image API
    
    UI->>Backend: POST /api/gemini/image (prompt, aspect_ratio)
    Backend->>Backend: Rate Limit Check (apiLimiter)
    Backend->>Gemini Image API: Request to gemini-3.1-flash-image
    Gemini Image API-->>Backend: Base64 Image String / URL
    Backend-->>UI: 200 OK (Image Data)
    UI->>UI: Render Image Preview
\`\`\`
`
  },
  {
    name: "09_component_hierarchy.md",
    content: `# React Component Hierarchy

## Overview
The tree structure of the React Frontend application, showcasing how components are nested.

## How it works:
- **App.tsx**: The root of the application. It wraps everything in an AuthGuard.
- **AuthGuard**: Checks if the user is logged in. If not, renders the \`LoginScreen\`. If yes, renders the \`DashboardLayout\`.
- **DashboardLayout**: A persistent wrapper containing the Sidebar navigation and Top Navigation bar.
- **MainContent**: The dynamic area of the screen where specific views (Scan, Content, Image, Code) are rendered based on the active React Router path.

\`\`\`mermaid
graph TD
    App[App.tsx] --> AuthGuard
    AuthGuard --> LoginScreen
    AuthGuard --> DashboardLayout
    
    DashboardLayout --> Sidebar
    DashboardLayout --> TopNav
    DashboardLayout --> MainContent
    
    MainContent --> ScanView
    MainContent --> ContentGenerator
    MainContent --> ImageGenerator
    MainContent --> CodeGenerator
    MainContent --> HistoryView
    
    ScanView --> TrendCard
    ScanView --> ChartComponent
    
    ContentGenerator --> PlatformSelector
    ContentGenerator --> EditorPanel
\`\`\`
`
  },
  {
    name: "10_security_layers.md",
    content: `# Security Layers

## Overview
A detailed view of the backend defense-in-depth security implementation.

## How it works:
1. **Rate Limiting**: Stops DDoS and brute-force attacks immediately at the perimeter.
2. **Helmet headers**: Adds security headers to prevent XSS, clickjacking, and sniffing.
3. **CORS**: Ensures that only requests from the official Vercel frontend URL are accepted.
4. **JWT Auth**: Ensures only authenticated admins can trigger expensive database or AI operations.
5. **NoSQL Sanitizer**: Strips malicious characters (like \`$\` and \`.\`) from JSON bodies to prevent MongoDB injection attacks before data reaches the controller.

\`\`\`mermaid
flowchart TD
    Request([Incoming Request]) --> RateLimit{Rate Limiter}
    RateLimit -- Exceeded --> 429[429 Too Many Requests]
    RateLimit -- Passed --> Helmet[Helmet Headers]
    Helmet --> CORS[CORS Check]
    CORS -- Blocked --> 403[403 Forbidden]
    CORS -- Allowed --> Auth{JWT Middleware}
    
    Auth -- Invalid/Missing --> 401[401 Unauthorized]
    Auth -- Valid --> Sanitizer[NoSQL Sanitizer]
    
    Sanitizer --> Controller[Route Controller]
    Controller --> DB[(Database)]
\`\`\`
`
  },
  {
    name: "11_frontend_routing.md",
    content: `# Frontend Routing Architecture

## Overview
How React Router DOM manages navigation, URLs, and protected boundaries inside the frontend application.

## How it works:
- **Public Routes**: Routes like \`/login\` that anyone can access. Catch-all routes (\`/*\`) automatically redirect unknown paths back to the login page.
- **Protected Routes**: Wrapped by an \`AuthGuard\` component. If a user tries to access \`/dashboard\` without a token, they are bounced back to \`/login\`.
- **Nested Routing**: Once inside the \`DashboardLayout\`, the URL path dictates which sub-component renders in the main view area (e.g., \`/scan\` loads the News Scanner, \`/image\` loads the Image Generator).

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

## Overview
How unexpected crashes and expected API errors are caught, formatted, and displayed to the user safely.

## How it works:
- **Backend Controller**: Tries to execute code. If it catches an error (e.g., Gemini API is down), it passes it to the \`next(error)\` middleware.
- **Error Middleware**: The Express global error handler catches all thrown errors. It hides sensitive stack traces in production, formats the error into a clean JSON object (\`{ error: "Message" }\`), and sends the appropriate HTTP status code.
- **Frontend Axios Catch**: The frontend receives the 4xx or 5xx code, translates the JSON message, and triggers a UI Toast notification (e.g., using Sonner or standard React state) so the user understands what went wrong.

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

## Overview
How Mongoose manages connections to MongoDB Atlas, specifically optimized to prevent connection leaks.

## How it works:
- When the Node.js server starts, it initializes a connection pool to MongoDB Atlas.
- For standard servers (like Render), this connection is kept alive (Connected state).
- If a network drop occurs, Mongoose automatically attempts reconnection.
- If the initial connection fails (e.g., bad IP whitelist or wrong password), the process logs a fatal error and can either gracefully exit or retry, ensuring the server doesn't hang indefinitely in a zombie state.

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

## Overview
Protection mechanisms against API abuse, brute forcing, and excessive billing charges from external APIs.

## How it works:
- **Route Specificity**: Different routes have different rate limits. 
- **Auth Limiter**: The login route has a strict limit (e.g., 10 attempts per 15 minutes) to prevent hackers from guessing passwords (Brute Force).
- **AI Limiter**: The Gemini API routes have a moderate limit (e.g., 8 requests per minute) to ensure a single user doesn't exhaust the Google Cloud API quota.
- If a user exceeds a threshold, Express automatically blocks the IP and returns a \`429 Too Many Requests\` HTTP status until the time window resets.

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

## Overview
Process of taking conversational user prompts and returning strict, syntax-highlighted programming code using Gemini.

## How it works:
1. The developer inputs a request (e.g., "Write a bubble sort function") and selects a target language (e.g., Python).
2. The backend receives this and wraps the user prompt in a strict system instruction (e.g., "You are an expert coder. Return ONLY valid Python code, no conversational text").
3. Gemini processes the prompt and returns a Markdown code block.
4. The backend cleans the response and saves it to the DB.
5. The frontend receives the raw string and uses a library like \`react-syntax-highlighter\` to parse the Markdown into beautiful, colored, readable code on the screen.

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
  console.log('Updated:', diag.name);
});
