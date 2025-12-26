import F1040Attachment from './F1040Attachment'
import F1040 from './F1040'
import { FormTag } from 'ustaxes/core/irsForms/Form'
import { Field } from 'ustaxes/core/pdfFiller'
import { DepreciableAsset, ScheduleC as ScheduleCData } from 'ustaxes/core/data'
import { sumFields } from 'ustaxes/core/irsForms/util'

export default class F4562 extends F1040Attachment {
  tag: FormTag = 'f4562'
  sequenceIndex = 179

  scheduleCData: ScheduleCData

  constructor(f1040: F1040, scheduleCData: ScheduleCData) {
    super(f1040)
    this.scheduleCData = scheduleCData
  }

  isNeeded = (): boolean => {
      const assets = this.scheduleCData.assets
      return assets !== undefined && assets.length > 0
  }

  calculateDepreciation = (asset: DepreciableAsset): number => {
      if (asset.method !== 'MACRS') {
          return 0
      }

      const cost = asset.costBasis
      const recoveryPeriod = asset.recoveryPeriod
      const datePlaced = new Date(asset.datePlacedInService)
      const taxYear = 2021
      const yearPlaced = datePlaced.getFullYear()
      const yearIndex = taxYear - yearPlaced + 1

      if (yearIndex < 1 || yearIndex > recoveryPeriod + 1) {
          return 0
      }

      const tables: Record<number, number[]> = {
          3: [0.3333, 0.4445, 0.1481, 0.0741],
          5: [0.2000, 0.3200, 0.1920, 0.1152, 0.1152, 0.0576],
          7: [0.1429, 0.2449, 0.1749, 0.1249, 0.0893, 0.0892, 0.0893, 0.0446],
          10: [0.1000, 0.1800, 0.1440, 0.1152, 0.0922, 0.0737, 0.0655, 0.0655, 0.0656, 0.0655, 0.0328],
          15: [0.0500, 0.0950, 0.0855, 0.0770, 0.0693, 0.0623, 0.0590, 0.0590, 0.0591, 0.0590, 0.0591, 0.0590, 0.0591, 0.0590, 0.0591, 0.0295],
          20: [0.03750, 0.07219, 0.06677, 0.06177, 0.05713, 0.05285, 0.04888, 0.04522, 0.04462, 0.04461, 0.04462, 0.04461, 0.04462, 0.04461, 0.04462, 0.04461, 0.04462, 0.04461, 0.04462, 0.04461, 0.02231]
      }

      if (asset.convention === 'HY' && tables[recoveryPeriod]) {
          const rate = tables[recoveryPeriod][yearIndex - 1]
          return cost * rate
      }

      return 0
  }

  totalDepreciation = (): number => {
      const assets = this.scheduleCData.assets ?? []
      return assets.reduce((acc, asset) => acc + this.calculateDepreciation(asset), 0)
  }

  l22 = (): number => this.totalDepreciation()

  fields = (): Field[] => {
      return []
  }
}
