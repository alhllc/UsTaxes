`rule invoked: maximize information density`

### 1. Terminal Command: Tax Logic Automator

This script calculates Net Profit, SE Tax, and the 50% SE Deduction. Use it to verify manual entries for each back-filing year.

```bash
# Save as tax_calc.sh and run: bash tax_calc.sh [income] [expenses] [year]
# Usage: bash tax_calc.sh 50000 12000 2024

INCOME=$1
EXPENSES=$2
YEAR=$3

# logic: Sch C L31
NET_PROFIT=$(echo "$INCOME - $EXPENSES" | bc)

# logic: Sch SE L2 (92.35% of profit)
SE_BASE=$(echo "scale=2; $NET_PROFIT * 0.9235" | bc)

# logic: SE Tax Rate (15.3%)
SE_TAX=$(echo "scale=2; $SE_BASE * 0.153" | bc)

# logic: Sch 1 L15 (50% Deduction)
SE_DED=$(echo "scale=2; $SE_TAX / 2" | bc)

echo "--- $YEAR TAX SUMMARY ---"
echo "Sch C Net Profit:   \$$NET_PROFIT"
echo "Sch SE Base:       \$$SE_BASE"
echo "SE Tax (Sch 2):    \$$SE_TAX"
echo "SE Deduction (S1): \$$SE_DED"

```

---

### 2. CSV Template: Sch C Expense Categories

Format your ledger with these headers to align with the IRS Schedule C Part II lines.

```csv
Date,Category,Description,Amount,IRS_Line_Reference
2024-01-15,Advertising,Google Ads,500.00,8
2024-02-10,Supplies,Laptop case,45.00,22
2024-03-01,Legal,LLC Filing Fee,105.00,17
2024-03-15,Utilities,Internet (Business %),60.00,25
2024-04-01,Travel,Hotel for Conference,300.00,24a
2024-05-01,Meals,Client Dinner (50%),50.00,24b
2024-06-01,HomeOffice,Square Footage Allocation,1200.00,30

```

---

### 3. Comprehensive Logic Intertwine (Refactored)

| Form | Logic/Dependency | Action |
| --- | --- | --- |
| **Sch C** | Gross Income - Expenses = Line 31 | Primary source of truth. |
| **Sch SE** | (L31 * 0.9235) * 0.153 | Calculates SE Tax for 1040 Sch 2. |
| **Sch 1** | Line 3 (Profit) & Line 15 (50% SE Tax) | Adjusts total income (AGI). |
| **Form 8995** | (Sch C Profit - 1/2 SE Tax) * 20% | QBI Deduction on 1040 Line 13. |
| **MO-A** | (Sch C Profit * 0.20) | Missouri Business Income Deduction. |
| **MO-1040** | Fed AGI - (MO-A Subtractions) | Calculates final Missouri tax. |

### 4. Verified Source Links

* **IRS Instructions**: [Schedule C (2024)](https://www.irs.gov/instructions/i1040sc) - Confirms Line 31 profit flow.
* **Missouri DOR**: [Form MO-A (2024)](https://dor.mo.gov/forms/MO-A_2024.pdf) - Confirms the Business Income Deduction worksheet (Line 17).
* **TaxAct**: [CSV Guidance](https://www.taxact.com/support/882/form-1099-b-create-your-own-spreadsheet-csv-file) - Confirms standard header requirements for tax imports.