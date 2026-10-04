# TechNova System Architecture

## Overview
This diagram illustrates the high-level architecture of the TechNova platform. It maps out how the user interacts with the system, and how the various distributed cloud services communicate with each other.

## How it works:
1. **Client Interaction**: Users interact with the React-based frontend hosted on Vercel's Edge Network, ensuring fast static delivery.
2. **API Requests**: The frontend sends REST API calls to the Express backend hosted on Render.
3. **Data Persistence**: The backend connects to MongoDB Atlas using Mongoose to read and write application state (users, history, logs).
4. **AI Generation**: For heavy lifting (Content, Code, Image generation), the backend securely proxies requests to the Google Gemini API.

```mermaid
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
```
