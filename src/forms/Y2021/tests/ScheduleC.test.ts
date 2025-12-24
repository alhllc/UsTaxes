
import ScheduleC from '../irsForms/ScheduleC'
import { create1040 } from '../irsForms/Main'
import { PersonRole, ScheduleC as ScheduleCData, Information } from 'ustaxes/core/data'
import { blankState } from 'ustaxes/redux/reducer'
import F1040 from '../irsForms/F1040'
import { isLeft } from 'ustaxes/core/util'

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
            filingStatus: 'S',
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
})
