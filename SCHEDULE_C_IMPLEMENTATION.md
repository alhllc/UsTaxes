# Schedule C Implementation Report

## Status
Successfully implemented Schedule C support for Tax Year 2021.

### Features
- Data model extended to support `ScheduleC` entries in `Information`.
- Form filling logic implemented in `src/forms/Y2021/irsForms/ScheduleC.ts`.
- Support for multiple Schedule C attachments.
- Redux actions and reducers added for managing Schedule C data.
- Validation logic generated.

## Testing
- Unit tests added in `src/forms/Y2021/tests/ScheduleC.test.ts` verifying:
    - Attachment logic.
    - Gross Income calculations (Part I).
    - Total Expense calculations (Part II).
    - Net Profit calculations (Line 31).
- Existing regression tests passed.

## Normalized Schema for User Transaction Data

To ingest raw user transaction data into the application, it must be normalized into the `ScheduleC` interface defined in `src/core/data/index.ts`.

### Interface Definition

```typescript
export interface ScheduleC {
  personRole: PersonRole.PRIMARY | PersonRole.SPOUSE
  businessName?: string
  businessAddress?: Address
  businessCode?: string
  ein?: string
  accountingMethod: 'Cash' | 'Accrual' | 'Other'
  accountingMethodOther?: string
  materiallyParticipate: boolean
  startedCurrentYear: boolean
  grossReceipts: number
  returnsAndAllowances: number
  costOfGoodsSold: number
  otherIncome: number
  expenses: Partial<{ [K in ScheduleCExpenseTypeName]: number }>
  otherExpenses: { description: string; amount: number }[]
}
```

### Expense Types (`ScheduleCExpenseTypeName`)

The `expenses` object uses keys from the `ScheduleCExpenseType` enum:

- `advertising`
- `carAndTruck`
- `commissions`
- `contractLabor`
- `depletion`
- `depreciation`
- `employeeBenefitPrograms`
- `insurance`
- `mortgageInterest`
- `otherInterest`
- `legalAndProfessional`
- `officeExpense`
- `pensionAndProfitSharing`
- `rentOrLeaseVehicles`
- `rentOrLeaseOther`
- `repairsAndMaintenance`
- `supplies`
- `taxesAndLicenses`
- `travel`
- `meals`
- `utilities`
- `wages`
- `other`

Any expense not fitting these categories should be added to the `otherExpenses` array as an object with `description` and `amount`.
