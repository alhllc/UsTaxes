import F1040Attachment from './F1040Attachment'
import { Field } from 'ustaxes/core/pdfFiller'
import { FormTag } from 'ustaxes/core/irsForms/Form'
import { sumFields } from 'ustaxes/core/irsForms/util'
import { ScheduleC as ScheduleCData, PersonRole } from 'ustaxes/core/data'
import F1040 from './F1040'

/**
 * Schedule C: Profit or Loss From Business (Sole Proprietorship)
 */
export default class ScheduleC extends F1040Attachment {
  tag: FormTag = 'f1040sc'
  sequenceIndex = 9

  data: ScheduleCData
  index: number

  constructor(f1040: F1040, data: ScheduleCData, index: number = 0) {
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
    const person =
      this.data.personRole === PersonRole.SPOUSE
        ? this.f1040.info.taxPayer.spouse
        : this.f1040.info.taxPayer.primaryPerson

    return person ? `${person.firstName} ${person.lastName}` : undefined
  }

  ssn = (): string | undefined => {
    const person =
      this.data.personRole === PersonRole.SPOUSE
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
    switch (this.data.accountingMethod) {
      case 'Cash':
        return { select: 0 }
      case 'Accrual':
        return { select: 1 }
      case 'Other':
        return { select: 2 }
    }
    return undefined
  }

  accountingMethodOther = (): string | undefined =>
    this.data.accountingMethodOther

  materiallyParticipate = (): { select: number } | undefined =>
    this.data.materiallyParticipate ? { select: 0 } : { select: 1 }

  started2021 = (): boolean | undefined => this.data.startedCurrentYear

  payments1099 = (): { select: number } | undefined => undefined // TODO: Add to data model
  filed1099 = (): { select: number } | undefined => undefined // TODO: Add to data model
  statutoryEmployee = (): boolean | undefined => undefined // TODO: Add to data model

  // Helper: Cost of Goods Sold (Part III)
  cogs = (): number | undefined => {
    if (!this.data.costOfGoods) return undefined
    const {
      openingInventory,
      purchases,
      costOfLabor,
      materialsAndSupplies,
      otherCosts,
      closingInventory
    } = this.data.costOfGoods

    const total = sumFields([
      openingInventory,
      purchases,
      costOfLabor,
      materialsAndSupplies,
      otherCosts
    ])
    return Math.max(0, total - (closingInventory ?? 0))
  }

  // Helper: Vehicle Deduction (Part IV - Standard Mileage)
  vehicleDeduction = (): number => {
    if (!this.data.vehicleExpenses) return 0
    return this.data.vehicleExpenses.reduce((acc, v) => {
      const miles = v.businessMiles ?? 0
      return acc + miles * 0.56 // 2021 Rate: 56 cents/mile
    }, 0)
  }

  // Helper: Home Office Deduction (Simplified)
  homeOffice = (): number | undefined => {
    if (!this.data.homeOffice) return undefined
    const { method, areaUsed } = this.data.homeOffice
    if (method === 'simplified' && areaUsed) {
      // Simplified method: $5/sqft, max 300 sqft ($1500)
      const cappedArea = Math.min(areaUsed, 300)
      return cappedArea * 5
    }
    // TODO: Actual expense method (Form 8829)
    return undefined
  }

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
    // Car and truck expenses: Entered expenses + Standard Mileage Calculation
    const entered = this.data.expenses.carAndTruck ?? 0
    const calculated = this.vehicleDeduction()
    const total = entered + calculated
    return total > 0 ? total : undefined
  }
  l10 = (): number | undefined => this.data.expenses.commissions
  l11 = (): number | undefined => this.data.expenses.contractLabor
  l12 = (): number | undefined => this.data.expenses.depletion
  l13 = (): number | undefined => this.data.expenses.depreciation
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
      this.l27a()
    ])
  }
  l29 = (): number | undefined => {
    const l7 = this.l7()
    const l28 = this.l28()
    if (l7 === undefined && l28 === undefined) return undefined
    return (l7 ?? 0) - (l28 ?? 0)
  }
  l30 = (): number | undefined => this.homeOffice()
  l31 = (): number | undefined => {
    const l29 = this.l29()
    const l30 = this.l30()
    if (l29 === undefined && l30 === undefined) return undefined
    return (l29 ?? 0) - (l30 ?? 0)
  }
  l32 = (): { select: number } | undefined => {
      // 32a: All investment is at risk. 32b: Some investment is not at risk.
      // Default to 32a (select 0) for now as we don't have this in data model
      return { select: 0 }
  }

  // Part III: Cost of Goods Sold
  l33 = (): { select: number } | undefined => {
      const method = this.data.costOfGoods?.method
      if (method === 'cost') return { select: 0 }
      if (method === 'lowerOfCostOrMarket') return { select: 1 }
      if (method === 'other') return { select: 2 }
      return undefined
  }
  l34 = (): { select: number } | undefined => undefined // Change in quantities? TODO
  l35 = (): number | undefined => this.data.costOfGoods?.openingInventory
  l36 = (): number | undefined => this.data.costOfGoods?.purchases
  l37 = (): number | undefined => this.data.costOfGoods?.costOfLabor
  l38 = (): number | undefined => this.data.costOfGoods?.materialsAndSupplies
  l39 = (): number | undefined => this.data.costOfGoods?.otherCosts
  l40 = (): number | undefined =>
    sumFields([
      this.l35(),
      this.l36(),
      this.l37(),
      this.l38(),
      this.l39()
    ])
  l41 = (): number | undefined => this.data.costOfGoods?.closingInventory
  l42 = (): number | undefined => {
    // If we have explicit COGS field in root data, use it, otherwise calc
    if (this.data.costOfGoodsSold !== undefined && this.data.costOfGoodsSold !== 0) return this.data.costOfGoodsSold

    // Otherwise calculate from Part III
    const l40 = this.l40()
    const l41 = this.l41()
    if (l40 === undefined && l41 === undefined) return undefined
    return Math.max(0, (l40 ?? 0) - (l41 ?? 0))
  }

  // Part IV: Vehicle Information
  // Note: We'll take the first vehicle if multiple exist for the display portion
  primaryVehicle = () => this.data.vehicleExpenses?.[0]

  l43 = (): string | undefined => this.primaryVehicle()?.datePlacedInService
  l44a = (): number | undefined => this.primaryVehicle()?.businessMiles
  l44b = (): number | undefined => this.primaryVehicle()?.commutingMiles
  l44c = (): number | undefined => this.primaryVehicle()?.otherMiles
  l45 = (): { select: number } | undefined =>
      this.primaryVehicle()?.availableForPersonalUse ? { select: 0 } : { select: 1 }
  l46 = (): { select: number } | undefined =>
      this.primaryVehicle()?.spouseAvailable ? { select: 0 } : { select: 1 }
  l47a = (): { select: number } | undefined =>
      this.primaryVehicle()?.evidenceSupported ? { select: 0 } : { select: 1 }
  l47b = (): { select: number } | undefined =>
      this.primaryVehicle()?.evidenceWritten ? { select: 0 } : { select: 1 }

  // Part V: Other Expenses
  otherExpenses = (): Array<[string, number]> => {
    if (this.data.otherExpenses) {
      return this.data.otherExpenses.map((e) => [e.description, e.amount])
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

      // Fields 54-56
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

      // Fields 76-77 (f2_13, f2_14)
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
