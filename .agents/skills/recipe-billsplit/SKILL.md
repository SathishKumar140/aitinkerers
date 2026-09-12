---
name: recipe-billsplit
description: Splitwise-style group bill and expense splitting recipe. Itemizes shared expenses, calculates equal or custom shares with tax/tip, and produces simplified settlement matrices.
---

# Recipe: Splitwise Group Bill Splitting

Use this recipe when users want to track, divide, or settle shared expenses from dinners, outings, trips, or team activities.

## Core Capabilities
1. **Expense Ingestion**:
   - Parses total bill amounts, payer details, items ordered, tax, and service charge.
2. **Itemized or Equal Share Calculation**:
   - Computes individual shares accurately based on what each member consumed or an equal split.
3. **Debt Simplification ("Who Owes Whom")**:
   - Resolves all net balances into the minimal number of transactions (e.g. "Sathish owes Ramesh $45", "Alice owes Ramesh $40").
4. **Card Tools**:
   - `bill_split_card`: Native interactive card with total amount, paid by, individual share breakdown, and settlement action list.
