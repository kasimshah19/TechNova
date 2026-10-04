# Frontend Routing Architecture

How React Router manages navigation and protected routes.

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
