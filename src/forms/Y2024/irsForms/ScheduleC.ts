import F1040Attachment from './F1040Attachment'
import { Field } from 'ustaxes/core/pdfFiller'
import { FormTag } from 'ustaxes/core/irsForms/Form'
import { ScheduleC as ScheduleCData, PersonRole } from 'ustaxes/core/data'
import { sumFields } from 'ustaxes/core/irsForms/util'
import F1040 from './F1040'

export default class ScheduleC extends F1040Attachment {
  tag: FormTag = 'f1040sc'
  sequenceIndex = 9

  data: ScheduleCData
  index: number

  constructor(f1040: F1040, data?: ScheduleCData, index: number = 0) {
    super(f1040)
    // If data is not provided, default to the first Schedule C if available,
    // otherwise fallback to a default/undefined state (handled gracefully in methods).
    // Note: The memory says "default to the first instance (index 0) if undefined".
    if (data) {
        this.data = data
    } else if (f1040.info.scheduleCs.length > 0) {
        this.data = f1040.info.scheduleCs[0]
    } else {
        // Fallback for initialization before data is populated or empty state
        // This assumes some data structure exists, but fields might be undefined.
        // We cast to ScheduleCData to satisfy TS, knowing optional chaining is used.
        this.data = {} as ScheduleCData
    }
    this.index = index
  }

  isNeeded = (): boolean => {
    // Only needed if there is data populated
    return !!this.schC().businessName || !!this.schC().grossReceipts
  }

  copies = (): ScheduleC[] => {
    // Return copies for other Schedule Cs if this is the first one
    if (this.index === 0) {
        return this.f1040.info.scheduleCs
            .slice(1)
            .map((data, i) => new ScheduleC(this.f1040, data, i + 1))
    }
    return []
  }

  schC = (): ScheduleCData => this.data

  /// Header
  name = (): string | undefined => {
      const person = this.schC().personRole === PersonRole.SPOUSE
        ? this.f1040.info.taxPayer.spouse
        : this.f1040.info.taxPayer.primaryPerson

      return person ? `${person.firstName} ${person.lastName}` : undefined
  }

  ssn = (): string | undefined => {
      const person = this.schC().personRole === PersonRole.SPOUSE
        ? this.f1040.info.taxPayer.spouse
        : this.f1040.info.taxPayer.primaryPerson
      return person?.ssid
  }

  businessName = (): string | undefined => this.schC().businessName

  businessAddress = (): string | undefined => this.schC().businessAddress?.address

  businessCityStateZip = (): string | undefined => {
      const addr = this.schC().businessAddress
      if (!addr) return undefined
      return `${addr.city}, ${addr.state ?? ''} ${addr.zip ?? ''}`
  }

  principalBusiness = (): string | undefined => undefined // TODO
  businessCode = (): string | undefined => this.schC().businessCode
  ein = (): string | undefined => this.schC().ein

  accountingMethod = (): { select: number } | undefined => {
      switch(this.schC().accountingMethod) {
          case 'Cash': return { select: 0 }
          case 'Accrual': return { select: 1 }
          case 'Other': return { select: 2 }
      }
      return undefined
  }

  accountingMethodOther = (): string | undefined => this.schC().accountingMethodOther

  materiallyParticipate = (): { select: number } | undefined =>
      this.schC().materiallyParticipate ? { select: 0 } : { select: 1 }

  startedCurrentYear = (): boolean | undefined => this.schC().startedCurrentYear

  payments1099 = (): { select: number } | undefined => undefined // TODO
  filed1099 = (): { select: number } | undefined => undefined // TODO
  statutoryEmployee = (): boolean | undefined => undefined // TODO

  /// Part I: Income
  l1 = (): number | undefined => this.schC().grossReceipts
  l2 = (): number | undefined => this.schC().returnsAndAllowances
  l3 = (): number | undefined => (this.l1() ?? 0) - (this.l2() ?? 0)
  l4 = (): number | undefined => this.l42()
  l5 = (): number | undefined => (this.l3() ?? 0) - (this.l4() ?? 0)
  l6 = (): number | undefined => this.schC().otherIncome
  l7 = (): number | undefined => (this.l5() ?? 0) + (this.l6() ?? 0)

  /// Part II: Expenses
  l8 = (): number | undefined => this.schC().expenses?.advertising
  l9 = (): number | undefined => this.vehicleDeduction()
  l10 = (): number | undefined => this.schC().expenses?.commissions
  l11 = (): number | undefined => this.schC().expenses?.contractLabor
  l12 = (): number | undefined => this.schC().expenses?.depletion
  l13 = (): number | undefined => this.schC().expenses?.depreciation
  l14 = (): number | undefined => this.schC().expenses?.employeeBenefitPrograms
  l15 = (): number | undefined => this.schC().expenses?.insurance
  l16a = (): number | undefined => this.schC().expenses?.mortgageInterest
  l16b = (): number | undefined => this.schC().expenses?.otherInterest
  l17 = (): number | undefined => this.schC().expenses?.legalAndProfessional
  l18 = (): number | undefined => this.schC().expenses?.officeExpense
  l19 = (): number | undefined => this.schC().expenses?.pensionAndProfitSharing
  l20a = (): number | undefined => this.schC().expenses?.rentOrLeaseVehicles
  l20b = (): number | undefined => this.schC().expenses?.rentOrLeaseOther
  l21 = (): number | undefined => this.schC().expenses?.repairsAndMaintenance
  l22 = (): number | undefined => this.schC().expenses?.supplies
  l23 = (): number | undefined => this.schC().expenses?.taxesAndLicenses
  l24a = (): number | undefined => this.schC().expenses?.travel
  l24b = (): number | undefined => this.schC().expenses?.meals
  l25 = (): number | undefined => this.schC().expenses?.utilities
  l26 = (): number | undefined => this.schC().expenses?.wages
  l27a = (): number | undefined => this.l48()
  l27b = (): number | undefined => undefined

  l28 = (): number =>
    sumFields([
      this.l8(),
      this.l9(),
      this.l10(),
      this.l11(),
      this.l12(),
      this.l13(),
      this.l14(),
      this.l15(),
      this.l16a(),
      this.l16b(),
      this.l17(),
      this.l18(),
      this.l19(),
      this.l20a(),
      this.l20b(),
      this.l21(),
      this.l22(),
      this.l23(),
      this.l24a(),
      this.l24b(),
      this.l25(),
      this.l26(),
      this.l27a(),
      this.l27b()
    ])

  l29 = (): number => (this.l7() ?? 0) - this.l28()

  l30_simplified = (): number | undefined => {
    const homeOffice = this.schC().homeOffice
    if (homeOffice?.method === 'simplified') {
      const rate = 5
      const area = Math.min(homeOffice.areaUsed ?? 0, 300)
      return area * rate
    }
    return undefined
  }

  l30 = (): number | undefined => {
    if (this.schC().homeOffice?.expenses) {
      // TODO: Form 8829 support
      return undefined
    }
    return this.l30_simplified()
  }

  l31 = (): number => {
    const tentativeProfit = this.l29()
    const homeOfficeDeduction = this.l30() ?? 0
    return tentativeProfit - homeOfficeDeduction
  }
  l32 = (): { select: number } | undefined => undefined // Investment at risk. TODO: Form 6198 support.


  /// Part III: Cost of Goods Sold
  cogs = () => this.schC().costOfGoods

  l33 = (): { select: number } | undefined => undefined // Method
  l34 = (): { select: number } | undefined => undefined // Change in quantities
  l35 = (): number | undefined => this.cogs()?.method ? this.cogs()?.openingInventory : undefined
  l36 = (): number | undefined => this.cogs()?.method ? this.cogs()?.purchases : undefined
  l37 = (): number | undefined => this.cogs()?.method ? this.cogs()?.costOfLabor : undefined
  l38 = (): number | undefined => this.cogs()?.method ? this.cogs()?.materialsAndSupplies : undefined
  l39 = (): number | undefined => this.cogs()?.method ? this.cogs()?.otherCosts : undefined
  l40 = (): number | undefined => this.cogs()?.method ? sumFields([this.l35(), this.l36(), this.l37(), this.l38(), this.l39()]) : undefined
  l41 = (): number | undefined => this.cogs()?.method ? this.cogs()?.closingInventory : undefined
  l42 = (): number | undefined => this.cogs()?.method ? (this.l40() ?? 0) - (this.l41() ?? 0) : undefined

  /// Part IV: Information on Your Vehicle
  vehicleDeduction = (): number | undefined => {
    const vehicles = this.schC().vehicleExpenses
    if (!vehicles || vehicles.length === 0) return undefined

    let totalDeduction = 0
    // 2024 Standard Mileage Rate: 67 cents per mile
    const rate = 0.67

    for (const v of vehicles) {
       if (v.businessMiles) {
         totalDeduction += v.businessMiles * rate
       }
    }

    return totalDeduction > 0 ? totalDeduction : undefined
  }

  l43 = (): string | undefined => undefined
  l44a = (): number | undefined => undefined
  l44b = (): number | undefined => undefined
  l44c = (): number | undefined => undefined
  l45 = (): { select: number } | undefined => undefined
  l46 = (): { select: number } | undefined => undefined
  l47a = (): { select: number } | undefined => undefined
  l47b = (): { select: number } | undefined => undefined

  // Part V: Other Expenses
  otherExpenses = (): Array<[string, number]> => {
      if (this.schC().otherExpenses) {
          return this.schC().otherExpenses.map(e => [e.description, e.amount])
      }
      return []
  }

  l48 = (): number | undefined => {
      const expenses = this.otherExpenses()
      if (expenses.length === 0) return undefined
      return expenses.reduce((acc, [, amount]) => acc + amount, 0)
  }

  partVRows = (): Array<string | number | undefined> => {
      const expenses = this.otherExpenses()
      const rows = []
      // 9 rows available
      for (let i = 0; i < 9; i++) {
          if (i < expenses.length) {
              rows.push(expenses[i][0])
              rows.push(expenses[i][1])
          } else {
              rows.push(undefined)
              rows.push(undefined)
          }
      }
      return rows
  }

  fields = (): Field[] => {
    return [
        this.name(),
        this.ssn(),
        this.principalBusiness(),
        this.businessCode(),
        this.businessName(),
        this.ein(),
        this.businessAddress(),
        this.businessCityStateZip(),
        this.accountingMethod(), // Radio 8-10
        this.accountingMethodOther(), // 11
        this.materiallyParticipate(), // Radio 12-13
        this.startedCurrentYear(), // Checkbox 14
        this.payments1099(), // Radio 15-16
        this.filed1099(), // Radio 17-18
        this.statutoryEmployee(), // Checkbox 19

        // Part I
        this.l1(),
        this.l2(),
        this.l3(),
        this.l4(),
        this.l5(),
        this.l6(),
        this.l7(),

        // Part II - Expenses
        this.l8(),
        this.l9(),
        this.l10(),
        this.l11(),
        this.l12(),
        this.l13(),
        this.l14(),
        this.l15(),
        this.l16a(),
        this.l16b(),
        this.l17(),
        this.l18(),
        this.l19(),
        this.l20a(),
        this.l20b(),
        this.l21(),
        this.l22(),
        this.l23(),
        this.l24a(),
        this.l24b(),
        this.l25(),
        this.l26(),
        this.l27a(),
        this.l28(),

        this.l29(),
        this.l30(),
        this.l31(),

        // Fields 54-56 (reserved/unused in PDF usually)
        undefined,
        undefined,
        undefined,

        this.l32(), // 57-58

        // Part III - COGS
        this.l33(), // 59-61 Radio
        this.l34(), // 62-63 Radio

        this.l35(),
        this.l36(),
        this.l37(),
        this.l38(),
        this.l39(),
        this.l40(),
        this.l41(),
        this.l42(),

        // Part IV - Vehicle
        this.l43(),
        this.l44a(),
        this.l44b(),
        this.l44c(),

        // Fields 76-77
        undefined,
        undefined,

        this.l45(), // 78-79 Radio
        this.l46(), // 80-81 Radio
        this.l47a(), // 82-83 Radio
        this.l47b(), // 84-85 Radio

        // Part V - Other Expenses Rows
        ...this.partVRows(),

        this.l48() // Total other expenses
    ]
  }
}
