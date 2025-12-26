import F1040Attachment from './F1040Attachment'
import { Field } from 'ustaxes/core/pdfFiller'
import { FormTag } from 'ustaxes/core/irsForms/Form'
import { sumFields } from 'ustaxes/core/irsForms/util'
import { ScheduleC as ScheduleCData, PersonRole } from 'ustaxes/core/data'
import F1040 from './F1040'
import F4562 from './F4562'
import F8829 from './F8829'

/**
 * Schedule C: Profit or Loss From Business (Sole Proprietorship)
 */
export default class ScheduleC extends F1040Attachment {
  tag: FormTag = 'f1040sc'
  sequenceIndex = 9

  data: ScheduleCData
  index: number

  constructor(f1040: F1040, data: ScheduleCData, index = 0) {
    super(f1040)
    this.data = data
    this.index = index
  }

  isNeeded = (): boolean => true

  copies = (): ScheduleC[] => {
    // Return copies for other Schedule Cs if this is the first one
    if (this.index === 0) {
        return this.f1040.info.scheduleCs
            .slice(1)
            .map((data, i) => new ScheduleC(this.f1040, data, i + 1))
    }
    return []
  }

  // Header
  name = (): string | undefined => {
      const person = this.data.personRole === PersonRole.SPOUSE
        ? this.f1040.info.taxPayer.spouse
        : this.f1040.info.taxPayer.primaryPerson

      return person ? `${person.firstName} ${person.lastName}` : undefined
  }

  ssn = (): string | undefined => {
      const person = this.data.personRole === PersonRole.SPOUSE
        ? this.f1040.info.taxPayer.spouse
        : this.f1040.info.taxPayer.primaryPerson
      return person?.ssid
  }

  businessName = (): string | undefined => this.data.businessName

  businessAddress = (): string | undefined => this.data.businessAddress?.address

  businessCityStateZip = (): string | undefined => {
      const addr = this.data.businessAddress
      if (!addr) return undefined
      return `${addr.city}, ${addr.state ?? ''} ${addr.zip ?? ''}`
  }

  principalBusiness = (): string | undefined => undefined // TODO: Add to data model
  businessCode = (): string | undefined => this.data.businessCode
  ein = (): string | undefined => this.data.ein

  accountingMethod = (): { select: number } | undefined => {
      switch(this.data.accountingMethod) {
          case 'Cash': return { select: 0 }
          case 'Accrual': return { select: 1 }
          case 'Other': return { select: 2 }
      }
      return undefined
  }

  accountingMethodOther = (): string | undefined => this.data.accountingMethodOther

  materiallyParticipate = (): { select: number } | undefined =>
      this.data.materiallyParticipate ? { select: 0 } : { select: 1 }

  started2021 = (): boolean | undefined => this.data.startedCurrentYear

  payments1099 = (): { select: number } | undefined =>
      this.data.payments1099 !== undefined
        ? this.data.payments1099
          ? { select: 0 }
          : { select: 1 }
        : undefined

  filed1099 = (): { select: number } | undefined =>
      this.data.filed1099 !== undefined
        ? this.data.filed1099
          ? { select: 0 }
          : { select: 1 }
        : undefined

  statutoryEmployee = (): boolean | undefined => this.data.statutoryEmployee

  // Part I: Income
  l1 = (): number | undefined => this.data.grossReceipts
  l2 = (): number | undefined => this.data.returnsAndAllowances
  l3 = (): number | undefined => {
    const l1 = this.l1()
    const l2 = this.l2()
    if (l1 === undefined && l2 === undefined) return undefined
    return (l1 ?? 0) - (l2 ?? 0)
  }
  l4 = (): number | undefined => this.l42() // Cost of goods sold
  l5 = (): number | undefined => {
    const l3 = this.l3()
    const l4 = this.l4()
    if (l3 === undefined && l4 === undefined) return undefined
    return (l3 ?? 0) - (l4 ?? 0)
  }
  l6 = (): number | undefined => this.data.otherIncome
  l7 = (): number | undefined => {
     const l5 = this.l5()
     const l6 = this.l6()
     if (l5 === undefined && l6 === undefined) return undefined
     return sumFields([l5, l6])
  }

  // Part II: Expenses
  l8 = (): number | undefined => this.data.expenses.advertising
  l9 = (): number | undefined => {
    if (this.data.vehicleExpenses && this.data.vehicleExpenses.length > 0) {
      return this.data.vehicleExpenses.reduce(
        (acc, v) => acc + (v.businessMiles ?? 0) * 0.56,
        0
      )
    }
    return this.data.expenses.carAndTruck
  }

  l10 = (): number | undefined => this.data.expenses.commissions
  l11 = (): number | undefined => this.data.expenses.contractLabor
  l12 = (): number | undefined => this.data.expenses.depletion
  l13 = (): number | undefined => {
    // Priority: Calculated from assets -> Manual Entry
    if (this.data.assets && this.data.assets.length > 0) {
      return new F4562(this.f1040, this.data).totalDepreciation()
    }
    return this.data.expenses.depreciation
  }
  l14 = (): number | undefined => this.data.expenses.employeeBenefitPrograms
  l15 = (): number | undefined => this.data.expenses.insurance
  l16a = (): number | undefined => this.data.expenses.mortgageInterest
  l16b = (): number | undefined => this.data.expenses.otherInterest
  l17 = (): number | undefined => this.data.expenses.legalAndProfessional
  l18 = (): number | undefined => this.data.expenses.officeExpense
  l19 = (): number | undefined => this.data.expenses.pensionAndProfitSharing
  l20a = (): number | undefined => this.data.expenses.rentOrLeaseVehicles
  l20b = (): number | undefined => this.data.expenses.rentOrLeaseOther
  l21 = (): number | undefined => this.data.expenses.repairsAndMaintenance
  l22 = (): number | undefined => this.data.expenses.supplies
  l23 = (): number | undefined => this.data.expenses.taxesAndLicenses
  l24a = (): number | undefined => this.data.expenses.travel
  l24b = (): number | undefined => this.data.expenses.meals
  l25 = (): number | undefined => this.data.expenses.utilities
  l26 = (): number | undefined => this.data.expenses.wages
  l27a = (): number | undefined => this.l48() // Other expenses
  l28 = (): number | undefined => {
      // Total expenses before business use of home
      return sumFields([
          this.l8(), this.l9(), this.l10(), this.l11(), this.l12(), this.l13(),
          this.l14(), this.l15(), this.l16a(), this.l16b(), this.l17(), this.l18(),
          this.l19(), this.l20a(), this.l20b(), this.l21(), this.l22(), this.l23(),
          this.l24a(), this.l24b(), this.l25(), this.l26(), this.l27a()
      ])
  }
  l29 = (): number | undefined => {
      const l7 = this.l7()
      const l28 = this.l28()
      if (l7 === undefined && l28 === undefined) return undefined
      return (l7 ?? 0) - (l28 ?? 0)
  }

  homeOfficeDeduction = (): number | undefined => {
    if (this.data.homeOffice?.method === 'simplified') {
        const area = Math.min(this.data.homeOffice.areaUsed ?? 0, 300)
        const rate = 5
        const tentativeDeduction = area * rate
        const limit = Math.max(0, this.l29() ?? 0)
        return Math.min(tentativeDeduction, limit)
    } else if (this.data.homeOffice?.method === 'actual') {
        return new F8829(this.f1040, this.data).allowableDeduction()
    }
    return undefined
  }

  l30 = (): number | undefined => this.homeOfficeDeduction()

  l31 = (): number | undefined => {
      const l29 = this.l29()
      const l30 = this.l30()
      if (l29 === undefined && l30 === undefined) return undefined
      return (l29 ?? 0) - (l30 ?? 0)
  }
  l32 = (): { select: number } | undefined => undefined // Investment at risk. TODO: Form 6198 support.

  // Part III: Cost of Goods Sold
  l33 = (): { select: number } | undefined => {
    switch (this.data.costOfGoods?.method) {
      case 'cost':
        return { select: 0 }
      case 'lowerOfCostOrMarket':
        return { select: 1 }
      case 'other':
        return { select: 2 }
    }
    return undefined
  }

  l34 = (): { select: number } | undefined => undefined // Change in quantities
  l35 = (): number | undefined => this.data.costOfGoods?.openingInventory // Inventory beginning
  l36 = (): number | undefined =>
    this.data.costOfGoods?.purchases ?? this.data.costOfGoodsSold
  l37 = (): number | undefined => this.data.costOfGoods?.costOfLabor // Cost of labor
  l38 = (): number | undefined => this.data.costOfGoods?.materialsAndSupplies // Materials and supplies
  l39 = (): number | undefined => this.data.costOfGoods?.otherCosts // Other costs
  l40 = (): number | undefined =>
    sumFields([
      this.l35(),
      this.l36(),
      this.l37(),
      this.l38(),
      this.l39()
    ])
  l41 = (): number | undefined => this.data.costOfGoods?.closingInventory // Inventory end
  l42 = (): number | undefined => {
      const l40 = this.l40()
      const l41 = this.l41()
      if (l40 === undefined && l41 === undefined) return undefined
      return (l40 ?? 0) - (l41 ?? 0)
  }

  // Part IV: Vehicle Information
  vehicle = () => this.data.vehicleExpenses?.[0]
  l43 = (): string | undefined => this.vehicle()?.datePlacedInService
  l44a = (): number | undefined => this.vehicle()?.businessMiles
  l44b = (): number | undefined => this.vehicle()?.commutingMiles
  l44c = (): number | undefined => this.vehicle()?.otherMiles
  l45 = (): { select: number } | undefined =>
    this.vehicle()?.availableForPersonalUse !== undefined
      ? this.vehicle()?.availableForPersonalUse
        ? { select: 0 }
        : { select: 1 }
      : undefined
  l46 = (): { select: number } | undefined =>
    this.vehicle()?.spouseAvailable !== undefined
      ? this.vehicle()?.spouseAvailable
        ? { select: 0 }
        : { select: 1 }
      : undefined
  l47a = (): { select: number } | undefined =>
    this.vehicle()?.evidenceSupported !== undefined
      ? this.vehicle()?.evidenceSupported
        ? { select: 0 }
        : { select: 1 }
      : undefined
  l47b = (): { select: number } | undefined =>
    this.vehicle()?.evidenceWritten !== undefined
      ? this.vehicle()?.evidenceWritten
        ? { select: 0 }
        : { select: 1 }
      : undefined

  // Part V: Other Expenses
  otherExpenses = (): Array<[string, number]> => {
      if (this.data.otherExpenses) {
          return this.data.otherExpenses.map(e => [e.description, e.amount])
      }
      return []
  }

  l48 = (): number | undefined => {
      const expenses = this.otherExpenses()
      if (expenses.length === 0) return undefined
      return expenses.reduce((acc, [, amount]) => acc + amount, 0)
  }

  // Helpers for Part V table
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
        this.started2021(), // Checkbox 14
        this.statutoryEmployee(), // Checkbox 15 (Statutory employee income reported on W-2?)
        this.payments1099(), // Radio 16-17
        this.filed1099(), // Radio 18-19

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

        // Fields 54-56 are likely unused/blank based on analysis or specific check boxes
        // Based on typical PDF order, one of these is likely the Simplified Method checkbox
        this.data.homeOffice?.method === 'simplified' ? true : undefined,
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

        // Fields 76-77 (f2_13, f2_14) - Unidentified text fields
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
