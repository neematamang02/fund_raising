# Withdrawal Balance Calculation & Flow

## 💰 How Balance Works

### Campaign Balance Formula
```
Available Balance = Total Raised - Total Withdrawn/Pending
```

### Detailed Breakdown
```javascript
Total Raised = Sum of all COMPLETED donations
Total Withdrawn = Sum of withdrawals with status:
  - pending
  - under_review  
  - approved
  - completed

Available Balance = Total Raised - Total Withdrawn
```

## 📊 Example Scenario

### Campaign: "Help Build School"

**Initial State:**
```
Total Raised: $10,000 (from donations)
Total Withdrawn: $0
Available Balance: $10,000
```

### After First Withdrawal Request ($3,000):
```
Total Raised: $10,000
Total Withdrawn: $3,000 (pending)
Available Balance: $7,000
```

**Why?** The $3,000 is "locked" even though it's only pending, to prevent double-withdrawal.

### After Admin Approves ($3,000):
```
Total Raised: $10,000
Total Withdrawn: $3,000 (approved)
Available Balance: $7,000
```

**Status changed but balance stays same** - money is still locked.

### After Admin Marks as Completed ($3,000):
```
Total Raised: $10,000
Total Withdrawn: $3,000 (completed)
Available Balance: $7,000
```

**Money has been sent** to organizer's bank account.

### After Second Withdrawal Request ($7,000):
```
Total Raised: $10,000
Total Withdrawn: $10,000 ($3,000 completed + $7,000 pending)
Available Balance: $0
```

**All funds are now withdrawn or pending withdrawal.**

### If Organizer Tries Third Withdrawal:
```
❌ ERROR: Insufficient funds
Available: $0
Requested: $1,000
```

## 🔄 Status Flow & Balance Impact

### Status Progression
```
pending → under_review → approved → completed
   ↓           ↓            ↓          ↓
 Locked     Locked       Locked    Sent
```

### Balance Impact by Status

| Status | Counted in "Total Withdrawn"? | Available Balance Reduced? |
|--------|------------------------------|---------------------------|
| **pending** | ✅ Yes | ✅ Yes (locked) |
| **under_review** | ✅ Yes | ✅ Yes (locked) |
| **approved** | ✅ Yes | ✅ Yes (locked) |
| **rejected** | ❌ No | ❌ No (released) |
| **completed** | ✅ Yes | ✅ Yes (sent) |

### Why Lock Pending Requests?

**Prevents Double Withdrawal:**
```
Scenario WITHOUT locking:
1. Organizer requests $5,000 (pending)
2. Available shows $10,000 (not locked)
3. Organizer requests another $5,000 (pending)
4. Available shows $10,000 (not locked)
5. Organizer requests another $5,000 (pending)
6. Total requested: $15,000 but only $10,000 available!
❌ PROBLEM: Over-withdrawal

Scenario WITH locking:
1. Organizer requests $5,000 (pending)
2. Available shows $5,000 (locked)
3. Organizer requests another $5,000 (pending)
4. Available shows $0 (locked)
5. Organizer tries to request more
6. ❌ ERROR: Insufficient funds
✅ SAFE: Cannot over-withdraw
```

## 🎯 Real-World Example

### Campaign: "Medical Emergency Fund"

**Day 1: Donations Come In**
```
Donation 1: $1,000
Donation 2: $2,000
Donation 3: $1,500
Donation 4: $500
Total Raised: $5,000
Available: $5,000
```

**Day 5: Organizer Needs Money**
```
Withdrawal Request: $3,000
Status: pending
Available: $2,000 ($5,000 - $3,000)
```

**Day 6: Admin Reviews**
```
Admin clicks "Start Review"
Status: under_review
Available: $2,000 (still locked)
```

**Day 7: Admin Approves**
```
Admin clicks "Approve"
Status: approved
Available: $2,000 (still locked)
```

**Day 8: Admin Processes Payment**
```
Admin transfers $3,000 to organizer's bank
Admin enters transaction reference
Admin clicks "Mark as Completed"
Status: completed
Available: $2,000 (money sent)
```

**Day 10: More Donations**
```
Donation 5: $1,000
Donation 6: $500
Total Raised: $6,500
Total Withdrawn: $3,000
Available: $3,500
```

**Day 12: Second Withdrawal**
```
Withdrawal Request: $3,500 (all remaining)
Status: pending
Available: $0 (all funds withdrawn)
```

**Day 15: Completed**
```
Status: completed
Total Raised: $6,500
Total Withdrawn: $6,500
Available: $0
Campaign balance: EMPTY ✅
```

## 🔍 Checking Balance

### For Organizers
**Endpoint:** `GET /api/withdrawal-requests/available-balance/:campaignId`

**Response:**
```json
{
  "campaignId": "...",
  "totalRaised": 10000,
  "totalWithdrawn": 3000,
  "availableBalance": 7000
}
```

### For Admins
When viewing withdrawal request details, admins can see:
- Campaign total raised
- Amount requested
- Previous withdrawals
- Available balance

## ⚠️ Important Notes

### 1. Rejected Requests Release Funds
```
Before rejection:
Available: $5,000
Pending request: $3,000
Available: $2,000

After rejection:
Rejected request: $3,000 (not counted)
Available: $5,000 (funds released)
```

### 2. Multiple Pending Requests
```
Total Raised: $10,000

Request 1: $3,000 (pending)
Request 2: $2,000 (pending)
Request 3: $4,000 (pending)

Total Withdrawn: $9,000
Available: $1,000

✅ Valid: Total requested ($9,000) < Total raised ($10,000)
```

### 3. Cannot Withdraw More Than Raised
```
Total Raised: $5,000
Withdrawal Request: $6,000

❌ ERROR: Insufficient funds
Available: $5,000
Requested: $6,000
```

## 🛡️ Security Features

### 1. Ownership Verification
```javascript
// Only campaign owner can request withdrawal
if (campaign.owner.toString() !== req.user.userId) {
  return res.status(403).json({ message: "You don't own this campaign" });
}
```

### 2. Balance Validation
```javascript
// Check available balance before creating request
if (amount > availableBalance) {
  return res.status(400).json({
    message: "Insufficient funds",
    available: availableBalance,
    requested: amount,
  });
}
```

### 3. Status Locking
```javascript
// Count all non-rejected withdrawals
const previousWithdrawals = await WithdrawalRequest.aggregate([
  {
    $match: {
      campaign: campaign._id,
      status: { $in: ["pending", "under_review", "approved", "completed"] },
    },
  },
  {
    $group: {
      _id: null,
      total: { $sum: "$amount" },
    },
  },
]);
```

## 📈 Balance Tracking Best Practices

### For Organizers
1. **Check available balance** before requesting withdrawal
2. **Request only what you need** - don't withdraw all at once
3. **Wait for approval** before requesting more
4. **Track your withdrawals** in "My Campaigns" page

### For Admins
1. **Verify available balance** matches request amount
2. **Check previous withdrawals** for patterns
3. **Ensure campaign has funds** before approving
4. **Mark as completed** only after bank transfer

## 🔧 Troubleshooting

### Issue: "Insufficient funds" but campaign shows money
**Cause:** Pending withdrawal requests are locking funds

**Solution:**
1. Check all withdrawal requests for this campaign
2. Look for pending/under_review/approved requests
3. Sum of all requests + new request > total raised

### Issue: Balance not updating after rejection
**Cause:** Frontend cache not refreshed

**Solution:**
1. Refresh the page
2. Check backend logs for status update
3. Verify request status changed to "rejected"

### Issue: Negative available balance
**Cause:** Database inconsistency (should never happen)

**Solution:**
1. Check donation records (status should be "COMPLETED")
2. Check withdrawal records (sum should not exceed raised)
3. Recalculate manually:
   ```javascript
   const totalRaised = await Donation.aggregate([
     { $match: { campaign: campaignId, status: "COMPLETED" } },
     { $group: { _id: null, total: { $sum: "$amount" } } }
   ]);
   ```

## ✅ Summary

**Key Points:**
1. ✅ Available balance = Total raised - Total withdrawn
2. ✅ Pending requests lock funds immediately
3. ✅ Rejected requests release funds
4. ✅ Cannot withdraw more than raised
5. ✅ Balance updates in real-time
6. ✅ After withdrawing all funds, balance = $0

**Status Impact:**
- `pending` → Locks funds
- `under_review` → Keeps locked
- `approved` → Keeps locked
- `rejected` → Releases funds
- `completed` → Funds sent (stays locked)

**Final State:**
When all funds are withdrawn and completed:
```
Total Raised: $10,000
Total Withdrawn: $10,000
Available Balance: $0 ✅
```

---

**Last Updated:** January 2025
**Version:** 1.0.0
