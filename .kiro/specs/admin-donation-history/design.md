# Design Document: Admin Donation History

## Overview

This feature enhances the existing Admin Dashboard by adding donation history visibility to both User Management and Campaign Management sections. The implementation leverages the existing Donation model and admin infrastructure, adding two new backend API endpoints and corresponding frontend UI components.

The design follows the established MERN stack patterns in the codebase:
- Backend: Express.js controllers and services with MongoDB queries
- Frontend: React with TanStack Query for data fetching, shadcn/ui components for UI
- Authentication: JWT-based with role-based access control (admin-only endpoints)

### Key Design Decisions

1. **Reuse Existing Infrastructure**: The Donation model already has the necessary indexes (`donor: 1, createdAt: -1` and `campaign: 1, createdAt: -1`) for efficient queries. No schema changes are required.

2. **Service Layer Pattern**: Following the existing pattern where controllers delegate to service functions, keeping business logic separate from HTTP handling.

3. **Consistent API Response Format**: Match the existing admin API patterns with pagination, error handling, and data population.

4. **UI Integration**: Extend existing admin pages (AdminUsers.jsx and AdminCampaigns.jsx) rather than creating new pages, maintaining consistency with the current admin interface.

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React)                         │
│  ┌────────────────────┐         ┌─────────────────────────┐ │
│  │  AdminUsers.jsx    │         │  AdminCampaigns.jsx     │ │
│  │  - User Details    │         │  - Campaign Details     │ │
│  │  - Donations Tab   │         │  - Donors List          │ │
│  └────────┬───────────┘         └──────────┬──────────────┘ │
│           │                                 │                 │
│           └────────────┬────────────────────┘                 │
│                        │                                      │
│                ┌───────▼────────┐                            │
│                │  adminApi.js   │                            │
│                │  - API Client  │                            │
│                └───────┬────────┘                            │
└────────────────────────┼─────────────────────────────────────┘
                         │ HTTP/JSON
┌────────────────────────▼─────────────────────────────────────┐
│                  Backend (Express.js)                         │
│  ┌──────────────────────────────────────────────────────────┐│
│  │              Routes (admin.js)                           ││
│  │  GET /api/admin/users/:userId/donations                  ││
│  │  GET /api/admin/campaigns/:campaignId/donors             ││
│  └────────────────────────┬─────────────────────────────────┘│
│                           │                                   │
│  ┌────────────────────────▼─────────────────────────────────┐│
│  │         Controllers (adminController.js)                 ││
│  │  - getAdminUserDonations()                               ││
│  │  - getAdminCampaignDonors()                              ││
│  └────────────────────────┬─────────────────────────────────┘│
│                           │                                   │
│  ┌────────────────────────▼─────────────────────────────────┐│
│  │          Services (adminService.js)                      ││
│  │  - getUserDonations()                                    ││
│  │  - getCampaignDonors()                                   ││
│  └────────────────────────┬─────────────────────────────────┘│
│                           │                                   │
│  ┌────────────────────────▼─────────────────────────────────┐│
│  │              MongoDB Models                              ││
│  │  - Donation (existing)                                   ││
│  │  - User (existing)                                       ││
│  │  - Campaign (existing)                                   ││
│  └──────────────────────────────────────────────────────────┘│
└───────────────────────────────────────────────────────────────┘
```

### Data Flow

#### User Donation History Flow
1. Admin clicks "View" on a user in User Management
2. Frontend fetches user details (existing) and donation history (new endpoint)
3. Backend queries Donation collection filtered by donor ID
4. Backend populates campaign references with title and imageURL
5. Backend calculates total donated amount via aggregation
6. Frontend displays donations in a new "Donations" tab within the user details dialog

#### Campaign Donors Flow
1. Admin clicks "Details" on a campaign in Campaign Management
2. Frontend fetches campaign details (existing endpoint already returns donations)
3. Frontend displays donor information in a new "Donors" section
4. Existing endpoint already provides donor data via population

## Components and Interfaces

### Backend Components

#### New Route Endpoints

```javascript
// Backend/Routes/admin.js

// Get user donation history
router.get(
  "/admin/users/:userId/donations",
  authenticateToken,
  requireRole(["admin"]),
  getAdminUserDonations
);
```

Note: Campaign donors endpoint is NOT needed - the existing `/admin/campaigns/:campaignId` endpoint already returns populated donation data with donor information.

#### New Controller Functions

```javascript
// Backend/controllers/adminController.js

export async function getAdminUserDonations(req, res) {
  try {
    const result = await getUserDonations({ userId: req.params.userId });
    
    if (result.status) {
      return res.status(result.status).json({ message: result.message });
    }
    
    return res.json({
      donations: result.donations,
      totalAmount: result.totalAmount,
      totalCount: result.totalCount
    });
  } catch (error) {
    console.error("Error fetching user donations:", error);
    return res.status(500).json({ 
      message: "Server error", 
      error: error.message 
    });
  }
}
```

#### New Service Functions

```javascript
// Backend/services/adminService.js

export async function getUserDonations({ userId }) {
  // Validate user exists
  const user = await User.findById(userId);
  if (!user) {
    return { status: 404, message: "User not found" };
  }
  
  // Fetch donations with campaign population
  const donations = await Donation.find({ 
    donor: userId,
    status: "COMPLETED" 
  })
    .populate("campaign", "title imageURL")
    .sort({ createdAt: -1 });
  
  // Calculate total amount
  const totalAmount = donations.reduce((sum, d) => sum + d.amount, 0);
  
  return {
    donations,
    totalAmount,
    totalCount: donations.length
  };
}
```

### Frontend Components

#### AdminUsers.jsx Enhancement

Add a new "Donations" tab to the user details dialog:

```jsx
// Inside the user details dialog
<Tabs defaultValue="overview">
  <TabsList>
    <TabsTrigger value="overview">Overview</TabsTrigger>
    <TabsTrigger value="donations">Donations</TabsTrigger>
  </TabsList>
  
  <TabsContent value="overview">
    {/* Existing user details */}
  </TabsContent>
  
  <TabsContent value="donations">
    <DonationsTab userId={selectedUserId} />
  </TabsContent>
</Tabs>
```

#### New Component: DonationsTab

```jsx
function DonationsTab({ userId }) {
  const { data, isLoading, error } = useQuery({
    queryKey: adminQueryKeys.userDonations(userId),
    queryFn: () => getAdminUserDonations(userId),
    enabled: Boolean(userId)
  });
  
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage />;
  if (!data?.donations?.length) return <EmptyState />;
  
  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Total Donated</CardTitle>
        </CardHeader>
        <CardContent>
          ${data.totalAmount.toFixed(2)}
        </CardContent>
      </Card>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Campaign</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.donations.map(donation => (
            <TableRow key={donation._id}>
              <TableCell>{donation.campaign?.title}</TableCell>
              <TableCell>${donation.amount.toFixed(2)}</TableCell>
              <TableCell>{formatDate(donation.createdAt)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
```

#### AdminCampaigns.jsx Enhancement

The existing campaign details dialog already fetches donations. We need to add a "Donors" section to display them in a user-friendly format:

```jsx
// Inside campaign details dialog, add after existing cards
<Card>
  <CardHeader>
    <CardTitle>Campaign Donors</CardTitle>
  </CardHeader>
  <CardContent>
    {campaignDetails.donations?.length === 0 ? (
      <EmptyState message="No donations yet" />
    ) : (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Donor</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {campaignDetails.donations.map(donation => (
            <TableRow key={donation._id}>
              <TableCell>
                {donation.isAnonymous ? "Anonymous" : donation.donor?.name}
              </TableCell>
              <TableCell>{donation.donorEmail}</TableCell>
              <TableCell>${donation.amount.toFixed(2)}</TableCell>
              <TableCell>{formatDate(donation.createdAt)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    )}
  </CardContent>
</Card>
```

#### API Client Updates

```javascript
// Frontend/src/services/adminApi.js

export const adminQueryKeys = {
  // ... existing keys
  userDonations: (userId) => ["admin", "users", "donations", userId],
};

export function getAdminUserDonations(userId, options = {}) {
  return request(`/admin/users/${userId}/donations`, options);
}
```

## Data Models

### Existing Donation Model (No Changes Required)

```javascript
// Backend/Models/Donation.js
const DonationSchema = new mongoose.Schema({
  campaign: {
    type: mongoose.Types.ObjectId,
    ref: "Campaign",
    required: true,
    index: true
  },
  donor: {
    type: mongoose.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },
  donorEmail: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: true
  },
  isAnonymous: {
    type: Boolean,
    default: false,
    index: true
  },
  amount: { 
    type: Number, 
    required: true, 
    min: 0 
  },
  status: {
    type: String,
    enum: ["COMPLETED", "PENDING", "FAILED"],
    default: "PENDING",
    index: true
  },
  // ... other fields
}, { timestamps: true });

// Existing indexes (already optimized for our queries)
DonationSchema.index({ campaign: 1, createdAt: -1 });
DonationSchema.index({ donor: 1, createdAt: -1 });
```

### API Response Formats

#### GET /api/admin/users/:userId/donations

**Success Response (200)**
```json
{
  "donations": [
    {
      "_id": "donation_id",
      "campaign": {
        "_id": "campaign_id",
        "title": "Campaign Title",
        "imageURL": "https://..."
      },
      "amount": 50.00,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "status": "COMPLETED"
    }
  ],
  "totalAmount": 150.00,
  "totalCount": 3
}
```

**Error Responses**
- 404: User not found
- 500: Server error

#### GET /api/admin/campaigns/:campaignId (Existing - Already Returns Donors)

**Success Response (200)**
```json
{
  "campaign": { /* campaign details */ },
  "donations": [
    {
      "_id": "donation_id",
      "donor": {
        "_id": "user_id",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "donorEmail": "john@example.com",
      "amount": 50.00,
      "isAnonymous": false,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "status": "COMPLETED"
    }
  ],
  "withdrawalRequests": [ /* ... */ ]
}
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

After analyzing all acceptance criteria, I identified the following redundancies:

- **Donor list field requirements (2.2-2.5)**: These four separate criteria about displaying name, email, amount, and date can be combined into a single comprehensive property about required fields in donor records.
- **Loading and error states (1.6, 1.7, 2.7, 2.8)**: These follow the same pattern for both user donations and campaign donors, but they test different components, so they remain separate.
- **Sorting requirements (3.5, 4.5)**: Both APIs sort by date descending, but they're testing different endpoints, so they remain separate.
- **Population requirements (3.3, 4.3, 4.4)**: These test that references are populated correctly, but for different entities (campaigns vs users), so they remain separate.

### Property 1: Total Donation Amount Calculation

*For any* user with completed donations, the total amount displayed in the Donations Tab should equal the sum of all individual donation amounts for that user.

**Validates: Requirements 1.2, 3.4**

### Property 2: User Donation List Completeness

*For any* user, the list of campaigns displayed in the Donations Tab should include all campaigns to which the user has made completed donations, with no duplicates or omissions.

**Validates: Requirements 1.3, 3.2**

### Property 3: Donation Record Field Completeness

*For any* donation displayed in the user's Donations Tab, the UI should render both the donation amount and the donation date.

**Validates: Requirements 1.4**

### Property 4: Campaign Reference Population

*For any* donation returned by the user donations API, the campaign field should be populated with an object containing at least the campaign title (not just an ObjectId reference).

**Validates: Requirements 3.3**

### Property 5: User Donations Sorted by Date

*For any* list of donations returned by the user donations API, the donations should be ordered by creation date in descending order (newest first).

**Validates: Requirements 3.5**

### Property 6: Campaign Donor List Completeness

*For any* campaign, the list of donors displayed should include all users who have made completed donations to that campaign.

**Validates: Requirements 2.1, 4.2**

### Property 7: Donor Record Required Fields

*For any* donor record displayed in the campaign donors list, the UI should render all required fields: donor name (or "Anonymous"), email, donated amount, and donation date.

**Validates: Requirements 2.2, 2.3, 2.4, 2.5**

### Property 8: User Reference Population

*For any* donation returned by the campaign donors API, the donor field should be populated with an object containing the user's name and email (not just an ObjectId reference).

**Validates: Requirements 4.3, 4.4**

### Property 9: Campaign Donations Sorted by Date

*For any* list of donations returned by the campaign donors API, the donations should be ordered by creation date in descending order (newest first).

**Validates: Requirements 4.5**

### Property 10: Currency Formatting

*For any* monetary amount displayed in the admin dashboard, the value should be formatted with a dollar sign prefix and exactly two decimal places (e.g., $50.00).

**Validates: Requirements 6.2**

### Property 11: Date Formatting

*For any* date displayed in the admin dashboard, the value should be formatted in a human-readable format (not as an ISO timestamp or raw date object).

**Validates: Requirements 6.3**

### Property 12: Campaign Name Links

*For any* campaign name displayed in the donations list, the element should be rendered as a clickable link (anchor tag or button with navigation handler).

**Validates: Requirements 6.4**

### Property 13: Donor Name Links

*For any* non-anonymous donor name displayed in the campaign donors list, the element should be rendered as a clickable link (anchor tag or button with navigation handler).

**Validates: Requirements 6.5**

### Property 14: Loading State Indicator

*For any* data fetching operation in the Donations Tab or Campaign Donors section, while the query is in a loading state, a loading indicator should be visible to the user.

**Validates: Requirements 1.6, 2.7**

## Error Handling

### Backend Error Handling

#### Invalid User ID (404)
- **Scenario**: Admin requests donations for a non-existent user ID
- **Response**: HTTP 404 with message "User not found"
- **Implementation**: Check user existence before querying donations

#### Invalid Campaign ID (404)
- **Scenario**: Admin requests donors for a non-existent campaign ID
- **Response**: HTTP 404 with message "Campaign not found"
- **Implementation**: Existing endpoint already handles this

#### Database Errors (500)
- **Scenario**: MongoDB query fails due to connection issues or other errors
- **Response**: HTTP 500 with message "Server error" and error details
- **Implementation**: Try-catch blocks in controllers with error logging

#### Malformed Request (400)
- **Scenario**: Invalid ObjectId format in URL parameters
- **Response**: HTTP 400 with message "Invalid ID format"
- **Implementation**: Mongoose will throw CastError, catch and return 400

### Frontend Error Handling

#### Network Errors
- **Display**: Error message in the UI component
- **User Action**: Provide retry button or refresh option
- **Implementation**: TanStack Query error state handling

#### Empty States
- **No Donations**: Display "This user has not made any donations yet"
- **No Donors**: Display "This campaign has not received any donations yet"
- **Implementation**: Conditional rendering based on array length

#### Loading States
- **During Fetch**: Display loading spinner or skeleton UI
- **Implementation**: TanStack Query isLoading state

#### Authentication Errors (401/403)
- **Scenario**: Token expired or user lacks admin role
- **Response**: Redirect to login page
- **Implementation**: Existing auth middleware and frontend guards

## Testing Strategy

### Dual Testing Approach

This feature will use both unit tests and property-based tests to ensure comprehensive coverage:

- **Unit Tests**: Verify specific examples, edge cases (empty states, error conditions), and integration points
- **Property Tests**: Verify universal properties across all inputs using randomized test data

### Backend Testing

#### Unit Tests (Jest/Mocha)

**Service Layer Tests** (`Backend/tests/adminService.test.js`):
- Test `getUserDonations()` with a user who has donations
- Test `getUserDonations()` with a user who has no donations (empty array)
- Test `getUserDonations()` with invalid user ID (404 error)
- Test that campaign references are populated correctly
- Test that total amount calculation is correct for known values
- Test that donations are sorted by date descending

**Controller Tests** (`Backend/tests/adminController.test.js`):
- Test `getAdminUserDonations()` returns 200 with correct data structure
- Test `getAdminUserDonations()` returns 404 for non-existent user
- Test `getAdminUserDonations()` returns 500 on database error
- Test authentication and authorization (admin-only access)

#### Property-Based Tests (fast-check)

**Configuration**: Minimum 100 iterations per property test

**Property Test 1: Total Amount Calculation**
```javascript
// Feature: admin-donation-history, Property 1: Total amount equals sum of donations
fc.assert(
  fc.property(
    fc.array(fc.record({ amount: fc.double(0, 10000) })),
    (donations) => {
      const calculated = donations.reduce((sum, d) => sum + d.amount, 0);
      const result = getUserDonations({ donations });
      return Math.abs(result.totalAmount - calculated) < 0.01;
    }
  ),
  { numRuns: 100 }
);
```

**Property Test 2: Donation List Completeness**
```javascript
// Feature: admin-donation-history, Property 2: All donations are returned
fc.assert(
  fc.property(
    fc.array(fc.record({ 
      _id: fc.string(), 
      campaign: fc.string(),
      status: fc.constantFrom("COMPLETED", "PENDING", "FAILED")
    })),
    (allDonations) => {
      const completed = allDonations.filter(d => d.status === "COMPLETED");
      const result = getUserDonations({ donations: allDonations });
      return result.donations.length === completed.length;
    }
  ),
  { numRuns: 100 }
);
```

**Property Test 3: Sorting Order**
```javascript
// Feature: admin-donation-history, Property 5: Donations sorted by date descending
fc.assert(
  fc.property(
    fc.array(fc.record({ 
      createdAt: fc.date(),
      amount: fc.double(0, 1000)
    })),
    (donations) => {
      const result = getUserDonations({ donations });
      for (let i = 0; i < result.donations.length - 1; i++) {
        if (result.donations[i].createdAt < result.donations[i + 1].createdAt) {
          return false;
        }
      }
      return true;
    }
  ),
  { numRuns: 100 }
);
```

### Frontend Testing

#### Unit Tests (Vitest + React Testing Library)

**Component Tests** (`Frontend/src/components/__tests__/DonationsTab.test.jsx`):
- Test DonationsTab renders loading state while fetching
- Test DonationsTab renders empty state when no donations
- Test DonationsTab renders error message on fetch failure
- Test DonationsTab displays total amount correctly
- Test DonationsTab renders donation list with all fields
- Test currency formatting ($50.00 format)
- Test date formatting (human-readable)
- Test campaign name links are clickable

**Integration Tests**:
- Test AdminUsers page opens user details dialog
- Test Donations tab is visible in user details
- Test AdminCampaigns page displays donors section
- Test API client functions call correct endpoints

#### Property-Based Tests (fast-check)

**Property Test 4: Currency Formatting**
```javascript
// Feature: admin-donation-history, Property 10: Currency formatted correctly
fc.assert(
  fc.property(
    fc.double(0, 1000000),
    (amount) => {
      const formatted = formatCurrency(amount);
      return /^\$\d+\.\d{2}$/.test(formatted);
    }
  ),
  { numRuns: 100 }
);
```

**Property Test 5: All Required Fields Rendered**
```javascript
// Feature: admin-donation-history, Property 7: All donor fields displayed
fc.assert(
  fc.property(
    fc.record({
      donor: fc.record({ name: fc.string(), email: fc.string() }),
      amount: fc.double(0, 10000),
      createdAt: fc.date(),
      isAnonymous: fc.boolean()
    }),
    (donation) => {
      const rendered = renderDonorRow(donation);
      const hasName = rendered.includes(donation.isAnonymous ? "Anonymous" : donation.donor.name);
      const hasEmail = rendered.includes(donation.donor.email);
      const hasAmount = rendered.includes(donation.amount.toString());
      return hasName && hasEmail && hasAmount;
    }
  ),
  { numRuns: 100 }
);
```

### Test Coverage Goals

- **Backend**: 90%+ code coverage for new service and controller functions
- **Frontend**: 85%+ code coverage for new components
- **Property Tests**: All identified properties must have corresponding property-based tests
- **Edge Cases**: All error conditions and empty states must have unit tests

### Testing Tools

- **Backend**: Jest or Mocha for unit tests, fast-check for property-based tests
- **Frontend**: Vitest for unit tests, React Testing Library for component tests, fast-check for property-based tests
- **API Testing**: Supertest for integration tests of API endpoints
- **Mocking**: Mock MongoDB queries for isolated unit tests, use test database for integration tests
