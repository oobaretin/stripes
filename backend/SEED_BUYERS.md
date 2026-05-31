# Importing Buyers from Google Sheets

This document explains how to import buyers from the Google Sheets buyers list into your application.

## Database Schema Updates

The Buyer model has been enhanced with the following fields from the Google Sheets:

- `paymentEmail` - Email address for payment invoices
- `priceSheetUrl` - URL or instructions for accessing price sheets
- `bestFormOfContact` - Preferred contact method (Email, Text, Phone, etc.)
- `facebookLink` - Facebook profile or page URL
- `removeLabels` - Boolean indicating if labels should be removed
- `reachOutPriorToInvoicing` - Boolean indicating if you should contact before invoicing
- `paymentMethods` - Accepted payment methods (PayPal, Wire, ACH, etc.)
- `isPreferred` - Boolean marking preferred buyers

## Importing Buyers

### Step 1: Update Database Schema

First, you need to update your database schema to include the new fields:

```bash
cd backend
npm run db:generate
npm run db:push
```

### Step 2: Run the Seed Script

The seed script will import all buyers from the Google Sheets:

```bash
cd backend
npm run seed:buyers
```

This will:
- Parse buyer names into firstName and lastName
- Parse addresses into street, city, state, and zipCode
- Import all buyer information including payment details, contact preferences, and payment methods
- Mark preferred buyers appropriately

### Step 3: Verify Import

You can verify the import by:
1. Starting the application
2. Navigating to the Buyers page
3. Checking that all buyers are listed with their complete information

## Buyers Included

The seed script includes the following buyers from the Google Sheets:

1. **Northeast Medical Exchange** - Preferred buyer
2. **Charles Harris (The Diabetic Test Strip Guys)** - Preferred buyer
3. **Chris Sampson (First Class Med Supply)**
4. **PATH MEDICAL SUPPLY** - Preferred buyer
5. **Ralphel Walton (Prestige Medical Supply LLC)**

## Updating Buyers

You can update buyer information in two ways:

1. **Through the UI**: Edit buyers directly in the Buyers page
2. **Update the seed script**: Modify `backend/src/scripts/seedBuyers.ts` and re-run the seed script

## Notes

- The seed script uses `upsert` logic, so running it multiple times won't create duplicates
- Buyers are matched by phone number or payment email
- If a buyer already exists, their information will be updated with the latest data from the seed script




