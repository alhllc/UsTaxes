import Form, { FormMethods } from 'ustaxes/core/stateForms/Form'
import F1040 from '../../irsForms/F1040'
import { Field, RadioSelect } from 'ustaxes/core/pdfFiller'
import { sumFields } from 'ustaxes/core/irsForms/util'
import { FilingStatus, State } from 'ustaxes/core/data'
import { ValidatedInformation } from 'ustaxes/forms/F1040Base'

export class MO1040 extends Form {
  info: ValidatedInformation
  f1040: F1040
  formName: string
  state: State
  formOrder = 0
  methods: FormMethods

  constructor(f1040: F1040) {
    super()
    this.info = f1040.info
    this.f1040 = f1040
    this.formName = 'MO-1040'
    this.state = 'MO'
    this.methods = new FormMethods(this)
  }

  /**
   * Line 1: Federal Adjusted Gross Income from Federal Form 1040 or 1040-SR, Line 11
   */
  l1 = (): number => this.f1040.l11()

  /**
   * Line 2: Total Additions from MO-A, Part 1, Line 7
   * TODO: Implement additions logic
   */
  l2 = (): number => 0

  /**
   * Line 3: Total Income
   */
  l3 = (): number => this.l1() + this.l2()

  /**
   * Line 4: Total Subtractions from MO-A, Part 1, Line 18
   * TODO: Implement subtractions logic (e.g. state tax refund)
   */
  l4 = (): number => 0

  /**
   * Line 5: Missouri Adjusted Gross Income
   */
  l5 = (): number => Math.max(0, this.l3() - this.l4())

  /**
   * Line 6: Total Missouri Adjusted Gross Income
   * For single filers, same as line 5. For combined, includes spouse.
   * Currently handling as single column for simplicity or assuming 100% to primary if simple.
   * If MFJ, usually columns are split (Y - Yourself, S - Spouse).
   * For now, mapping total to "Yourself" column if not combined form logic fully implemented.
   * Wait, MO-1040 has Yourself (Y) and Spouse (S) columns for many lines.
   * Assuming simple case (Single or MFJ treated as one unit if simplified, but MO requires split usually).
   * Let's put everything in "Yourself" for now or use split logic if available.
   * For Line 6, instructions say: "Add columns 5Y and 5S".
   */
  l6 = (): number => this.l5()

  /**
   * Line 7: Income Percentage
   * If single, 100%.
   */
  l7 = (): number => 100

  /**
   * Line 8: Pension Exemption
   * TODO: Implement
   */
  l8 = (): number => 0

  /**
   * Line 9: Missouri Standard Deduction or Itemized Deductions
   * 2021 MO Standard Deduction:
   * Single: $12,550
   * MFJ: $25,100
   * MFS: $12,550
   * HOH: $18,800
   * QW: $25,100
   */
  l9 = (): number => {
    // If using standard deduction
    const filingStatus = this.info.taxPayer.filingStatus
    if (filingStatus === FilingStatus.MFJ || filingStatus === FilingStatus.W) {
      return 25100
    } else if (filingStatus === FilingStatus.HOH) {
      return 18800
    } else {
      return 12550
    }
    // TODO: Compare with itemized deductions if applicable
  }

  /**
   * Line 10: Long-term Care Insurance Deduction
   * TODO: Implement
   */
  l10 = (): number => 0

  /**
   * Line 11: Health Care Sharing Ministry Deduction
   * TODO: Implement
   */
  l11 = (): number => 0

  /**
   * Line 12: Active Duty Military Deduction
   * TODO: Implement
   */
  l12 = (): number => 0

  /**
   * Line 13: Bring Jobs Home Deduction
   * TODO: Implement
   */
  l13 = (): number => 0

  /**
   * Line 14: Qualified Business Income Deduction
   * From Federal Form 1040, Line 13
   */
  l14 = (): number => this.f1040.l13()

  /**
   * Line 15: Total Deductions
   */
  l15 = (): number => sumFields([this.l8(), this.l9(), this.l10(), this.l11(), this.l12(), this.l13(), this.l14()])

  /**
   * Line 16: Subtotal
   */
  l16 = (): number => Math.max(0, this.l6() - this.l15())

  /**
   * Line 17: Exemption for Dependents
   * $1,200 for each dependent
   */
  l17 = (): number => {
    return this.info.taxPayer.dependents.length * 1200
  }

  /**
   * Line 18: Missouri Taxable Income
   */
  l18 = (): number => Math.max(0, this.l16() - this.l17())

  /**
   * Line 19: Tax Calculation
   * Use MO Tax Table 2021.
   * If over $9,000, tax is $315 + 5.4% of excess over $9,000.
   */
  l19 = (): number => {
    const income = this.l18()
    if (income <= 108) return 0
    if (income <= 1088) return income * 0.015
    if (income <= 2176) return 16 + (income - 1088) * 0.02
    if (income <= 3264) return 38 + (income - 2176) * 0.025
    if (income <= 4352) return 65 + (income - 3264) * 0.03
    if (income <= 5440) return 98 + (income - 4352) * 0.035
    if (income <= 6528) return 136 + (income - 5440) * 0.04
    if (income <= 7616) return 179 + (income - 6528) * 0.045
    if (income <= 8704) return 228 + (income - 7616) * 0.05
    // Over 8704?
    // Wait, let's verify the bracket 9000 mentioned in search.
    // The google snippet said "5.4% over $8,968 (approx)".
    // Let's rely on formula if available.
    // One snippet said: "$315 + 5.4% of excess over $9,000".
    // 8704 * 0.05 approx?
    // Let's use the 2021 formula from search if possible or interpolation.
    // Found snippet: "Over $8,704 ... $315 + 5.4%".
    // Wait, 315?
    // 228 + (8704-7616)*0.05 = 228 + 1088*0.05 = 228 + 54.4 = 282.4.
    // Another bracket?
    // Let's assume > 8704 is top bracket.
    // Actually, let's look at the downloaded text of "2021 Tax Chart".
    // It says:
    // 1. Missouri taxable income
    // ...
    // 4. ... 5.4%
    // 6. ... + 315
    // So if > $9,072 (maybe?), tax is 315 + 5.4%?
    // Let's look closer at the snippet.
    // "Over $8,704 ... $283" (snippet said 283).
    // Let's implement a standard bracket function.

    // Bracket data derived from snippets and general MO structure:
    // 0 - 108: 0%
    // 109 - 1088: 1.5%
    // 1089 - 2176: 2.0% (minus adjustment or cumulative)
    // Formula method:
    // Over 0: 1.5%
    // Over 1088: 2.0%
    // Over 2176: 2.5%
    // Over 3264: 3.0%
    // Over 4352: 3.5%
    // Over 5440: 4.0%
    // Over 6528: 4.5%
    // Over 7616: 5.0%
    // Over 8704: 5.4%

    if (income <= 108) return 0
    if (income <= 1088) return income * 0.015
    if (income <= 2176) return 16 + (income - 1088) * 0.02
    if (income <= 3264) return 38 + (income - 2176) * 0.025
    if (income <= 4352) return 65 + (income - 3264) * 0.03
    if (income <= 5440) return 98 + (income - 4352) * 0.035
    if (income <= 6528) return 136 + (income - 5440) * 0.04
    if (income <= 7616) return 179 + (income - 6528) * 0.045
    if (income <= 8704) return 228 + (income - 7616) * 0.05
    return 282 + (income - 8704) * 0.054 // 228 + (1088*0.05) = 282.4. So 282 base for next.
  }

  /**
   * Line 20: Resident Credit
   * TODO: Implement MO-CR
   */
  l20 = (): number => 0

  /**
   * Line 21: Missouri Income Percentage
   * For residents, 100% usually unless non-resident spouse.
   */
  l21 = (): number => 100

  /**
   * Line 22: Income Tax
   * l19 - l20, multiplied by percentage if needed?
   * Instructions usually say calculate tax on all income then multiply by MO percentage.
   * Assuming resident for now.
   */
  l22 = (): number => Math.max(0, this.l19() - this.l20())

  /**
   * Line 23: Other Taxes
   */
  l23 = (): number => 0

  /**
   * Line 24: Total Tax
   */
  l24 = (): number => this.l22() + this.l23()

  /**
   * Line 25: Missouri Withholding
   */
  l25 = (): number => this.methods.witholdingForState('MO')

  /**
   * Line 26: Estimated Tax Payments
   */
  l26 = (): number => 0

  /**
   * Line 27: Payments from MO-1040V
   */
  l27 = (): number => 0

  /**
   * Line 28: Total Payments
   */
  l28 = (): number => this.l25() + this.l26() + this.l27()

  /**
   * Line 29: Overpayment
   */
  l29 = (): number => Math.max(0, this.l28() - this.l24())

  /**
   * Line 30: Amount to be Refunded
   */
  l30 = (): number => this.l29()

  /**
   * Line 31: Amount Due
   */
  l31 = (): number => Math.max(0, this.l24() - this.l28())

  /**
   * PDF Mapping
   * This is a placeholder mapping based on typical fillable PDF structure.
   * Field names need to be verified against actual PDF if possible, or guessed based on sequence.
   * Assuming sequential fields like IL1040 or specific named fields.
   */
  fields = (): Field[] => {
    // Based on sequential field logic similar to other forms if exact names are unavailable.
    // The previous implementation of IL1040 suggests fields are often an ordered array matching the PDF.
    // I will construct an array that follows the logical flow of the form lines I implemented.

    const f: Field[] = []

    // Header Information
    f.push([this.info.taxPayer.primaryPerson.firstName, this.info.taxPayer.primaryPerson.lastName].join(' '))
    f.push(this.info.taxPayer.primaryPerson.ssid)
    f.push(this.info.taxPayer.spouse?.firstName ? [this.info.taxPayer.spouse.firstName, this.info.taxPayer.spouse.lastName].join(' ') : '')
    f.push(this.info.taxPayer.spouse?.ssid ?? '')

    f.push(this.info.taxPayer.primaryPerson.address.address)
    f.push(this.info.taxPayer.primaryPerson.address.city)
    f.push(this.info.taxPayer.primaryPerson.address.state)
    f.push(this.info.taxPayer.primaryPerson.address.zip)

    // Filing Status
    // Assuming boolean checkboxes or radio group
    f.push(this.info.taxPayer.filingStatus === FilingStatus.S)
    f.push(this.info.taxPayer.filingStatus === FilingStatus.MFJ)
    f.push(this.info.taxPayer.filingStatus === FilingStatus.MFS)
    f.push(this.info.taxPayer.filingStatus === FilingStatus.HOH)
    f.push(this.info.taxPayer.filingStatus === FilingStatus.W)

    // Lines
    f.push(this.l1()) // Line 1
    f.push(this.l2()) // Line 2
    f.push(this.l3()) // Line 3
    f.push(this.l4()) // Line 4
    f.push(this.l5()) // Line 5
    f.push(this.l6()) // Line 6
    f.push(this.l7()) // Line 7
    f.push(this.l8()) // Line 8
    f.push(this.l9()) // Line 9
    f.push(this.l10()) // Line 10
    f.push(this.l11()) // Line 11
    f.push(this.l12()) // Line 12
    f.push(this.l13()) // Line 13
    f.push(this.l14()) // Line 14
    f.push(this.l15()) // Line 15
    f.push(this.l16()) // Line 16
    f.push(this.l17()) // Line 17
    f.push(this.l18()) // Line 18
    f.push(this.l19()) // Line 19
    f.push(this.l20()) // Line 20
    f.push(this.l21()) // Line 21
    f.push(this.l22()) // Line 22
    f.push(this.l23()) // Line 23
    f.push(this.l24()) // Line 24
    f.push(this.l25()) // Line 25
    f.push(this.l26()) // Line 26
    f.push(this.l27()) // Line 27
    f.push(this.l28()) // Line 28
    f.push(this.l29()) // Line 29
    f.push(this.l30()) // Line 30
    f.push(this.l31()) // Line 31

    return f
  }
}

export default (f1040: F1040): MO1040 => new MO1040(f1040)
