# Fundraising Platform - Complete System Architecture

## High-Level Architecture Overview

```mermaid
flowchart TB
    subgraph ClientLayer["🖥️ PRESENTATION LAYER - React Frontend"]
        DonorPortal["👤 Donor Portal<br/>Browse, Donate, Track"]
        OrganizerPortal["🎯 Organizer Portal<br/>Create, Manage, Withdraw"]
        AdminDashboard["🛡️ Admin Dashboard<br/>Monitor, Approve, Govern"]
    end

    subgraph SecurityLayer["🔐 SECURITY & API GATEWAY LAYER - Express.js"]
        CORS["🔒 CORS Policy"]
        Helmet["🛡️ Helmet Security"]
        RateLimit["⚡ Rate Limiting"]
        JWT["🔑 JWT Auth"]
        RBAC["👮 Role-Based Access Control"]
        Validation["✅ Input Validation"]
    end

    subgraph ApplicationLayer["📡 APPLICATION LAYER - API Routes"]
        AuthRoutes["🔑 Auth Routes<br/>/api/auth/*"]
        CampaignRoutes["🎯 Campaign Routes<br/>/api/campaigns/*"]
        DonationRoutes["💰 Donation Routes<br/>/api/donations/*"]
        PayPalRoutes["💳 PayPal Routes<br/>/api/paypal/*"]
        OrganizerRoutes["📋 Organizer Routes<br/>/api/organizer/*"]
        WithdrawalRoutes["💸 Withdrawal Routes<br/>/api/withdrawals/*"]
        AdminRoutes["👑 Admin Routes<br/>/api/admin/*"]
        NotificationRoutes["🔔 Notification Routes<br/>/api/notifications/*"]
    end

    subgraph ServiceLayer["⚙️ SERVICE LAYER - Business Logic"]
        EmailService["📧 Email Service<br/>Notifications, Receipts"]
        NotificationService["🔔 Notification Service<br/>In-App Events"]
        AdminService["👑 Admin Service<br/>User & Campaign Mgmt"]
        WithdrawalService["💸 Withdrawal Service<br/>Payout Processing"]
        PayPalClient["🏦 PayPal Client<br/>Payment Gateway"]
        CampaignJob["📊 Campaign Job<br/>Expiration Automation"]
        UploadService["📁 Upload Service<br/>File Management"]
        ActivityLogger["📝 Activity Logger<br/>Audit Trail"]
    end

    subgraph DataLayer["🗄️ DATA ACCESS LAYER - MongoDB + Mongoose"]
        UserModel["👤 User<br/>email, role, passwordHash"]
        CampaignModel["🎯 Campaign<br/>title, target, raised"]
        DonationModel["💰 Donation<br/>amount, donor, status"]
        OrganizerAppModel["📋 OrganizerApplication<br/>orgName, documents"]
        WithdrawalModel["💸 WithdrawalRequest<br/>amount, campaign"]
        NotificationModel["🔔 Notification<br/>recipient, eventType"]
        OrganizerProfileModel["📊 OrganizerProfile<br/>bio, socialLinks"]
        OTPModel["🔐 OTP<br/>email, otp, expiresAt"]
        ActivityLogModel["📝 ActivityLog<br/>user, activityType"]
        IdempotencyModel["🔑 IdempotencyKey<br/>key, response"]
    end

    subgraph ExternalLayer["🌐 EXTERNAL SERVICES"]
        PayPalSDK["💳 PayPal SDK<br/>Payment Processing"]
        Cloudinary["☁️ Cloudinary<br/>Image Hosting"]
        AWSS3["📦 AWS S3<br/>Document Storage"]
        Nodemailer["📧 Nodemailer<br/>Email Delivery"]
        MongoDBAtlas["🗄️ MongoDB Atlas<br/>Database"]
    end

    %% Connections
    ClientLayer --> SecurityLayer
    SecurityLayer --> ApplicationLayer
    ApplicationLayer --> ServiceLayer
    ServiceLayer --> DataLayer
    ServiceLayer --> ExternalLayer

    style ClientLayer fill:#667eea,stroke:#333,color:white
    style SecurityLayer fill:#f093fb,stroke:#333,color:white
    style ApplicationLayer fill:#4facfe,stroke:#333,color:white
    style ServiceLayer fill:#43e97b,stroke:#333,color:white
    style DataLayer fill:#fa709a,stroke:#333,color:white
    style ExternalLayer fill:#a8edea,stroke:#333,color:white
```

## Core Data Flows

### 1. User Registration & Authentication Flow

```mermaid
sequenceDiagram
    participant U as User (Frontend)
    participant A as API Routes
    participant M as Middleware
    participant S as Services
    participant D as Database
    participant E as Email Service

    U->>A: POST /api/auth/register
    A->>M: Validate Input
    M->>D: Check if email exists
    D-->>M: User not found
    M->>S: Generate OTP
    S->>D: Store OTP
    S->>E: Send verification email
    E-->>U: OTP sent
    U->>A: POST /api/auth/verify-otp
    A->>D: Verify OTP
    D-->>A: Valid OTP
    A->>S: Hash password
    S->>D: Create User
    D-->>A: User created
    A->>S: Generate JWT token
    S-->>U: Return token + role
```

### 2. Donation Processing Flow

```mermaid
sequenceDiagram
    participant D as Donor
    participant F as Frontend
    participant P as PayPal Routes
    participant PP as PayPal SDK
    participant DR as Donation Routes
    participant DS as Donation Service
    participant DB as Database
    participant C as Campaign Model
    participant EM as Email Service

    D->>F: Select donation amount
    F->>P: Create PayPal order
    P->>PP: Create order via PayPal API
    PP-->>P: Return order ID
    P-->>F: Order ID
    F->>D: Redirect to PayPal
    D->>PP: Authorize payment
    PP-->>F: Payment approved
    F->>DR: Capture payment with order ID
    DR->>PP: Capture order
    PP-->>DR: Payment captured
    DR->>DS: Create donation record
    DS->>DB: Save donation
    DB-->>DS: Donation saved
    DS->>C: Update campaign.raised
    C-->>DS: Campaign updated
    DS->>EM: Send receipt email
    EM-->>D: Donation receipt
```

### 3. Withdrawal Request & Approval Flow

```mermaid
sequenceDiagram
    participant O as Organizer
    participant F as Frontend
    participant WR as Withdrawal Routes
    participant WS as Withdrawal Service
    participant DB as Database
    participant AR as Admin Routes
    participant AS as Admin Service
    participant A as Admin
    participant PP as PayPal Client
    participant NS as Notification Service
    participant DON as Donors

    O->>F: Submit withdrawal request
    F->>WR: POST /withdrawal-requests
    WR->>WS: Validate request
    WS->>DB: Check campaign balance
    DB-->>WS: Balance available
    WS->>DB: Create withdrawal request
    DB-->>WS: Request created
    WR-->>O: Request submitted
    
    AR->>DB: GET pending withdrawals
    DB-->>AR: Return requests
    A->>AR: Review & approve
    AR->>AS: Process approval
    AS->>WS: Execute payout
    WS->>PP: Transfer funds via PayPal
    PP-->>WS: Transfer completed
    WS->>DB: Update withdrawal status
    DB-->>WS: Status updated
    WS->>NS: Notify donors
    NS->>DON: Send transparency update
    NS->>O: Send approval notification
```

### 4. Campaign Creation & Management Flow

```mermaid
flowchart LR
    A[Organizer Applies] --> B[Admin Approval]
    B --> C[Organizer Status Granted]
    C --> D[Create Campaign]
    D --> E[Upload Images]
    E --> F[Publish Campaign]
    F --> G[Accept Donations]
    G --> H[Track Progress]
    H --> I{Deadline Reached?}
    I -->|Yes| J[Disable Donations]
    I -->|No| G
    J --> K[Request Withdrawal]
    K --> L[Admin Review]
    L --> M[Payout to Organizer]
```

## Technology Stack Architecture

```mermaid
graph TD
    subgraph Frontend["🎨 FRONTEND STACK"]
        React["React 18<br/>UI Framework"]
        Vite["Vite<br/>Build Tool"]
        TanStack["TanStack Query<br/>Data Fetching"]
        Router["React Router<br/>Navigation"]
        Tailwind["Tailwind CSS<br/>Styling"]
        Lucide["Lucide Icons<br/>Icon Library"]
    end

    subgraph Backend["⚙️ BACKEND STACK"]
        Node["Node.js<br/>Runtime"]
        Express["Express.js<br/>Web Framework"]
        Mongoose["Mongoose<br/>ODM"]
        JWT["jsonwebtoken<br/>Authentication"]
        Bcrypt["bcryptjs<br/>Password Hashing"]
        Helmet["Helmet<br/>Security Headers"]
    end

    subgraph Database["🗄️ DATABASE"]
        MongoDB["MongoDB<br/>NoSQL Database"]
        Atlas["MongoDB Atlas<br/>Cloud Hosting"]
        Indexes["Database Indexes<br/>Performance Optimization"]
    end

    subgraph Payments["💳 PAYMENT INFRASTRUCTURE"]
        PayPal["PayPal SDK<br/>Primary Gateway"]
        Stripe["Stripe<br/>Alternative Gateway"]
        Sandbox["Sandbox Environment<br/>Testing"]
    end

    subgraph Storage["📦 STORAGE SOLUTIONS"]
        Cloudinary["Cloudinary<br/>Image Storage"]
        S3["AWS S3<br/>Document Storage"]
        Local["Local Upload<br/>Development"]
    end

    subgraph Communication["📧 COMMUNICATION"]
        Nodemailer["Nodemailer<br/>Email Transport"]
        Gmail["Gmail SMTP<br/>Email Service"]
    end

    Frontend --> Backend
    Backend --> Database
    Backend --> Payments
    Backend --> Storage
    Backend --> Communication
```

## Security Architecture

```mermaid
flowchart TB
    subgraph AuthN["🔐 AUTHENTICATION"]
        JWT_Token["JWT Token<br/>Stateless Auth"]
        BCrypt["bcrypt Hash<br/>Password Security"]
        OTP["OTP Verification<br/>Email Validation"]
        Session["Session Management<br/>Token Storage"]
    end

    subgraph AuthZ["👮 AUTHORIZATION"]
        RBAC["Role-Based Access Control<br/>donor/organizer/admin"]
        Middleware["Auth Middleware<br/>Route Protection"]
        Permissions["Permission Checks<br/>Resource Access"]
    end

    subgraph DataProtection["🔒 DATA PROTECTION"]
        Encryption["AES Encryption<br/>Sensitive Data"]
        HTTPS["HTTPS/TLS<br/>Secure Transport"]
        Sanitization["Input Sanitization<br/>XSS Prevention"]
    end

    subgraph APISecurity["🛡️ API SECURITY"]
        RateLimiting["Rate Limiting<br/>DDoS Protection"]
        CORS["CORS Policy<br/>Origin Control"]
        CSP["Content Security Policy<br/>Resource Loading"]
        Idempotency["Idempotency Keys<br/>Duplicate Prevention"]
    end

    subgraph Monitoring["📊 MONITORING"]
        AuditLog["Activity Logging<br/>User Actions"]
        SecurityEvents["Security Event Tracking<br/>Threat Detection"]
        ErrorHandling["Error Handling<br/>Safe Failures"]
    end

    AuthN --> AuthZ
    AuthZ --> DataProtection
    DataProtection --> APISecurity
    APISecurity --> Monitoring
```

## Database Schema Relationships

```mermaid
erDiagram
    USER ||--o{ CAMPAIGN : creates
    USER ||--o{ DONATION : makes
    USER ||--o{ WITHDRAWAL_REQUEST : submits
    USER ||--o{ NOTIFICATION : receives
    USER ||--o{ ORGANIZER_APPLICATION : applies
    USER ||--o| ORGANIZER_PROFILE : has
    
    CAMPAIGN ||--o{ DONATION : receives
    CAMPAIGN ||--o{ WITHDRAWAL_REQUEST : generates
    
    DONATION }o--|| USER : made_by
    DONATION }o--|| CAMPAIGN : supports
    
    WITHDRAWAL_REQUEST }o--|| CAMPAIGN : for_campaign
    WITHDRAWAL_REQUEST }o--|| USER : requested_by
    
    ORGANIZER_APPLICATION }o--|| USER : applicant
    ORGANIZER_PROFILE }o--|| USER : profile_of
    
    ACTIVITY_LOG }o--|| USER : performed_by
    
    USER {
        string email PK
        string passwordHash
        string role "donor|organizer|admin"
        boolean isOrganizerApproved
        string name
        string resetToken
        datetime resetTokenExpiry
        timestamps
    }
    
    CAMPAIGN {
        string title
        string description
        string imageURL
        number target
        number raised
        string status "active|expired|inactive"
        datetime deadlineAt
        ObjectId owner FK
        timestamps
    }
    
    DONATION {
        ObjectId campaign FK
        ObjectId donor FK
        string donorEmail
        boolean isAnonymous
        number amount
        string method "paypal"
        string paypalOrderId
        string transactionId
        string status "COMPLETED|PENDING|FAILED"
        timestamps
    }
    
    WITHDRAWAL_REQUEST {
        ObjectId campaign FK
        ObjectId organizer FK
        number amount
        string status "pending|approved|rejected|completed"
        array documents
        string transactionReference
        string reviewNotes
        timestamps
    }
    
    ORGANIZER_APPLICATION {
        ObjectId user FK
        string organizationName
        string organizationType
        string registrationNumber
        array documents
        string status "pending|approved|rejected"
        datetime reviewedAt
        timestamps
    }
    
    NOTIFICATION {
        ObjectId recipient FK
        string eventType
        string title
        string message
        json payload
        boolean isRead
        timestamps
    }
```

## Deployment Architecture

```mermaid
flowchart TB
    subgraph CDN["🌍 CONTENT DELIVERY"]
        Cloudflare["Cloudflare CDN<br/>Static Assets"]
        CloudinaryCDN["Cloudinary CDN<br/>Media Files"]
    end

    subgraph FrontendHosting["🎨 FRONTEND HOSTING"]
        Vercel["Vercel/Netlify<br/>React App"]
        SSL["SSL/TLS<br/>HTTPS"]
    end

    subgraph BackendHosting["⚙️ BACKEND HOSTING"]
        Heroku["Heroku/Railway<br/>Node.js Server"]
        LoadBalancer["Load Balancer<br/>Traffic Distribution"]
        PM2["PM2<br/>Process Manager"]
    end

    subgraph DataServices["🗄️ DATA SERVICES"]
        MongoDBAtlas["MongoDB Atlas<br/>Primary Database"]
        Backup["Automated Backups<br/>Data Recovery"]
    end

    subgraph ThirdParty["🌐 THIRD-PARTY SERVICES"]
        PayPalAPI["PayPal API<br/>Production"]
        EmailProvider["Email Provider<br/>SMTP Service"]
        AWSServices["AWS Services<br/>S3 Storage"]
    end

    User["👤 User"] --> CDN
    CDN --> FrontendHosting
    FrontendHosting --> BackendHosting
    BackendHosting --> DataServices
    BackendHosting --> ThirdParty
```

## Key Features by Layer

### Presentation Layer Features
- **Multi-Role Dashboards**: Custom UIs for Donors, Organizers, and Admins
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Real-time Updates**: React Query for data synchronization
- **Role Switching**: Seamless context switching between roles
- **Notification Center**: In-app notification management

### Application Layer Features
- **RESTful API**: Standardized HTTP methods and status codes
- **Version Control**: API versioning support
- **Pagination**: Efficient data loading with cursor-based pagination
- **Filtering & Sorting**: Advanced query capabilities
- **Error Handling**: Consistent error response format

### Service Layer Features
- **Email Automation**: Transactional emails for all critical actions
- **Scheduled Jobs**: Campaign expiration automation
- **Payment Orchestration**: Multi-step payment workflows
- **Transparency Engine**: Donor visibility into fund usage
- **Audit Trail**: Comprehensive activity logging

### Data Layer Features
- **Schema Validation**: Mongoose schema enforcement
- **Indexing Strategy**: Performance-optimized queries
- **Data Integrity**: Referential integrity with MongoDB refs
- **Soft Deletes**: Archive instead of hard delete
- **Timestamps**: Automatic createdAt/updatedAt tracking

## Scalability Considerations

1. **Horizontal Scaling**: Stateless API servers behind load balancer
2. **Database Scaling**: MongoDB replica sets with read replicas
3. **Caching Strategy**: Redis for session and query caching
4. **CDN Integration**: Static assets served from edge locations
5. **Microservices Ready**: Modular architecture for future service extraction
6. **Queue System**: Message queues for async processing (future enhancement)
7. **API Rate Limiting**: Per-user and per-IP rate limiting
8. **Database Sharding**: Potential for horizontal data partitioning

---

**Architecture Documentation Version**: 1.0  
**Last Updated**: 2026  
**Technology Stack**: MERN (MongoDB, Express.js, React, Node.js) + PayPal Integration
