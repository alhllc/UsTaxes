
import ScheduleC from '../irsForms/ScheduleC'
import { create1040 } from '../irsForms/Main'
import {
  FilingStatus,
  PersonRole,
  ScheduleC as ScheduleCData,
  Information
} from 'ustaxes/core/data'
import { blankState } from 'ustaxes/redux/reducer'
import { isLeft } from 'ustaxes/core/util'
import F1040 from '../irsForms/F1040'

// TestKit doesn't export describe/it/expect, so we use global Jest ones
// or import from @jest/globals if needed, but in CRA environment they are global.

describe('ScheduleC', () => {
  const defaultScheduleC: ScheduleCData = {
      personRole: PersonRole.PRIMARY,
      businessName: 'Test Business',
      accountingMethod: 'Cash',
      materiallyParticipate: true,
      startedCurrentYear: false,
      grossReceipts: 10000,
      returnsAndAllowances: 1000,
      costOfGoodsSold: 2000,
      otherIncome: 500,
      expenses: {
          advertising: 100,
          utilities: 200,
          wages: 3000
      },
      otherExpenses: []
  }

  const getF1040 = (infoUpdates: Partial<Information> = {}): F1040 => {
    const info: Information = {
        ...blankState,
        taxPayer: {
            ...blankState.taxPayer,
            filingStatus: FilingStatus.S,
            primaryPerson: {
                firstName: 'Test',
                lastName: 'User',
                ssid: '000000000',
                address: {
                    address: '123 Main St',
                    city: 'Anytown',
                    state: 'CA',
                    zip: '12345'
                },
                isTaxpayerDependent: false,
                role: PersonRole.PRIMARY,
                isBlind: false,
                dateOfBirth: new Date('1990-01-01')
            }
        },
        ...infoUpdates
    }
    const res = create1040(info, [])
    if (isLeft(res)) {
        throw new Error('Failed to create F1040: ' + JSON.stringify(res.left))
    }
    return res.right[0]
  }

  it('should be attached to F1040 when data exists', () => {
    const f1040 = getF1040({
        scheduleCs: [defaultScheduleC]
    })
    expect(f1040.scheduleC).toBeDefined()
    expect(f1040.scheduleC).toBeInstanceOf(ScheduleC)
  })

  it('should not be attached when no data', () => {
      const f1040 = getF1040({
          scheduleCs: []
      })
      expect(f1040.scheduleC).toBeUndefined()
  })

  it('should calculate gross income (Part I)', () => {
    const f1040 = getF1040({
        scheduleCs: [defaultScheduleC]
    })
    const sc = f1040.scheduleC!

    // L1: Gross Receipts
    expect(sc.l1()).toBe(10000)
    // L2: Returns
    expect(sc.l2()).toBe(1000)
    // L3: L1 - L2
    expect(sc.l3()).toBe(9000)
    // L4: COGS (from line 42)
    expect(sc.l4()).toBe(2000)
    // L5: Gross Profit (L3 - L4)
    expect(sc.l5()).toBe(7000)
    // L6: Other Income
    expect(sc.l6()).toBe(500)
    // L7: Gross Income (L5 + L6)
    expect(sc.l7()).toBe(7500)
  })

  it('should calculate total expenses (Part II)', () => {
      const f1040 = getF1040({
          scheduleCs: [defaultScheduleC]
      })
      const sc = f1040.scheduleC!

      // Advertising
      expect(sc.l8()).toBe(100)
      // Utilities
      expect(sc.l25()).toBe(200)
      // Wages
      expect(sc.l26()).toBe(3000)

      // Total Expenses (L28)
      expect(sc.l28()).toBe(3300)
  })

  it('should calculate net profit (Line 31)', () => {
    const f1040 = getF1040({
        scheduleCs: [defaultScheduleC]
    })
    const sc = f1040.scheduleC!

    // Gross Income (7500) - Total Expenses (3300)
    expect(sc.l31()).toBe(4200)
  })

  it('should handle multiple Schedule Cs', () => {
      const secondBiz: ScheduleCData = {
          ...defaultScheduleC,
          businessName: 'Second Business',
          grossReceipts: 5000,
          expenses: {}
      }

      const f1040 = getF1040({
          scheduleCs: [defaultScheduleC, secondBiz]
      })

      const sc1 = f1040.scheduleC!
      const copies = sc1.copies()

      expect(copies).toHaveLength(1)
      expect(copies[0]).toBeInstanceOf(ScheduleC)
      expect(copies[0].businessName()).toBe('Second Business')
  })

  it('should sum net profit from multiple Schedule Cs into Schedule 1', () => {
      const secondBiz: ScheduleCData = {
          ...defaultScheduleC,
          businessName: 'Second Business',
          grossReceipts: 5000,
          expenses: {} // 5000 profit
      }
      // defaultScheduleC profit is 4200

      const f1040 = getF1040({
          scheduleCs: [defaultScheduleC, secondBiz]
      })

      const s1 = f1040.schedule1
      // 4200 + 5000 = 9200
      expect(s1.l3()).toBe(9200)
  })

  it('should sum net profit from multiple Schedule Cs into Schedule SE', () => {
      const secondBiz: ScheduleCData = {
          ...defaultScheduleC,
          businessName: 'Second Business',
          grossReceipts: 5000,
          expenses: {} // 5000 profit
      }
      // defaultScheduleC profit is 4200

      const f1040 = getF1040({
          scheduleCs: [defaultScheduleC, secondBiz]
      })

      const se = f1040.scheduleSE
      // 4200 + 5000 = 9200
      // L2 is Net Profit from Sch C
      expect(se.l2()).toBe(9200)
  })

  it('should calculate vehicle deduction from miles (56 cents/mile for 2021)', () => {
      const dataWithVehicle: ScheduleCData = {
          ...defaultScheduleC,
          vehicleExpenses: [
              {
                  makeModel: 'Tesla Model Y',
                  businessMiles: 1000,
                  commutingMiles: 500,
                  otherMiles: 200,
                  datePlacedInService: '2021-01-01'
              }
          ]
      }
      const f1040 = getF1040({
          scheduleCs: [dataWithVehicle]
      })
      const sc = f1040.scheduleC!

      // 1000 miles * 0.56 = 560
      expect(sc.l9()).toBe(560)
  })

  it('should prefer vehicle calculation over manual entry', () => {
      const dataWithVehicle: ScheduleCData = {
          ...defaultScheduleC,
          expenses: {
              ...defaultScheduleC.expenses,
              carAndTruck: 9999 // Should be ignored
          },
          vehicleExpenses: [
              {
                  businessMiles: 1000
              }
          ]
      }
      const f1040 = getF1040({
          scheduleCs: [dataWithVehicle]
      })
      const sc = f1040.scheduleC!

      // 1000 miles * 0.56 = 560
      expect(sc.l9()).toBe(560)
  })

  it('should calculate detailed COGS', () => {
      const dataWithCOGS: ScheduleCData = {
          ...defaultScheduleC,
          costOfGoods: {
              method: 'cost',
              openingInventory: 5000,
              purchases: 10000,
              costOfLabor: 2000,
              materialsAndSupplies: 500,
              otherCosts: 100,
              closingInventory: 3000
          },
          costOfGoodsSold: 0 // Should be ignored
      }
      const f1040 = getF1040({
          scheduleCs: [dataWithCOGS]
      })
      const sc = f1040.scheduleC!

      // L35 Opening: 5000
      expect(sc.l35()).toBe(5000)
      // L36 Purchases: 10000
      expect(sc.l36()).toBe(10000)
      // L37 Labor: 2000
      expect(sc.l37()).toBe(2000)
      // L38 Materials: 500
      expect(sc.l38()).toBe(500)
      // L39 Other: 100
      expect(sc.l39()).toBe(100)

      // L40 (Total available): 5000 + 10000 + 2000 + 500 + 100 = 17600
      expect(sc.l40()).toBe(17600)

      // L41 Closing: 3000
      expect(sc.l41()).toBe(3000)

      // L42 COGS: 17600 - 3000 = 14600
      expect(sc.l42()).toBe(14600)

      // L4 should also match L42
      expect(sc.l4()).toBe(14600)
  })

  it('should calculate Home Office deduction (Simplified Method)', () => {
      const dataWithHomeOffice: ScheduleCData = {
          ...defaultScheduleC,
          // Gross Income: 7500
          // Total Expenses: 3300
          // Tentative Profit (L29): 4200
          homeOffice: {
              method: 'simplified',
              areaUsed: 100, // 100 sqft
              totalArea: 1000
          }
      }
      const f1040 = getF1040({
          scheduleCs: [dataWithHomeOffice]
      })
      const sc = f1040.scheduleC!

      // Deduction: 100 sqft * $5 = 500
      expect(sc.l30()).toBe(500)

      // Net Profit (L31): 4200 - 500 = 3700
      expect(sc.l31()).toBe(3700)
  })

  it('should cap Home Office deduction (Simplified Method) at 300 sqft', () => {
      const dataWithHomeOffice: ScheduleCData = {
          ...defaultScheduleC,
          homeOffice: {
              method: 'simplified',
              areaUsed: 500 // > 300
          }
      }
      const f1040 = getF1040({
          scheduleCs: [dataWithHomeOffice]
      })
      const sc = f1040.scheduleC!

      // Deduction: 300 sqft * $5 = 1500
      expect(sc.l30()).toBe(1500)
  })

  it('should cap Home Office deduction (Simplified Method) at Line 29', () => {
      const lowProfitData: ScheduleCData = {
          ...defaultScheduleC,
          grossReceipts: 3400,
          expenses: {
              wages: 3300
          },
          // Gross Income: 3400 (if no other income/returns)
          // Expenses: 3300
          // L29: 100
          homeOffice: {
              method: 'simplified',
              areaUsed: 100 // 100 * 5 = 500 tentative
          },
          costOfGoodsSold: 0,
          returnsAndAllowances: 0,
          otherIncome: 0
      }
      const f1040 = getF1040({
          scheduleCs: [lowProfitData]
      })
      const sc = f1040.scheduleC!

      expect(sc.l29()).toBe(100)

      // Deduction limited to 100
      expect(sc.l30()).toBe(100)

      // L31 should be 0
      expect(sc.l31()).toBe(0)
  })
})
