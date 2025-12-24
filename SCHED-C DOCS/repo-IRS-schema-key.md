`rule invoked: maximize information density`

### 1. TypeScript Bridge Interface (`Repo -> IRS MeF XML`)

This TypeScript definition acts as a translation layer, strictly typing how internal `ustaxes` class methods map to the IRS Modernized e-File (MeF) XML schema.

```typescript
/**
 * Bridge: Repo Schema (ustaxes) -> IRS MeF XML Schema (MeF)
 * Purpose: Transforms calculated class values into submission-ready XML structures.
 */

// Import form classes (inferred from repo structure)
import { F1040 } from '../forms/Y2024/irsForms/F1040';
import { ScheduleC } from '../forms/Y2024/irsForms/ScheduleC';
import { ScheduleSE } from '../forms/Y2024/irsForms/ScheduleSE';
import { F8995 } from '../forms/Y2024/irsForms/F8995';

// ---------------------------------------------------------------------------
// 1. Schedule C Bridge (Profit/Loss)
// ---------------------------------------------------------------------------
export interface MeF_IRS1040ScheduleC {
  ProprietorName: string;              // Map: state.taxPayer.primaryPerson.firstName + lastName
  ProprietorSSN: string;               // Map: state.taxPayer.primaryPerson.ssid
  BusinessName?: string;               // Map: state.taxPayer.businessName (if distinct)
  TotalGrossReceiptsAmt: number;       // Map: scheduleC.l1() ("Business Revenue")
  CostOfGoodsSoldAmt?: number;         // Map: scheduleC.l4()
  GrossProfitAmt: number;              // Map: scheduleC.l5()
  TotalOtherExpensesAmt?: number;      // Map: scheduleC.l27a()
  NetProfitLossAmt: number;            // Map: scheduleC.l31() ("Net Profit")
  BusinessUseOfHomeDeduction?: number; // Map: scheduleC.l30() (derived from Form 8829)
}

// ---------------------------------------------------------------------------
// 2. Schedule SE Bridge (Self-Employment Tax)
// ---------------------------------------------------------------------------
export interface MeF_IRS1040ScheduleSE {
  SSN: string;
  NetFarmProfitLossAmt?: number;       // Map: scheduleSE.l1a() (Usually 0)
  NetNonFarmProfitLossAmt: number;     // Map: scheduleSE.l2() (Matches Sch C L31)
  CombinedNetEarningsAmt: number;      // Map: scheduleSE.l3()
  SelfEmploymentTaxAmt: number;        // Map: scheduleSE.l12() ("SE Tax")
  DeductionForSETaxAmt: number;        // Map: scheduleSE.l13() ("50% Deduction")
}

// ---------------------------------------------------------------------------
// 3. Form 8995 Bridge (QBI Deduction)
// ---------------------------------------------------------------------------
export interface MeF_IRS8995 {
  NetQualifiedBusinessIncomeAmt: number; // Map: f8995.l1ii() (Column B)
  TotalQBIDeductionAmt: number;          // Map: f8995.l15() ("QBI Deduction")
}

// ---------------------------------------------------------------------------
// 4. Form 1040 Main Bridge
// ---------------------------------------------------------------------------
export interface MeF_IRS1040 {
  FilingStatus: '1' | '2' | '3' | '4' | '5'; // Map: state.taxPayer.filingStatus (2=MFJ)
  TotalIncomeAmt: number;                    // Map: f1040.l9()
  AdjustedGrossIncomeAmt: number;            // Map: f1040.l11() ("Fed AGI")
  TaxableIncomeAmt: number;                  // Map: f1040.l15()
  TotalTaxAmt: number;                       // Map: f1040.l24() ("Total Tax")
  RefundAmt?: number;                        // Map: f1040.l35a()
  AmountOwed?: number;                       // Map: f1040.l37()
}

// ---------------------------------------------------------------------------
// Aggregation Function
// ---------------------------------------------------------------------------
export const mapToMeF = (f1040: F1040): {
  IRS1040: MeF_IRS1040,
  IRS1040ScheduleC: MeF_IRS1040ScheduleC[],
  IRS1040ScheduleSE: MeF_IRS1040ScheduleSE,
  IRS8995?: MeF_IRS8995
} => {
  const schC = f1040.scheduleC; // Assuming attached instance
  const schSE = f1040.scheduleSE;
  const f8995 = f1040.f8995;

  return {
    IRS1040: {
      FilingStatus: f1040.state.taxPayer.filingStatus === 'MarriedFilingJointly' ? '2' : '1',
      TotalIncomeAmt: f1040.l9(),
      AdjustedGrossIncomeAmt: f1040.l11(),
      TaxableIncomeAmt: f1040.l15(),
      TotalTaxAmt: f1040.l24()
    },
    IRS1040ScheduleC: [{
      ProprietorName: `${f1040.state.taxPayer.primaryPerson.firstName} ${f1040.state.taxPayer.primaryPerson.lastName}`,
      ProprietorSSN: f1040.state.taxPayer.primaryPerson.ssid,
      TotalGrossReceiptsAmt: schC?.l1() ?? 0,
      GrossProfitAmt: schC?.l5() ?? 0,
      NetProfitLossAmt: schC?.l31() ?? 0,
      BusinessUseOfHomeDeduction: schC?.l30()
    }],
    IRS1040ScheduleSE: {
      SSN: f1040.state.taxPayer.primaryPerson.ssid,
      NetNonFarmProfitLossAmt: schSE?.l2() ?? 0,
      CombinedNetEarningsAmt: schSE?.l3() ?? 0,
      SelfEmploymentTaxAmt: schSE?.l12() ?? 0,
      DeductionForSETaxAmt: schSE?.l13() ?? 0
    },
    IRS8995: f8995 ? {
      NetQualifiedBusinessIncomeAmt: f8995.l1ii() ?? 0,
      TotalQBIDeductionAmt: f8995.l15() ?? 0
    } : undefined
  };
};

```

---

### 2. Comprehensive Schema Mapping Table

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

- TODO: harvest XML data (field names) from IRS.gov PDFs, map to this table == full pipeline mapping of schedC fields

### Key Intertwined Logic Definitions

* **Repo**: The repository typically defines these linkages in the `constructor` or getter methods. For example, `Schedule1.ts` instantiates `new ScheduleC(state)` to pull `l31()` into `l3()`.
* **IRS XML**: The XML is "flat" in transmission but "relational" in validation. The IRS server (MeF) runs business rules checking that `<NetProfitLossAmt>` in `IRS1040ScheduleC` equals `<NetNonFarmProfitLossAmt>` in `IRS1040ScheduleSE`.
* **Docs**: The docs describe the *legal* necessity of these links (e.g., "Must check box 32a"), which maps to boolean flags in the Repo (e.g., `ScheduleC.l32a`).