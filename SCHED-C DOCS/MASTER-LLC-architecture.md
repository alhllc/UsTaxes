# Master Federal & Missouri LLC Filing Architecture (2021–2025)

```yaml
system: Tax_Logic_v1.1
scope: Fed_1040 + MO_1040 + LLC_SchC
years: [2021, 2022, 2023, 2024, 2025]
filing_status: {2021-23: Indiv/MFS, 2024-25: MFJ/Joint}

logic_flow:
  1_primary: "Business Revenue -> Sch C [Net Profit (L31)]"
  2_linkage: "Sch C (L31) -> Sch 1 (L3) AND Sch SE (L2)"
  3_taxation: "Sch SE -> Self-Employment Tax (L12) [Flows to Sch 2 (L4)]"
  4_adjustment: "Sch SE (L12) * 0.5 -> Sch 1 (L15) [Deduction for SE Tax]"
  5_qbi: "20% * (Sch C Profit - 1/2 SE Tax) -> Form 8995 -> 1040 (L13)"
  6_state: "Fed AGI (1040 L11) -> MO-1040 (L1) [Start of MO Return]"

annual_variables:
  mileage_rates: 
    2021: 56.0¢
    2022: 58.5¢ (Jan-Jun) / 62.5¢ (Jul-Dec)
    2023: 65.5¢
    2024: 67.0¢
    2025: 70.0¢
  se_ss_cap:
    2021: $142,800 | 2022: $147,000 | 2023: $160,200 | 2024: $168,600 | 2025: $176,100

```

---

### Centralized Document Repository (2021–2025)

| Year | Federal Forms (PDF) | MO Forms (PDF) | Logic Validation |
| --- | --- | --- | --- |
| **2021** | [SchC](https://www.irs.gov/pub/irs-prior/f1040sc--2021.pdf) / [SE](https://www.irs.gov/pub/irs-prior/f1040sse--2021.pdf) / [1040](https://www.irs.gov/pub/irs-prior/f1040--2021.pdf) | [MO-1040](https://www.google.com/search?q=https://dor.mo.gov/forms/MO-1040_2021.pdf) / [MO-A](https://dor.mo.gov/forms/MO-A_2021.pdf) | **Verified**: L1 linkage static |
| **2022** | [SchC](https://www.irs.gov/pub/irs-prior/f1040sc--2022.pdf) / [SE](https://www.irs.gov/pub/irs-prior/f1040sse--2022.pdf) / [1040](https://www.irs.gov/pub/irs-prior/f1040--2022.pdf) | [MO-1040](https://www.google.com/search?q=https://dor.mo.gov/forms/MO-1040_2022.pdf) / [MO-A](https://dor.mo.gov/forms/MO-A_2022.pdf) | **Verified**: Mileage split req. |
| **2023** | [SchC](https://www.irs.gov/pub/irs-prior/f1040sc--2023.pdf) / [SE](https://www.irs.gov/pub/irs-prior/f1040sse--2023.pdf) / [1040](https://www.irs.gov/pub/irs-prior/f1040--2023.pdf) | [MO-1040](https://www.google.com/search?q=https://dor.mo.gov/forms/MO-1040_2023.pdf) / [MO-A](https://dor.mo.gov/forms/MO-A_2023.pdf) | **Verified**: Sch 1 L8z additions |
| **2024** | [SchC](https://www.irs.gov/pub/irs-pdf/f1040sc.pdf) / [SE](https://www.irs.gov/pub/irs-pdf/f1040sse.pdf) / [1040](https://www.irs.gov/pub/irs-pdf/f1040.pdf) | [MO-1040](https://www.google.com/search?q=https://dor.mo.gov/forms/MO-1040_2024.pdf) / [MO-A](https://dor.mo.gov/forms/MO-A_2024.pdf) | **Verified**: MFJ Joint status |
| **2025** | [SchC](https://www.irs.gov/pub/irs-pdf/f1040sc.pdf)* / [SE](https://www.irs.gov/pub/irs-pdf/f1040sse.pdf)* | [MO-1040](https://www.google.com/search?q=https://dor.mo.gov/forms/MO-1040_2024.pdf)* | **Est**: Forms pending final pub |

**Note: 2024 links often point to the "Current" version which applies to 2025 until new PDFs generate in Dec/Jan.*

---

### 100% Intertwined Logic Manifest (Sch C Focus)

#### 1. The "Flow-Through" Chain

* **Revenue/Expense Entry**: Total Net Profit recorded on **Sch C, Line 31**.
* **Tax Calculation (Federal)**:
* Line 31 → **Sch SE, Line 2**. Multiply by `0.9235` then `0.153` (if < SS Cap).
* Total SE Tax → **Sch 2, Line 4** (Add to Tax).
* 50% SE Tax → **Sch 1, Line 15** (Subtract from Income).





* **Tax Calculation (Missouri)**:
* Fed AGI → **MO-1040, Line 1**.
* **MO Business Income Deduction**: MO-A allows a subtraction of up to **20%** of Missouri-sourced business income (RSMo 143.022). Use **Form MO-PTE/PTE-BD** for verification.
* **FIT Deduction**: Missouri allows a deduction for "Federal Income Tax Paid" (not withheld). Use MO worksheet to calculate based on Fed 1040 total tax minus credits.



#### 2. The QBI (Qualified Business Income) Loop

* **Calculation**: `(Sch C Profit - 1/2 SE Tax - SE Health Ins - Qualified Retirement) * 20%`.
* **Placement**: Form 8995, results flow to **1040, Line 13**.
* **Validation**: Only applies to income below the tax bracket thresholds (see table above).

#### 3. Home Office & Asset Logic

* **Form 8829**: Subtracts actual/simplified home costs from Sch C gross profit.
* **Form 4562**: Required for any asset (laptop, vehicle) > $2,500. Depreciation flows to **Sch C, Line 13**.

#### 4. Qualified Joint Venture (QJV) Rule (2024-2025 Only)

* **Logic**: Spouses in MFJ status file **two** Schedule Cs (50/50 split or otherwise).
* **Purpose**: Credits both social security accounts without filing a 1065 Partnership return.

> **Sources**: [IRS Publication 334 (Small Business Guide)](https://www.irs.gov/publications/p334), [MO RSMo 143.022](https://revisor.mo.gov/main/OneSection.aspx?section=143.022).



# Comprehensive Schema Mapping Table

Matches every concept in the **MASTER Doc** (Markdown) to the **Repo Code** (TypeScript) and **IRS XML** (MeF).

| Doc Concept | Repo Schema (Internal `src/`) | IRS MeF Schema (XML Tag) | Logic Note |
| --- | --- | --- | --- |
| **Business Revenue** | `ScheduleC.l1()` | `<TotalGrossReceiptsAmt>` | Raw income before expenses. |
| **Sch C Net Profit** | `ScheduleC.l31()` | `<NetProfitLossAmt>` | Critical value; flows to Sch 1 & SE. |
| **Sch C Expenses** | `ScheduleC.l28()` | `<TotalOtherExpensesAmt>` | Sum of lines 8-27b. |
| **Home Office Ded.** | `ScheduleC.l30()` | `<BusinessUseOfHomeDeduction>` | Calculated via Form 8829 logic. |
| **Vehicle Expenses** | `ScheduleC.l9()` | `<CarAndTruckExpensesAmt>` | Based on mileage rates in Master Doc. |
| **Sch SE Tax Base** | `ScheduleSE.l2()` | `<NetNonFarmProfitLossAmt>` | Must equal Sch C Line 31. |
| **SE Taxable Income** | `ScheduleSE.l6()` | `<EarningsSubjectToSocialSecAmt>` | Capped at SS Wage Base ($168.6k in '24). |
| **SE Tax** | `ScheduleSE.l12()` | `<SelfEmploymentTaxAmt>` | 15.3% calculation. Flows to `Sch2.l4()`. |
| **SE Tax Deduction** | `ScheduleSE.l13()` | `<DeductionForSETaxAmt>` | 50% of SE Tax. Flows to `Sch1.l15()`. |
| **Add. Income (Biz)** | `Schedule1.l3()` | `<BusinessIncomeLossAmt>` | Maps Sch C Net Profit to 1040. |
| **QBI Deduction** | `F8995.l15()` | `<TotalQBIDeductionAmt>` | 20% pass-through deduction. |
| **Fed AGI** | `F1040.l11()` | `<AdjustedGrossIncomeAmt>` | **Missouri Hook**: MO-1040 Line 1 source. |
| **Total Tax** | `F1040.l24()` | `<TotalTaxAmt>` | Used for MO "Federal Tax Paid" deduction. |
| **Filing Status** | `Information.filingStatus` | `<FilingStatus>` | '2' = MFJ (Joint), '1' = Single. |
| **Taxpayer Name** | `Person.firstName` | `<FirstName>` | Required on all schedules. |
