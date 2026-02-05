

## Dashboard Layout Redesign

Based on your wireframe, I'll reorganize the top section of the dashboard into a 2x2 grid layout with the alert cards on top and the metric cards on the bottom.

### New Layout Structure

```text
+------------------------+------------------------+
|                        |                        |
|   Out of Stock Alert   |    Low Stock Alert     |
|      (tall card)       |      (tall card)       |
|                        |                        |
+------------------------+------------------------+
|                        |                        |
|    Total Products      |     Weekly Sales       |
|     (small card)       |     (small card)       |
|                        |                        |
+------------------------+------------------------+
```

### Changes to Make

**1. Create New Alert Card Components**

I'll create two new dedicated card components for the alerts that match the dashboard card styling:
- **OutOfStockAlertCard**: Displays out of stock count with product list
- **LowStockAlertCard**: Displays low stock count with product list

These will be taller cards with more visual prominence, showing:
- Large count number at the top
- List of affected products (up to 5)
- "View All" button to navigate to inventory

**2. Update Dashboard Layout**

Reorganize the Dashboard.tsx layout:
- Remove the separate `<InventoryAlerts />` component from its current position
- Create a 2-column grid for the top row (Out of Stock | Low Stock)
- Create a 2-column grid for the bottom row (Total Products | Weekly Sales)
- Remove the "Low Stock Alerts" from the old 3-column KPI section since it's now in the top row

**3. Styling Updates**

- Top row alert cards will be taller with consistent styling matching the DashboardCard component
- Use red/destructive theme for Out of Stock
- Use amber/warning theme for Low Stock
- Bottom row uses the existing DashboardCard component for Total Products and Weekly Sales

---

### Technical Details

**Files to Modify:**
- `src/pages/Dashboard.tsx` - Restructure the layout grid and component placement
- `src/components/InventoryAlerts.tsx` - Refactor into two separate card-style components

**Grid Structure (CSS):**
```text
Top Row:    grid-cols-1 md:grid-cols-2 (2 equal columns)
Bottom Row: grid-cols-1 md:grid-cols-2 (2 equal columns)
```

**Data Sources (unchanged):**
- Out of Stock: Products where quantity = 0
- Low Stock: Products where quantity <= reorder_level and > 0
- Total Products: Count of all products
- Weekly Sales: Sum of sales from last 7 days

