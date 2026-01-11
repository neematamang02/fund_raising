# 📧 Email Notification Flow Diagram

## Complete Organizer Application Email Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         USER APPLIES AS ORGANIZER                        │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
                    ┌───────────────────────────────┐
                    │  1. Fill Basic Information    │
                    │     - Organization Name       │
                    │     - Description             │
                    │     - Contact Details         │
                    │     - Organization Type       │
                    └───────────────┬───────────────┘
                                    │
                                    ▼
                    ┌───────────────────────────────┐
                    │  2. Upload Documents          │
                    │     - Government ID ✓         │
                    │     - Selfie with ID ✓        │
                    │     - Registration Cert       │
                    │     - Tax ID                  │
                    │     - Address Proof           │
                    └───────────────┬───────────────┘
                                    │
                                    ▼
        ┌───────────────────────────────────────────────────┐
        │  Status: DRAFT → PENDING                          │
        │  📧 EMAIL #1: "Application Submitted"             │
        │  ✉️  To: User Email                               │
        │  📋 Contains:                                      │
        │     - Confirmation message                        │
        │     - Application details                         │
        │     - Review timeline (2-3 days)                  │
        │     - What happens next                           │
        └───────────────────┬───────────────────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────────────────────┐
        │           ADMIN REVIEWS APPLICATION                │
        │  - Views in Admin Dashboard                       │
        │  - Reviews documents                              │
        │  - Checks organization details                    │
        └───────────────────┬───────────────────────────────┘
                            │
                ┌───────────┴───────────┐
                │                       │
                ▼                       ▼
    ┌─────────────────────┐   ┌─────────────────────┐
    │   ADMIN APPROVES    │   │   ADMIN REJECTS     │
    └──────────┬──────────┘   └──────────┬──────────┘
               │                          │
               ▼                          ▼
┌──────────────────────────┐   ┌──────────────────────────┐
│ Status: APPROVED         │   │ Status: REJECTED         │
│ User Role: ORGANIZER     │   │ User Role: DONOR         │
│                          │   │                          │
│ 📧 EMAIL #2:             │   │ 📧 EMAIL #3:             │
│ "Application Approved"   │   │ "Application Rejected"   │
│                          │   │                          │
│ ✉️  To: User Email       │   │ ✉️  To: User Email       │
│ 📋 Contains:             │   │ 📋 Contains:             │
│  - Congratulations! 🎉   │   │  - Rejection notice      │
│  - New capabilities      │   │  - Detailed reason       │
│  - Getting started tips  │   │  - How to improve        │
│  - Create campaign link  │   │  - Reapply option        │
└──────────┬───────────────┘   └──────────┬───────────────┘
           │                              │
           ▼                              ▼
┌──────────────────────────┐   ┌──────────────────────────┐
│ USER CAN NOW:            │   │ USER CAN:                │
│  ✓ Create campaigns      │   │  ✓ Review feedback       │
│  ✓ Receive donations     │   │  ✓ Improve application   │
│  ✓ Manage campaigns      │   │  ✓ Reapply later         │
│  ✓ Track progress        │   │  ✓ Contact support       │
└──────────┬───────────────┘   └──────────────────────────┘
           │
           │ (Later, if needed)
           ▼
┌──────────────────────────┐
│   ADMIN REVOKES          │
│   ORGANIZER STATUS       │
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────┐
│ Status: REVOKED          │
│ User Role: DONOR         │
│                          │
│ 📧 EMAIL #4:             │
│ "Organizer Revoked"      │
│                          │
│ ✉️  To: User Email       │
│ 📋 Contains:             │
│  - Revocation notice ⚠️  │
│  - Reason for revocation │
│  - Impact on account     │
│  - Appeal process        │
│  - Contact support link  │
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────┐
│ USER REVERTED TO DONOR   │
│  - Cannot create         │
│  - Cannot receive        │
│  - Can still donate      │
│  - Can appeal decision   │
└──────────────────────────┘
```

## Email Types Summary

### 📧 Email #1: Application Submitted
**Trigger:** User uploads documents and submits application  
**Status Change:** DRAFT → PENDING  
**Color Theme:** 🟣 Purple  
**Purpose:** Confirm receipt and set expectations  
**Key Info:** Timeline, next steps, application ID  

### 📧 Email #2: Application Approved
**Trigger:** Admin approves application  
**Status Change:** PENDING → APPROVED  
**Role Change:** DONOR → ORGANIZER  
**Color Theme:** 🟢 Green  
**Purpose:** Celebrate and onboard  
**Key Info:** New capabilities, getting started tips, CTA  

### 📧 Email #3: Application Rejected
**Trigger:** Admin rejects application  
**Status Change:** PENDING → REJECTED  
**Role:** Remains DONOR  
**Color Theme:** 🔴 Red  
**Purpose:** Explain and encourage improvement  
**Key Info:** Rejection reason, improvement steps, reapply option  

### 📧 Email #4: Organizer Revoked
**Trigger:** Admin revokes organizer privileges  
**Status Change:** APPROVED → REVOKED  
**Role Change:** ORGANIZER → DONOR  
**Color Theme:** 🟠 Orange  
**Purpose:** Notify and explain consequences  
**Key Info:** Revocation reason, impact, appeal process  

## Technical Flow

```javascript
// 1. Application Submission
POST /api/organizer/upload-documents/:id
  ↓
Status: draft → pending
  ↓
sendApplicationSubmittedEmail(user, application)
  ↓
Email sent to user

// 2. Admin Approval
PATCH /api/admin/applications/:id/approve
  ↓
Status: pending → approved
Role: donor → organizer
  ↓
sendApplicationApprovedEmail(user, application)
  ↓
Email sent to user

// 3. Admin Rejection
PATCH /api/admin/applications/:id/reject
  ↓
Status: pending → rejected
  ↓
sendApplicationRejectedEmail(user, application, reason)
  ↓
Email sent to user

// 4. Admin Revocation
PATCH /api/admin/applications/:id/revoke
  ↓
Status: approved → revoked
Role: organizer → donor
  ↓
sendOrganizerRevokedEmail(user, application, reason)
  ↓
Email sent to user
```

## Error Handling Flow

```
Email Function Called
        │
        ▼
    Try Send
        │
    ┌───┴───┐
    │       │
    ▼       ▼
Success   Failure
    │       │
    │       ▼
    │   Log Error
    │       │
    │       ▼
    │   Continue
    │   (Don't break app)
    │       │
    └───┬───┘
        │
        ▼
    Return to Route
```

## Database State Changes

```
┌─────────────────────────────────────────────────────────┐
│                    OrganizerApplication                  │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  DRAFT (Initial)                                         │
│    ↓ (Upload documents)                                  │
│  PENDING ────────────────────────────────────────────┐   │
│    │                                                  │   │
│    ├─→ APPROVED (Admin approves)                     │   │
│    │     └─→ REVOKED (Admin revokes later)           │   │
│    │                                                  │   │
│    └─→ REJECTED (Admin rejects) ─────────────────────┘   │
│          └─→ Can create new application (DRAFT)          │
│                                                          │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                         User                             │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  role: "donor" (Initial)                                 │
│    ↓ (Application approved)                              │
│  role: "organizer"                                       │
│    ↓ (Organizer revoked)                                 │
│  role: "donor"                                           │
│                                                          │
│  isOrganizerApproved: false → true → false              │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## Email Content Structure

```
┌─────────────────────────────────────────┐
│           HEADER (Gradient)              │
│              🎉 Title                    │
│            Subtitle Text                 │
└─────────────────────────────────────────┘
│                                          │
│  Dear [User Name],                       │
│                                          │
│  Main message paragraph...               │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │     INFO BOX (Highlighted)         │ │
│  │  - Key information                 │ │
│  │  - Important details               │ │
│  └────────────────────────────────────┘ │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │     TIMELINE / FEATURES            │ │
│  │  Step 1: ...                       │ │
│  │  Step 2: ...                       │ │
│  │  Step 3: ...                       │ │
│  └────────────────────────────────────┘ │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │     CALL TO ACTION BUTTON          │ │
│  └────────────────────────────────────┘ │
│                                          │
│  Closing message...                      │
│                                          │
├─────────────────────────────────────────┤
│            FOOTER                        │
│  Automated message disclaimer            │
│  © 2026 Fundraising Platform             │
└─────────────────────────────────────────┘
```

## Monitoring & Logging

```
Console Output:

✅ Application submitted email sent to user@example.com
✅ Application approved email sent to user@example.com
✅ Application rejected email sent to user@example.com
✅ Organizer revoked email sent to user@example.com

OR

❌ Error sending application submitted email: [error details]
```

## Integration Points

| Route | Method | Email Triggered | Status Change |
|-------|--------|----------------|---------------|
| `/api/organizer/upload-documents/:id` | POST | Application Submitted | draft → pending |
| `/api/admin/applications/:id/approve` | PATCH | Application Approved | pending → approved |
| `/api/admin/applications/:id/reject` | PATCH | Application Rejected | pending → rejected |
| `/api/admin/applications/:id/revoke` | PATCH | Organizer Revoked | approved → revoked |

---

**Legend:**
- 📧 = Email notification sent
- ✓ = Required field
- ✉️ = Email recipient
- 📋 = Email content
- 🎉 = Positive action
- ⚠️ = Warning/Alert
- 🟣 Purple = Submission
- 🟢 Green = Approval
- 🔴 Red = Rejection
- 🟠 Orange = Revocation
