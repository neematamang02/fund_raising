# Simplified Architecture Diagrams for A1 Poster

## Option A: Minimal 3-Layer Architecture (RECOMMENDED FOR POSTER)

```mermaid
flowchart TB
    subgraph Layer1["🖥️ PRESENTATION LAYER"]
        Donor["👤 Donor<br/>Browse & Donate"]
        Organizer["🎯 Organizer<br/>Create & Manage"]
        Admin["🛡️ Admin<br/>Monitor & Approve"]
    end
    
    subgraph Layer2["⚙️ APPLICATION LAYER"]
        Auth["🔐 Authentication<br/>JWT + RBAC"]
        Payment["💳 Payment Gateway<br/>PayPal/eSewa/Khalti/Crypto"]
        Business["⚙️ Business Logic<br/>Campaigns, Donations, Withdrawals"]
    end
    
    subgraph Layer3["🗄️ DATA LAYER"]
        MongoDB[(MongoDB<br/>Database)]
        Cloud["☁️ External Services<br/>Cloudinary, AWS S3, Email"]
    end
    
    Layer1 --> Layer2
    Layer2 --> Layer3
    
    style Layer1 fill:#667eea,color:white
    style Layer2 fill:#4facfe,color:white
    style Layer3 fill:#43e97b,color:white
```

---

## Option B: Focused Payment Flow Only

```mermaid
flowchart LR
    Donor["👤 Donor"] --> Select[Select Amount]
    Select --> Gateway{Choose<br/>Gateway}
    
    Gateway --> PayPal["💳 PayPal"]
    Gateway --> eSewa["📱 eSewa"]
    Gateway --> Khalti["📲 Khalti"]
    Gateway --> Crypto["₿ Crypto"]
    
    PayPal --> Process[Process Payment]
    eSewa --> Process
    Khalti --> Process
    Crypto --> Process
    
    Process --> DB[("Database<br/>Update Campaign")]
    DB --> Receipt[Send Receipt]
    Receipt --> Organizer["🎯 Organizer Notified"]
    
    style Donor fill:#3b82f6,color:white
    style PayPal fill:#0070ba,color:white
    style eSewa fill:#5c2d91,color:white
    style Khalti fill:#5f259f,color:white
    style Crypto fill:#f7931a,color:white
    style Organizer fill:#10b981,color:white
```

---

## Option C: 3-Tier Role Architecture Only

```mermaid
flowchart TB
    Donor["👤 DONOR (Tier 1)<br/>• Browse Campaigns<br/>• Make Donations<br/>• View History"]
    
    Organizer["🎯 ORGANIZER (Tier 2)<br/>• Create Campaigns<br/>• Request Withdrawals<br/>• Manage Funds"]
    
    Admin["🛡️ ADMIN (Tier 3)<br/>• Approve Requests<br/>• Monitor System<br/>• Full Access"]
    
    Donor -->|Apply| Organizer
    Organizer -->|Approve| Admin
    Admin -->|Govern| Organizer
    
    style Donor fill:#3b82f6,color:white
    style Organizer fill:#10b981,color:white
    style Admin fill:#ef4444,color:white
```

---

## Option D: Side-by-Side Mini Diagrams (BEST FOR POSTERS)

### Left Side: User Roles | Right Side: Payment Flow

```mermaid
flowchart LR
    subgraph Roles["User Roles"]
        D["👤 Donor"]
        O["🎯 Organizer"]
        A["🛡️ Admin"]
    end
    
    subgraph Payments["Payment Flow"]
        User["User"] --> PG["Payment Gateway"]
        PG --> DB[("Database")]
    end
    
    Roles --> Payments
    
    style D fill:#3b82f6,color:white
    style O fill:#10b981,color:white
    style A fill:#ef4444,color:white
    style PG fill:#f59e0b,color:white
```

---

## Option E: Single Comprehensive but Compact Diagram

```mermaid
flowchart TB
    Users["👥 Users<br/>Donor | Organizer | Admin"]
    
    Auth["🔐 Auth Layer<br/>JWT + Role Control"]
    
    subgraph Payments["💳 Payment Integration"]
        PP["PayPal"]
        ES["eSewa"]
        KH["Khalti"]
        CR["Crypto"]
    end
    
    Core["⚙️ Core System<br/>Campaigns • Donations • Withdrawals"]
    
    Data[("🗄️ MongoDB<br/>+ External Services")]
    
    Users --> Auth
    Auth --> Payments
    Payments --> Core
    Core --> Data
    
    style Users fill:#667eea,color:white
    style Auth fill:#f093fb,color:white
    style Payments fill:#4facfe,color:white
    style Core fill:#43e97b,color:white
    style Data fill:#fa709a,color:white
```

---

## 💡 Poster Layout Recommendations:

### **Layout 1: Two-Column Approach**
```\n┌─────────────────┬─────────────────┐\n│   LEFT COLUMN   │  RIGHT COLUMN   │\n│                 │                 │\n│ 3-Tier Roles    │  Payment Flow   │\n│ (Option C)      │  (Option B)     │\n│                 │                 │\n└─────────────────┴─────────────────┘\n```

### **Layout 2: Top-Bottom Approach**
```\n┌─────────────────────────────┐\n│    TOP: User Roles          │\n│    (Option C - Horizontal)  │\n├─────────────────────────────┤\n│    BOTTOM: Payment Flow     │\n│    (Option B)               │\n└─────────────────────────────┘\n```

### **Layout 3: Single Focused Diagram (RECOMMENDED)**
```\n┌─────────────────────────────┐\n│                             │\n│   Option A or E             │\n│   (3-Layer Architecture)    │\n│                             │\n│   Simple & Clear            │\n│                             │\n└─────────────────────────────┘\n```

---

## 🎨 Pro Tips for Posters:

1. **Use Option A** (3-Layer) as your main architecture diagram
2. **Use Option C** (3-Tier Roles) in a separate section
3. **Use Option B** (Payment Flow) next to your "Testing" or "Features" section
4. **Keep text minimal** - let the diagram speak
5. **Use colors consistently** (Blue=Donor, Green=Organizer, Red=Admin)
6. **Export as SVG** for crisp printing at any size
7. **Add diagram title** above each visualization

---

## Quick Export Guide:

1. Go to https://mermaid.live/
2. Paste any option above
3. Click "Actions" → "Export PNG/SVG"
4. For posters: **Export as SVG** (better quality)
5. Insert into your poster HTML/PDF

**My Recommendation**: Use **Option A** for main architecture + **Option C** for roles section. This gives clarity without overwhelming detail!
