# Fundraising Platform - Payment Flow & User Roles Architecture

## 1. Complete Payment Processing Flow Diagram

```mermaid
flowchart TB
    Start([💳 Payment Initiation]) --> Donor[👤 Donor]
    
    Donor --> SelectAmount[Select Donation Amount]
    SelectAmount --> Anonymous{Anonymous<br/>Donation?}
    Anonymous -->|Yes| HideInfo[Hide Donor Identity]
    Anonymous -->|No| ShowInfo[Show Donor Details]
    
    HideInfo --> PaymentMethod
    ShowInfo --> PaymentMethod
    
    PaymentMethod{Choose Payment<br/>Gateway}
    
    PaymentMethod -->|PayPal| PayPalFlow[PayPal Integration]
    PaymentMethod -->|eSewa| eSewaFlow[eSewa Integration]
    PaymentMethod -->|Khalti| KhaltiFlow[Khalti Integration]
    PaymentMethod -->|Crypto| CryptoFlow[Cryptocurrency]
    
    subgraph PayPal["💳 PayPal Flow"]
        PayPalFlow --> PP_Create[Create PayPal Order]
        PP_Create --> PP_Authorize[User Authorizes Payment]
        PP_Authorize --> PP_Capture[Capture Payment]
        PP_Capture --> PP_Success{Success?}
        PP_Success -->|Yes| PP_Complete[Payment Completed]
        PP_Success -->|No| PP_Fail[Payment Failed]
    end
    
    subgraph eSewa["📱 eSewa Flow"]
        eSewaFlow --> ES_Login[eSewa Login/Redirect]
        ES_Login --> ES_Pay[Initiate Payment]
        ES_Pay --> ES_Verify[Verify Transaction]
        ES_Verify --> ES_Success{Success?}
        ES_Success -->|Yes| ES_Complete[Payment Completed]
        ES_Success -->|No| ES_Fail[Payment Failed]
    end
    
    subgraph Khalti["📲 Khalti Flow"]
        KhaltiFlow --> KH_Initiate[Initialize Khalti Payment]
        KH_Initiate --> KH_Mobile[Enter Mobile Number]
        KH_Mobile --> KH_PIN[Enter Khalti PIN]
        KH_PIN --> KH_Confirm[Confirm Payment]
        KH_Confirm --> KH_Success{Success?}
        KH_Success -->|Yes| KH_Complete[Payment Completed]
        KH_Success -->|No| KH_Fail[Payment Failed]
    end
    
    subgraph Crypto["₿ Cryptocurrency Flow"]
        CryptoFlow --> CR_Generate[Generate Wallet Address]
        CR_Generate --> QR[Display QR Code]
        QR --> CR_Wait[Wait for Transfer]
        CR_Wait --> CR_Verify[Verify Blockchain Transaction]
        CR_Verify --> CR_Confirm{Confirmations<br/>≥ 3?}
        CR_Confirm -->|Yes| CR_Complete[Payment Completed]
        CR_Confirm -->|No| CR_Pending[Pending Confirmation]
    end
    
    PP_Complete --> ProcessDonation
    PP_Fail --> PaymentError
    ES_Complete --> ProcessDonation
    ES_Fail --> PaymentError
    KH_Complete --> ProcessDonation
    KH_Fail --> PaymentError
    CR_Complete --> ProcessDonation
    CR_Pending --> CR_Wait
    CR_Fail --> PaymentError
    
    ProcessDonation[Process Donation Record]
    ProcessDonation --> CreateRecord[Create Donation in DB]
    CreateRecord --> UpdateCampaign[Update Campaign Raised Amount]
    UpdateCampaign --> SendReceipt[Send Email Receipt]
    SendReceipt --> NotifyOrganizer[Notify Campaign Organizer]
    NotifyOrganizer --> LogActivity[Log Activity]
    LogActivity --> SuccessEnd([✅ Payment Successful])
    
    PaymentError[Handle Payment Failure]
    PaymentError --> LogError[Log Error Details]
    LogError --> NotifyUser[Notify User of Failure]
    NotifyUser --> RetryOption{Retry?}
    RetryOption -->|Yes| PaymentMethod
    RetryOption -->|No| ErrorEnd([❌ Payment Failed])
    
    style Start fill:#667eea,color:white
    style SuccessEnd fill:#10b981,color:white
    style ErrorEnd fill:#ef4444,color:white
    style PayPal fill:#0070ba,color:white
    style eSewa fill:#5c2d91,color:white
    style Khalti fill:#5f259f,color:white
    style Crypto fill:#f7931a,color:white
```

## 2. Multi-Payment Gateway Comparison Flow

```mermaid
flowchart LR
    Gateway{Payment<br/>Gateway}
    
    Gateway --> PayPal[💳 PayPal]
    Gateway --> eSewa[📱 eSewa]
    Gateway --> Khalti[📲 Khalti]
    Gateway --> Crypto[₿ Cryptocurrency]
    
    PayPal --> PP_Features[Features:<br/>- International<br/>- Buyer Protection<br/>- Instant Transfer]
    eSewa --> ES_Features[Features:<br/>- Nepal Local<br/>- Mobile Wallet<br/>- QR Payments]
    Khalti --> KH_Features[Features:<br/>- Digital Wallet<br/>- Mobile Banking<br/>- Instant Payment]
    Crypto --> CR_Features[Features:<br/>- Decentralized<br/>- Global Access<br/>- Blockchain Verified]
    
    PP_Features --> PP_Process[Processing Fee: 3.9% + $0.30]
    ES_Features --> ES_Process[Processing Fee: 1.5%]
    KH_Features --> KH_Process[Processing Fee: 2.0%]
    CR_Features --> CR_Process[Processing Fee: Network Gas Fee]
    
    PP_Process --> PP_Settle[Settlement: 2-3 days]
    ES_Process --> ES_Settle[Settlement: Instant]
    KH_Process --> KH_Settle[Settlement: Instant]
    CR_Process --> CR_Settle[Settlement: 10-60 min]
    
    PP_Settle --> Bank[Bank Account / Wallet]
    ES_Settle --> Bank
    KH_Settle --> Bank
    CR_Settle --> Bank
    
    style PayPal fill:#0070ba,color:white
    style eSewa fill:#5c2d91,color:white
    style Khalti fill:#5f259f,color:white
    style Crypto fill:#f7931a,color:white
```

## 3. Detailed Payment Sequence Diagram

```mermaid
sequenceDiagram
    participant D as Donor
    participant FE as Frontend (React)
    participant BE as Backend API
    participant PG as Payment Gateway
    participant DB as Database
    participant ES as Email Service
    participant O as Organizer
    
    D->>FE: Select Amount & Gateway
    FE->>BE: POST /api/donations/create
    BE->>PG: Initialize Payment Session
    
    alt PayPal
        BE->>PG: Create Order (PayPal)
        PG-->>FE: Return Order ID
        FE->>D: Redirect to PayPal
        D->>PG: Login & Authorize
        PG-->>FE: Payment Approved
        FE->>BE: Capture Payment with Order ID
        BE->>PG: Capture Order
        PG-->>BE: Payment Captured
    else eSewa
        BE->>PG: Generate eSewa Form
        PG-->>FE: Return Payment Form
        FE->>D: Redirect to eSewa
        D->>PG: Enter Credentials & Pay
        PG-->>BE: Callback with Status
        BE->>PG: Verify Transaction
        PG-->>BE: Verification Success
    else Khalti
        BE->>PG: Initiate Khalti Payment
        PG-->>FE: Return Payment Widget
        FE->>D: Show Khalti Popup
        D->>PG: Enter Mobile & PIN
        PG-->>BE: Payment Callback
        BE->>PG: Verify Payment ID
        PG-->>BE: Payment Verified
    else Crypto
        BE->>PG: Generate Wallet Address
        PG-->>FE: Display QR Code
        FE->>D: Show Payment Address
        D->>PG: Send Crypto from Wallet
        PG-->>PG: Wait for Confirmations
        PG-->>BE: Confirm Transaction (3+ blocks)
    end
    
    BE->>DB: Create Donation Record
    DB-->>BE: Donation Saved
    BE->>DB: Update Campaign.raised
    DB-->>BE: Campaign Updated
    BE->>ES: Send Receipt Email
    ES-->>D: Donation Receipt
    BE->>DB: Create Notification
    DB-->>O: Organizer Notified
    BE-->>FE: Payment Success Response
    FE->>D: Show Success Page
```

## 4. 3-Tier User Role Architecture

```mermaid
flowchart TB
    subgraph Tier1["👤 TIER 1: DONOR (Contributor)"]
        D_Permissions[Permissions:<br/>- Browse Campaigns<br/>- Make Donations<br/>- View Donation History<br/>- Download Receipts<br/>- Track Fund Usage<br/>- Remain Anonymous]
        D_Restrictions[Restrictions:<br/>- Cannot Create Campaigns<br/>- Cannot Withdraw Funds<br/>- Limited Dashboard Access]
        D_Apply[Can Apply to Become<br/>Organizer]
    end
    
    subgraph Tier2["🎯 TIER 2: ORGANIZER (Campaign Creator)"]
        O_Requirements[Requirements:<br/>- Must be Donor first<br/>- Submit Application<br/>- Provide Documents<br/>- Admin Approval Required]
        O_Permissions[Permissions:<br/>- Create Campaigns<br/>- Manage Campaign Settings<br/>- Request Withdrawals<br/>- View Donor List<br/>- Send Updates<br/>- Access Analytics]
        O_Restrictions[Restrictions:<br/>- Cannot Approve Own Withdrawals<br/>- Cannot Access Admin Panel<br/>- Subject to Admin Oversight]
    end
    
    subgraph Tier3["🛡️ TIER 3: ADMIN (System Administrator)"]
        A_Requirements[Requirements:<br/>- System Assigned Role<br/>- Highest Privilege Level<br/>- Full System Access]
        A_Permissions[Permissions:<br/>- Manage All Users<br/>- Approve/Reject Applications<br/>- Approve Withdrawals<br/>- Monitor All Campaigns<br/>- View System Analytics<br/>- Suspend Accounts<br/>- Override Settings]
        A_Restrictions[Restrictions:<br/>- Cannot Create Personal Campaigns<br/>- Subject to Audit Logs<br/>- Ethical Governance Required]
    end
    
    Tier1 -->|Apply for Organizer Status| Tier2
    Tier2 -->|Admin Approval Required| Tier3
    Tier3 -->|Grant Organizer Rights| Tier2
    Tier2 -->|Downgrade/Suspend| Tier1
    
    D_Permissions --- D_Restrictions
    O_Requirements --- O_Permissions
    O_Permissions --- O_Restrictions
    A_Requirements --- A_Permissions
    A_Permissions --- A_Restrictions
    
    style Tier1 fill:#3b82f6,color:white
    style Tier2 fill:#10b981,color:white
    style Tier3 fill:#ef4444,color:white
```

## 5. Role-Based Access Control (RBAC) Matrix

```mermaid
flowchart LR
    subgraph Resources["System Resources"]
        R1[Campaigns]
        R2[Donations]
        R3[Users]
        R4[Withdrawals]
        R5[Analytics]
        R6[System Settings]
    end
    
    subgraph Roles["User Roles"]
        Donor["👤 Donor"]
        Organizer["🎯 Organizer"]
        Admin["🛡️ Admin"]
    end
    
    Donor -->|READ| R1
    Donor -->|CREATE| R2
    Donor -->|READ| R2[self]
    
    Organizer -->|READ/WRITE| R1[self]
    Organizer -->|CREATE| R2
    Organizer -->|READ| R2[campaign]
    Organizer -->|CREATE| R4
    Organizer -->|READ| R5[basic]
    
    Admin -->|FULL ACCESS| R1
    Admin -->|FULL ACCESS| R2
    Admin -->|FULL ACCESS| R3
    Admin -->|FULL ACCESS| R4
    Admin -->|FULL ACCESS| R5
    Admin -->|FULL ACCESS| R6
    
    style Donor fill:#3b82f6,color:white
    style Organizer fill:#10b981,color:white
    style Admin fill:#ef4444,color:white
```

## 6. User Role Transition State Machine

```mermaid
stateDiagram-v2
    [*] --> Visitor: Browse Site
    
    Visitor --> RegisteredDonor: Register Account
    RegisteredDonor --> ActiveDonor: Make First Donation
    ActiveDonor --> RepeatDonor: Multiple Donations
    
    RegisteredDonor --> Applicant: Apply for Organizer
    Applicant --> PendingApproval: Application Submitted
    PendingApproval --> Rejected: Admin Rejects
    PendingApproval --> ApprovedOrganizer: Admin Approves
    Rejected --> Applicant: Reapply
    
    ApprovedOrganizer --> CampaignCreator: Create Campaign
    CampaignCreator --> Fundraiser: Receive Donations
    Fundraiser --> WithdrawalRequester: Request Payout
    
    ApprovedOrganizer --> Suspended: Violation Detected
    Suspended --> [*]: Account Terminated
    
    ActiveDonor --> VIPDonor: Large/Repeat Donations
    VIPDonor --> AnonymousDonor: Choose Anonymity
    
    note right of RegisteredDonor
        Tier 1: Donor
        - Browse campaigns
        - Make donations
        - View history
    end note
    
    note right of ApprovedOrganizer
        Tier 2: Organizer
        - Create campaigns
        - Manage funds
        - Request withdrawals
    end note
    
    note right of Admin
        Tier 3: Admin
        - Full system control
        - Approve requests
        - Monitor all activity
    end note
    
    state Admin <<choice>>
    RegisteredDonor --> Admin: Special Assignment
```

## 7. Complete System Architecture with Payment Gateways

```mermaid
flowchart TB
    subgraph ClientLayer["🖥️ PRESENTATION LAYER"]
        DonorUI["👤 Donor Portal"]
        OrganizerUI["🎯 Organizer Portal"]
        AdminUI["🛡️ Admin Dashboard"]
    end
    
    subgraph SecurityLayer["🔐 SECURITY LAYER"]
        JWT[JWT Authentication]
        RBAC[Role-Based Access Control]
        RateLimit[Rate Limiting]
        Encryption[Data Encryption]
    end
    
    subgraph PaymentLayer["💳 PAYMENT GATEWAY LAYER"]
        PayPal["💳 PayPal<br/>International Cards"]
        eSewa["📱 eSewa<br/>Nepal Digital Wallet"]
        Khalti["📲 Khalti<br/>Mobile Banking"]
        Crypto["₿ Blockchain<br/>Cryptocurrency"]
    end
    
    subgraph ApplicationLayer["⚙️ APPLICATION LAYER"]
        AuthService[Authentication Service]
        CampaignService[Campaign Service]
        DonationService[Donation Service]
        WithdrawalService[Withdrawal Service]
        NotificationService[Notification Service]
    end
    
    subgraph DataLayer["🗄️ DATA LAYER"]
        UserDB[(User Collection)]
        CampaignDB[(Campaign Collection)]
        DonationDB[(Donation Collection)]
        WithdrawalDB[(Withdrawal Collection)]
        NotificationDB[(Notification Collection)]
    end
    
    ClientLayer --> SecurityLayer
    SecurityLayer --> PaymentLayer
    PaymentLayer --> ApplicationLayer
    ApplicationLayer --> DataLayer
    
    DonorUI --> PayPal
    DonorUI --> eSewa
    DonorUI --> Khalti
    DonorUI --> Crypto
    
    OrganizerUI --> WithdrawalService
    AdminUI --> AllServices[All Services]
    
    style PayPal fill:#0070ba,color:white
    style eSewa fill:#5c2d91,color:white
    style Khalti fill:#5f259f,color:white
    style Crypto fill:#f7931a,color:white
```

## 8. Fund Flow from Donor to Organizer

```mermaid
flowchart LR
    Donor["👤 Donor"] --> PaymentGateway["💳 Payment Gateway<br/>PayPal/eSewa/Khalti/Crypto"]
    
    PaymentGateway --> PlatformAccount["🏦 Platform Account<br/>Escrow Holding"]
    
    PlatformAccount --> WithdrawalRequest["📋 Withdrawal Request<br/>Organizer Initiates"]
    
    WithdrawalRequest --> AdminReview["🛡️ Admin Review<br/>Verification & Approval"]
    
    AdminReview --> Approved{Approved?}
    
    Approved -->|Yes| PlatformFee["💰 Platform Fee Deduction<br/>2-5% Processing Fee"]
    Approved -->|No| ReturnFunds["Return to Campaign"]
    
    PlatformFee --> OrganizerWallet["🎯 Organizer Wallet<br/>Net Amount"]
    
    OrganizerWallet --> BankTransfer["🏦 Bank Transfer<br/>eSewa/Khalti/PayPal"]
    
    BankTransfer --> OrganizerBank["Organizer's Bank Account"]
    
    Donor -.->|Track| TransparencyReport["📊 Transparency Report<br/>Donor Visibility"]
    
    AdminReview -.-> AuditTrail["📝 Audit Trail<br/>Blockchain/Database"]
    
    style Donor fill:#3b82f6,color:white
    style PaymentGateway fill:#10b981,color:white
    style PlatformAccount fill:#f59e0b,color:white
    style AdminReview fill:#ef4444,color:white
    style OrganizerWallet fill:#8b5cf6,color:white
    style OrganizerBank fill:#06b6d4,color:white
```

## 9. Blockchain Crypto Payment Verification Flow

```mermaid
flowchart TB
    Start([₿ Crypto Payment Initiated]) --> GenerateAddr[Generate Unique Wallet Address]
    GenerateAddr --> DisplayQR[Display QR Code to Donor]
    DisplayQR --> DonorSend[Donor Sends Cryptocurrency]
    DonorSend --> Broadcast[Broadcast to Blockchain Network]
    
    Broadcast --> Mempool[Transaction in Mempool]
    Mempool --> Mining[Miners Validate Transaction]
    Mining --> Block1[Added to Block #1<br/>1 Confirmation]
    
    Block1 --> Block2[Block #2 Mined<br/>2 Confirmations]
    Block2 --> Block3[Block #3 Mined<br/>3 Confirmations ✅]
    
    Block3 --> Verify{Verify on<br/>Blockchain Explorer}
    Verify -->|Confirmed| PlatformWallet[Transfer to Platform Wallet]
    Verify -->|Invalid| Refund[Return to Donor]
    
    PlatformWallet --> SmartContract[Smart Contract Execution]
    SmartContract --> AutoSplit[Automatic Fund Splitting]
    AutoSplit --> PlatformFee[Platform Fee: 2%]
    AutoSplit --> CampaignWallet[Campaign Wallet: 98%]
    
    CampaignWallet --> RecordDonation[Record Donation in DB]
    RecordDonation --> NFT[NFT Receipt Minting]
    NFT --> DonorWallet[Send NFT to Donor Wallet]
    DonorWallet --> Success([✅ Crypto Donation Complete])
    
    style Start fill:#f7931a,color:white
    style Success fill:#10b981,color:white
    style Refund fill:#ef4444,color:white
    style SmartContract fill:#8b5cf6,color:white
```

---

**Diagram Version**: 1.0  
**Created**: 2026  
**Payment Gateways**: PayPal, eSewa, Khalti, Cryptocurrency  
**Architecture Type**: 3-Tier Role-Based Access Control
