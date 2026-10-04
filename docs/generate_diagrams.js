const fs = require('fs');
const path = require('path');

const diagrams = [
  {
    name: "01_system_architecture.md",
    content: `# TechNova System Architecture

This diagram illustrates the high-level architecture of the TechNova platform, showing how the frontend, backend, database, and external APIs interact.

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

This diagram shows the MongoDB document collections and their relationships.

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

Detailed flow of how JWT authentication is handled between the client and server.

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

Process of generating platform-specific content using Gemini API.

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

Infrastructure setup for TechNova across multiple cloud providers.

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

Overview of how the Zustand stores are organized on the client.

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

How Express handles and routes incoming HTTP requests.

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

Using the Gemini Image Model for prompt-to-image capabilities.

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

Tree structure of the React Frontend application.

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

Overview of backend security implementation.

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
  }
];

diagrams.forEach(diag => {
  fs.writeFileSync(path.join(__dirname, 'diagrams', diag.name), diag.content);
  console.log('Created:', diag.name);
});
