# Frontend Routing Architecture

## Overview
How React Router DOM manages navigation, URLs, and protected boundaries inside the frontend application.

## How it works:
- **Public Routes**: Routes like `/login` that anyone can access. Catch-all routes (`/*`) automatically redirect unknown paths back to the login page.
- **Protected Routes**: Wrapped by an `AuthGuard` component. If a user tries to access `/dashboard` without a token, they are bounced back to `/login`.
- **Nested Routing**: Once inside the `DashboardLayout`, the URL path dictates which sub-component renders in the main view area (e.g., `/scan` loads the News Scanner, `/image` loads the Image Generator).

```mermaid
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
```
