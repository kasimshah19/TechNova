# Security Layers

## Overview
A detailed view of the backend defense-in-depth security implementation.

## How it works:
1. **Rate Limiting**: Stops DDoS and brute-force attacks immediately at the perimeter.
2. **Helmet headers**: Adds security headers to prevent XSS, clickjacking, and sniffing.
3. **CORS**: Ensures that only requests from the official Vercel frontend URL are accepted.
4. **JWT Auth**: Ensures only authenticated admins can trigger expensive database or AI operations.
5. **NoSQL Sanitizer**: Strips malicious characters (like `$` and `.`) from JSON bodies to prevent MongoDB injection attacks before data reaches the controller.

```mermaid
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
```
