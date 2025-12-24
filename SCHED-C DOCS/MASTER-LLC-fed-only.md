# Master Federal LLC Filing Guide (2021–2025)

This document isolates **Federal (IRS)** requirements for Disregarded Entity LLCs. It is a subset of the logic found in the **MASTER LLC Architecture** doc.

---

### 1. Federal Data Flow Engine

| Phase | Action | IRS Logic / Rule |
| --- | --- | --- |
| **I: Net Profit** | **Sch C** | Total Revenue - Expenses = Line 31 (Net Profit). |
| **II: Tax Base** | **Sch SE** | L31 * 0.9235 = Taxable SE Earnings. |
| **III: Income Link** | **Sch 1** | L31 profit flows to Part I, Line 3 (Total Income). |
| **IV: SE Tax** | **Sch 2** | (SE Earnings * 15.3%) = SE Tax added to total liability. |
| **V: AGI Adjust** | **Sch 1** | 50% of SE Tax from Sch SE flows to Part II, Line 15. |
| **VI: QBI** | **Form 8995** | (Sch C Profit - 1/2 SE Tax) * 20% = Deduction (1040 L13). |

---

### 2. Mandatory Federal Repository (PDF & Instructions)

| Year | Form (PDF) | Instruction (PDF) | Logic Validation |
| --- | --- | --- | --- |
| **2021** | [Sch C](https://www.irs.gov/pub/irs-prior/f1040sc--2021.pdf) / [SE](https://www.irs.gov/pub/irs-prior/f1040sse--2021.pdf) | [2021 Inst](https://www.irs.gov/pub/irs-prior/i1040sc--2021.pdf) | Mileage: 56.0¢ |
| **2022** | [Sch C](https://www.irs.gov/pub/irs-prior/f1040sc--2022.pdf) / [SE](https://www.irs.gov/pub/irs-prior/f1040sse--2022.pdf) | [2022 Inst](https://www.irs.gov/pub/irs-prior/i1040sc--2022.pdf) | Split Mileage (H1/H2) |
| **2023** | [Sch C](https://www.irs.gov/pub/irs-prior/f1040sc--2023.pdf) / [SE](https://www.irs.gov/pub/irs-prior/f1040sse--2023.pdf) | [2023 Inst](https://www.irs.gov/pub/irs-prior/i1040sc--2023.pdf) | Mileage: 65.5¢ |
| **2024** | [Sch C](https://www.irs.gov/pub/irs-pdf/f1040sc.pdf) / [SE](https://www.irs.gov/pub/irs-pdf/f1040sse.pdf) | [2024 Inst](https://www.irs.gov/pub/irs-pdf/i1040sc.pdf) | **Joint Filing** |
| **2025** | [Sch C](https://www.irs.gov/pub/irs-pdf/f1040sc.pdf)* | [2025 Inst](https://www.irs.gov/pub/irs-pdf/i1040sc.pdf)* | Mileage: 70.0¢ |

**Links reflect current year rolling documents.*

---

### 3. Critical MO-State Linkage

While this guide is Fed-centric, the following links to the Missouri (MO-1040) return are mandatory:

* **Starting Point**: Missouri uses your Federal Adjusted Gross Income (AGI) from **1040 Line 11** as the base for **MO-1040 Line 1**.
* **MO-A Adjustments**: Missouri-sourced business profit (Sch C L31) qualifies for a 20% (15% in 2021) state-level deduction under **RSMo 143.022**.
* **Attachment Requirement**: A full copy of your Federal 1040 and all supporting schedules (specifically Schedule C) **must** be attached to the paper or electronic MO-1040 return.

---

### 4. Summary of Intertwined Logic

* **Qualified Business Income (QBI)**: Directly impacted by Schedule C profit; reduces Federal taxable income but does not reduce SE Tax.
* **Qualified Joint Venture (QJV)**: Only for 2024–25 (MFJ); allows spouses to split Sch C income rather than filing a Partnership 1065.

**For full Federal/Missouri year-over-year logic mapping, mileage rate tables, and annual thresholds, see the MASTER LLC Architecture doc.**


---

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

