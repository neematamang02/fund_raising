# Implementation Plan: Admin Donation History

## Overview

This implementation adds donation history visibility to the Admin Dashboard by creating one new backend API endpoint and enhancing two existing frontend admin pages. The feature leverages existing Donation, User, and Campaign models with no schema changes required.

Implementation approach:
1. Backend: Add user donations API endpoint with service and controller functions
2. Frontend: Add Donations tab to AdminUsers.jsx and Donors section to AdminCampaigns.jsx
3. Testing: Property-based tests and unit tests for both backend and frontend

## Tasks

- [x] 1. Set up backend API endpoint for user donations
  - [x] 1.1 Add route definition in Backend/Routes/admin.js
    - Add GET /admin/users/:userId/donations route with authentication and admin role middleware
    - _Requirements: 3.1, 3.6_

  - [x] 1.2 Implement controller function in Backend/controllers/adminController.js
    - Create getAdminUserDonations() function
    - Handle request parameters and delegate to service layer
    - Return appropriate HTTP status codes and response format
    - _Requirements: 3.1, 3.6, 3.7_

  - [x] 1.3 Implement service function in Backend/services/adminService.js
    - Create getUserDonations() function
    - Validate user exists (return 404 if not found)
    - Query Donation collection filtered by donor ID and status "COMPLETED"
    - Populate campaign references with title and imageURL fields
    - Calculate total donated amount
    - Sort donations by createdAt descending
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 5.1, 5.2, 5.3_


  - [ ]* 1.4 Write property test for total amount calculation
    - **Property 1: Total Donation Amount Calculation**
    - **Validates: Requirements 1.2, 3.4**
    - Generate random arrays of donations with varying amounts
    - Verify calculated total equals sum of individual amounts
    - _Requirements: 1.2, 3.4_

  - [ ]* 1.5 Write property test for donation list completeness
    - **Property 2: User Donation List Completeness**
    - **Validates: Requirements 1.3, 3.2**
    - Generate random arrays of donations with different statuses
    - Verify only COMPLETED donations are returned
    - _Requirements: 1.3, 3.2_

  - [ ]* 1.6 Write property test for sorting order
    - **Property 5: User Donations Sorted by Date**
    - **Validates: Requirements 3.5**
    - Generate random arrays of donations with varying dates
    - Verify donations are sorted by createdAt descending
    - _Requirements: 3.5_

  - [ ]* 1.7 Write unit tests for service function
    - Test getUserDonations() with user who has donations
    - Test getUserDonations() with user who has no donations (empty array)
    - Test getUserDonations() with invalid user ID (404 error)
    - Test campaign references are populated correctly
    - Test total amount calculation with known values
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_

  - [ ]* 1.8 Write unit tests for controller function
    - Test getAdminUserDonations() returns 200 with correct data structure
    - Test getAdminUserDonations() returns 404 for non-existent user
    - Test getAdminUserDonations() returns 500 on database error
    - Test authentication and authorization (admin-only access)
    - _Requirements: 3.1, 3.6, 3.7_

- [x] 2. Checkpoint - Verify backend endpoint works
  - Test the API endpoint manually or with automated tests
  - Ensure all tests pass, ask the user if questions arise

- [x] 3. Add API client function for user donations
  - [x] 3.1 Update Frontend/src/services/adminApi.js
    - Add userDonations query key to adminQueryKeys object
    - Implement getAdminUserDonations() function
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 4. Implement Donations tab in AdminUsers.jsx
  - [x] 4.1 Add Tabs component to user details dialog
    - Import Tabs, TabsList, TabsTrigger, TabsContent from shadcn/ui
    - Add "Overview" and "Donations" tabs to existing user details dialog
    - _Requirements: 1.1_

  - [x] 4.2 Create DonationsTab component
    - Use TanStack Query to fetch user donations
    - Implement loading state with spinner
    - Implement error state with error message
    - Implement empty state for users with no donations
    - Display total donated amount in a Card component
    - Display donations list in a Table component with columns: Campaign, Amount, Date
    - Format currency with dollar sign and two decimal places
    - Format dates in human-readable format
    - Make campaign names clickable links
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 6.1, 6.2, 6.3, 6.4, 6.6, 6.7_

  - [ ]* 4.3 Write property test for currency formatting
    - **Property 10: Currency Formatting**
    - **Validates: Requirements 6.2**
    - Generate random monetary amounts
    - Verify formatted output matches $XX.XX pattern
    - _Requirements: 6.2_

  - [ ]* 4.4 Write property test for required fields rendering
    - **Property 3: Donation Record Field Completeness**
    - **Validates: Requirements 1.4**
    - Generate random donation records
    - Verify both amount and date are rendered in UI
    - _Requirements: 1.4_

  - [ ]* 4.5 Write unit tests for DonationsTab component
    - Test component renders loading state while fetching
    - Test component renders empty state when no donations
    - Test component renders error message on fetch failure
    - Test component displays total amount correctly
    - Test component renders donation list with all fields
    - Test currency formatting ($50.00 format)
    - Test date formatting (human-readable)
    - Test campaign name links are clickable
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 6.2, 6.3, 6.4_

- [x] 5. Add Donors section to AdminCampaigns.jsx
  - [x] 5.1 Add Donors Card to campaign details dialog
    - Add new Card component after existing campaign details cards
    - Display "Campaign Donors" as card title
    - Implement empty state for campaigns with no donors
    - Display donors list in a Table component with columns: Donor, Email, Amount, Date
    - Handle anonymous donors by displaying "Anonymous" instead of name
    - Format currency with dollar sign and two decimal places
    - Format dates in human-readable format
    - Make donor names clickable links (except for anonymous donors)
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 6.1, 6.2, 6.3, 6.5, 6.6, 6.7_

  - [ ]* 5.2 Write property test for donor fields rendering
    - **Property 7: Donor Record Required Fields**
    - **Validates: Requirements 2.2, 2.3, 2.4, 2.5**
    - Generate random donor records with varying isAnonymous values
    - Verify all required fields (name/Anonymous, email, amount, date) are rendered
    - _Requirements: 2.2, 2.3, 2.4, 2.5_

  - [ ]* 5.3 Write unit tests for Donors section
    - Test section renders empty state when no donors
    - Test section displays donor list with all fields
    - Test anonymous donors display "Anonymous" instead of name
    - Test currency formatting ($50.00 format)
    - Test date formatting (human-readable)
    - Test donor name links are clickable for non-anonymous donors
    - Test anonymous donors do not have clickable names
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 6.2, 6.3, 6.5_

- [x] 6. Final checkpoint - Integration testing
  - Verify AdminUsers page displays Donations tab correctly
  - Verify AdminCampaigns page displays Donors section correctly
  - Verify all loading, error, and empty states work as expected
  - Verify currency and date formatting is consistent
  - Verify clickable links navigate correctly
  - Ensure all tests pass, ask the user if questions arise

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- The existing campaign details endpoint already returns donation data, so no new backend endpoint is needed for campaign donors
- Existing Donation model indexes are already optimized for these queries
- All monetary amounts should be formatted as $XX.XX
- All dates should be formatted in human-readable format (not ISO timestamps)
- Anonymous donors should display "Anonymous" instead of their name
- Campaign names and donor names should be clickable links where applicable
