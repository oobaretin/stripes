# Business Workflow Enhancement

## Overview

The application has been enhanced to support your complete business workflow:
1. **Buy from Sellers** (online or in-person) → Record as Purchases
2. **Resell to Buyers** → Record as Sales
3. **Track Profit** → Automatic profit calculation on every sale

## Key Features

### 1. Seller/Supplier Management
- **Page**: "Sellers / Suppliers" (formerly "Customers")
- **Purpose**: People you buy test strips FROM
- **Features**:
  - Track seller contact information
  - Manage seller relationships
  - View purchase history per seller

### 2. Purchase Tracking
- **Purchase Method**: Track whether you bought online (🌐) or in-person (👤)
- **Purpose**: Record all purchases from sellers
- **Features**:
  - Select seller/supplier
  - Choose purchase method (online/in-person)
  - Add multiple products per purchase
  - Track expiration dates and lot numbers
  - Calculate total purchase cost

### 3. Buyer Management
- **Purpose**: People you resell test strips TO
- **Features**:
  - Complete buyer information from Google Sheets
  - Payment methods and preferences
  - Price sheet links
  - Preferred buyer marking
  - Contact preferences

### 4. Sales & Profit Tracking
- **Automatic Profit Calculation**: 
  - System calculates profit for each sale
  - Uses average cost from recent purchases
  - Shows profit amount and profit margin percentage
- **Visual Indicators**:
  - Green for positive profit
  - Red for negative profit
  - Profit margin percentage displayed

### 5. Dashboard Analytics
- **Financial Overview**:
  - Total Revenue (from sales)
  - Total Purchases (cost of goods)
  - Net Profit
  - Profit Margin %
- **Activity Tracking**:
  - Recent purchases
  - Recent sales
  - Business statistics

## Workflow Example

### Step 1: Add a Seller
1. Go to "Sellers" page
2. Click "Add Seller"
3. Enter seller information (name, phone, email, etc.)
4. Save

### Step 2: Record a Purchase
1. Go to "Purchases" page
2. Click "Add Purchase"
3. Select the seller
4. Choose purchase method (Online or In-Person)
5. Add products:
   - Select product
   - Enter quantity
   - Enter price per unit
   - Add expiration date (optional)
   - Add lot number (optional)
6. Save purchase

### Step 3: Record a Sale
1. Go to "Sales" page
2. Click "Add Sale"
3. Select a buyer from your buyers list
4. Add products:
   - Select product
   - Enter quantity
   - Enter selling price per unit
5. **Profit is automatically calculated** based on your purchase costs
6. Save sale

### Step 4: View Profit
- **On Sales Page**: Each sale shows profit and profit margin
- **On Dashboard**: Overall profit and profit margin for all sales

## Profit Calculation

The system calculates profit using:
1. **Sale Price**: What you sold the product for
2. **Cost Basis**: Average cost from your recent purchases of that product
3. **Profit**: Sale Price - Cost Basis
4. **Profit Margin**: (Profit / Sale Price) × 100

This ensures you always know:
- How much profit you made on each sale
- Your overall business profitability
- Which products are most profitable

## Database Schema Updates

### Purchase Model
- Added `purchaseMethod` field: "online" or "in-person"

### Sale Model
- Added `profit` field: Calculated profit amount
- Added `profitMargin` field: Profit margin percentage

### Customer Model
- Added `purchaseMethod` field: Default purchase method preference

## Next Steps

1. **Update Database**:
   ```bash
   cd backend
   npm run db:generate
   npm run db:push
   ```

2. **Start Using**:
   - Add your sellers
   - Record purchases (mark as online or in-person)
   - Record sales to buyers
   - Watch your profit grow!

## Tips

- **Record purchases immediately** after buying to ensure accurate profit calculations
- **Use purchase method** to track where you're finding the best deals
- **Check profit margins** regularly to optimize your pricing
- **Mark preferred buyers** to quickly identify your best customers




