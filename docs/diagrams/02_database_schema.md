# Database Schema (ERD)

## Overview
This Entity-Relationship Diagram (ERD) shows the MongoDB document collections and their relationships. Since MongoDB is NoSQL, these relationships are maintained via `ObjectId` references.

## How it works:
- **USER Collection**: The central entity containing authentication data (hashed passwords) and roles.
- **Relational Data**: Every action performed on the platform (SCAN, CONTENT, IMAGE, CODE) is tied to the `user_id`.
- **History Tracking**: By linking generations to the user, the platform can fetch and display a comprehensive history dashboard for the admin.

```mermaid
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
```
