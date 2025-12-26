import F1040Attachment from './F1040Attachment'
import F1040 from './F1040'
import { FormTag } from 'ustaxes/core/irsForms/Form'
import { Field } from 'ustaxes/core/pdfFiller'
import { ScheduleC as ScheduleCData } from 'ustaxes/core/data'

export default class F8829 extends F1040Attachment {
  tag: FormTag = 'f8829'
  sequenceIndex = 180

  scheduleCData: ScheduleCData

  constructor(f1040: F1040, scheduleCData: ScheduleCData) {
    super(f1040)
    this.scheduleCData = scheduleCData
  }

  isNeeded = (): boolean => {
      return this.scheduleCData.homeOffice?.method === 'actual'
  }

  l1 = (): number | undefined => this.scheduleCData.homeOffice?.areaUsed
  l2 = (): number | undefined => this.scheduleCData.homeOffice?.totalArea
  l3 = (): number | undefined => {
      const l1 = this.l1()
      const l2 = this.l2()
      if (l1 !== undefined && l2 !== undefined && l2 > 0) {
          return (l1 / l2) * 100
      }
      return undefined
  }
  l7 = (): number | undefined => this.l3()

  l8 = (): number | undefined => this.calculateScheduleCProfitBeforeHomeOffice()

  calculateScheduleCProfitBeforeHomeOffice = (): number => {
      const gross = (this.scheduleCData.grossReceipts || 0) - (this.scheduleCData.returnsAndAllowances || 0) - (this.scheduleCData.costOfGoodsSold || 0) + (this.scheduleCData.otherIncome || 0)

      const expenses = this.scheduleCData.expenses
      let totalExp = 0
      Object.values(expenses).forEach((v) => totalExp += (v ?? 0))

      if (this.scheduleCData.vehicleExpenses) {
          totalExp += this.scheduleCData.vehicleExpenses.reduce((acc, v) => acc + (v.businessMiles ?? 0) * 0.56, 0)
      }
      this.scheduleCData.otherExpenses.forEach(e => totalExp += e.amount)

      return gross - totalExp
  }

  l8_calculated = (): number => this.calculateScheduleCProfitBeforeHomeOffice()

  l10b = (): number | undefined => this.scheduleCData.homeOffice?.expenses?.mortgageInterest
  l11b = (): number | undefined => this.scheduleCData.homeOffice?.expenses?.realEstateTaxes
  l12b = (): number | undefined => this.scheduleCData.homeOffice?.expenses?.insurance
  l13b = (): number | undefined => this.scheduleCData.homeOffice?.expenses?.rent
  l14b = (): number | undefined => this.scheduleCData.homeOffice?.expenses?.repairsAndMaintenance
  l15b = (): number | undefined => this.scheduleCData.homeOffice?.expenses?.utilities
  l16b = (): number | undefined => this.scheduleCData.homeOffice?.expenses?.other

  allowableDeduction = (): number => {
     const pct = (this.l7() ?? 0) / 100
     const totalIndirect = (this.l10b()??0) + (this.l11b()??0) + (this.l12b()??0) + (this.l13b()??0) + (this.l14b()??0) + (this.l15b()??0) + (this.l16b()??0)
     const expenses = totalIndirect * pct

     const limit = Math.max(0, this.l8_calculated())
     return Math.min(expenses, limit)
  }

  fields = (): Field[] => {
      return []
  }
}
