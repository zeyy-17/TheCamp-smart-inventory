

## Remove Scheduled Reports Section from Reports Page

### Overview
Remove the "Scheduled Reports" section from the Reports page as requested. This is a straightforward UI cleanup task.

### Changes Required

**File: `src/pages/Reports.tsx`**

Remove the following section (lines 204-222):
- The "Scheduled Reports" card containing:
  - "Weekly Inventory Summary" scheduled item (Every Monday at 9:00 AM)
  - "Monthly Performance Report" scheduled item (First day of each month at 8:00 AM)
  - Both "Edit Schedule" buttons

### What Will Remain
- Header with page title and description
- Summary Cards (Today's Sales, Pending Orders, Received This Week)
- Today's Transactions list
- Pending Purchase Orders list
- Recent Purchase Orders (Last 7 Days) list
- Report Cards (Weekly Inventory Report, Monthly Sales Analysis) with Download/Regenerate buttons
- ReportSummaryDialog component

### Technical Details
- No database changes required
- No other components affected
- Simple removal of JSX block

