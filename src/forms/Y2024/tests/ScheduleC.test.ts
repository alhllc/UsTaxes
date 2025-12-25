import { Information } from 'ustaxes/core/data'
import ScheduleC from '../irsForms/ScheduleC'
import F1040 from '../irsForms/F1040'
import { blankState } from 'ustaxes/redux/reducer'
import _ from 'lodash'

// Helper function to create data since createData is not available
const createData = (initialState: Information): Information => {
  return _.cloneDeep(initialState)
}

describe('Schedule C', () => {
  it('calculates net profit correctly', () => {
    const data = createData(blankState)
    data.scheduleCs = [
      {
        personRole: 'PRIMARY',
        businessName: 'Test Business',
        accountingMethod: 'Cash',
        materiallyParticipate: true,
        startedCurrentYear: false,
        grossReceipts: 10000,
        returnsAndAllowances: 0,
        costOfGoodsSold: 0,
        otherIncome: 0,
        expenses: {
          advertising: 1000,
          officeExpense: 500
        },
        otherExpenses: [],
        vehicleExpenses: [],
        costOfGoods: {
          method: 'cost',
          openingInventory: 0,
          purchases: 0,
          costOfLabor: 0,
          materialsAndSupplies: 0,
          otherCosts: 0,
          closingInventory: 0
        }
      }
    ]

    const f1040 = new F1040(data)
    const schC = new ScheduleC(f1040)

    // Check key lines
    expect(schC.l1()).toBe(10000)
    expect(schC.l8()).toBe(1000) // Advertising
    expect(schC.l18()).toBe(500) // Office expense
    expect(schC.l31()).toBe(8500) // 10000 - 1500
  })

  it('calculates COGS correctly', () => {
    const data = createData(blankState)
    data.scheduleCs = [
      {
        personRole: 'PRIMARY',
        businessName: 'COGS Business',
        accountingMethod: 'Cash',
        materiallyParticipate: true,
        startedCurrentYear: false,
        grossReceipts: 20000,
        returnsAndAllowances: 0,
        costOfGoodsSold: 0, // This is user input usually, but we calculate based on sub-schedule
        otherIncome: 0,
        expenses: {},
        otherExpenses: [],
        costOfGoods: {
          method: 'cost',
          openingInventory: 5000,
          purchases: 10000,
          costOfLabor: 0,
          materialsAndSupplies: 0,
          otherCosts: 0,
          closingInventory: 2000
        }
      }
    ]

    const f1040 = new F1040(data)
    const schC = new ScheduleC(f1040)

    // COGS = 5000 + 10000 - 2000 = 13000
    expect(schC.l42()).toBe(13000)
    expect(schC.l4()).toBe(13000)
    expect(schC.l5()).toBe(7000) // 20000 - 13000
  })

  it('calculates vehicle deduction correctly', () => {
    const data = createData(blankState)
    data.scheduleCs = [
      {
        personRole: 'PRIMARY',
        businessName: 'Vehicle Business',
        accountingMethod: 'Cash',
        materiallyParticipate: true,
        startedCurrentYear: false,
        grossReceipts: 5000,
        returnsAndAllowances: 0,
        costOfGoodsSold: 0,
        otherIncome: 0,
        expenses: {},
        otherExpenses: [],
        vehicleExpenses: [
          {
            businessMiles: 1000
          }
        ]
      }
    ]

    const f1040 = new F1040(data)
    const schC = new ScheduleC(f1040)

    // 1000 miles * 0.67 = 670
    expect(schC.l9()).toBe(670)
    expect(schC.l31()).toBe(4330) // 5000 - 670
  })
})
