import { Information } from 'ustaxes/core/data'
import F1040 from '../irsForms/F1040'
import ScheduleC from '../irsForms/ScheduleC'
import { blankState as blankInformation } from 'ustaxes/redux/reducer'

const createDefaultF1040 = (info: Information): F1040 => new F1040(info)

describe('Schedule C', () => {
  it('calculates gross profit correctly', () => {
    const info: Information = {
      ...blankInformation,
      taxYear: 2024,
      scheduleCs: [
        {
          businessName: 'Test Business',
          accountingMethod: 'Cash',
          materiallyParticipate: true,
          started: false,
          grossReceipts: 10000,
          returnsAndAllowances: 1000,
          costOfGoods: {
            inventoryBegin: 0,
            inventoryEnd: 0,
            purchases: 0,
            costOfLabor: 0,
            materialsAndSupplies: 0,
            otherCosts: 0
          },
          expenses: {
            advertising: 0,
            carAndTruck: 0,
            commissions: 0,
            contractLabor: 0,
            depletion: 0,
            depreciation: 0,
            employeeBenefit: 0,
            insurance: 0,
            interestMortgage: 0,
            interestOther: 0,
            legalAndProfessional: 0,
            officeExpense: 0,
            pensionAndProfitSharing: 0,
            rentVehicles: 0,
            rentOther: 0,
            repairsAndMaintenance: 0,
            supplies: 0,
            taxesAndLicenses: 0,
            travel: 0,
            meals: 0,
            utilities: 0,
            wages: 0,
            other: 0
          },
          vehicleDeduction: {
            vehicleType: '',
            datePlacedInService: '',
            totalMiles: 0,
            businessMiles: 0,
            commutingMiles: 0,
            otherMiles: 0,
            availableOffDuty: false,
            anotherVehicle: false,
            evidence: false,
            evidenceWritten: false
          },
          otherExpenses: [],
          homeOffice: {
            areaUsed: 0,
            totalArea: 0,
            grossIncome: 0
          }
        }
      ]
    }
    const f1040 = createDefaultF1040(info)
    const scheduleC = new ScheduleC(f1040, info.scheduleCs[0])

    expect(scheduleC.l1()).toBe(10000)
    expect(scheduleC.l2()).toBe(1000)
    expect(scheduleC.l3()).toBe(9000)
    expect(scheduleC.l5()).toBe(9000)
    expect(scheduleC.l7()).toBe(9000)
  })

  it('calculates expenses and net profit correctly', () => {
    const info: Information = {
      ...blankInformation,
      taxYear: 2024,
      scheduleCs: [
        {
          businessName: 'Test Business',
          accountingMethod: 'Cash',
          materiallyParticipate: true,
          started: false,
          grossReceipts: 20000,
          returnsAndAllowances: 0,
          costOfGoods: {
            inventoryBegin: 0,
            inventoryEnd: 0,
            purchases: 0,
            costOfLabor: 0,
            materialsAndSupplies: 0,
            otherCosts: 0
          },
          expenses: {
            advertising: 500,
            carAndTruck: 0,
            commissions: 0,
            contractLabor: 0,
            depletion: 0,
            depreciation: 0,
            employeeBenefit: 0,
            insurance: 0,
            interestMortgage: 0,
            interestOther: 0,
            legalAndProfessional: 0,
            officeExpense: 0,
            pensionAndProfitSharing: 0,
            rentVehicles: 0,
            rentOther: 0,
            repairsAndMaintenance: 0,
            supplies: 0,
            taxesAndLicenses: 0,
            travel: 0,
            meals: 0,
            utilities: 0,
            wages: 0,
            other: 0
          },
          vehicleDeduction: {
            vehicleType: '',
            datePlacedInService: '',
            totalMiles: 0,
            businessMiles: 1000,
            commutingMiles: 0,
            otherMiles: 0,
            availableOffDuty: false,
            anotherVehicle: false,
            evidence: false,
            evidenceWritten: false
          },
          otherExpenses: [],
          homeOffice: {
            areaUsed: 0,
            totalArea: 0,
            grossIncome: 0
          }
        }
      ]
    }
    const f1040 = createDefaultF1040(info)
    const scheduleC = new ScheduleC(f1040, info.scheduleCs[0])

    // Gross Income
    expect(scheduleC.l7()).toBe(20000)

    // Expenses
    expect(scheduleC.l8()).toBe(500)
    // Vehicle deduction: 1000 miles * 0.67 = 670
    expect(scheduleC.l9()).toBe(670)

    const expectedTotalExpenses = 500 + 670
    expect(scheduleC.l28()).toBe(expectedTotalExpenses)

    // Net Profit
    expect(scheduleC.l29()).toBe(20000 - expectedTotalExpenses)
    expect(scheduleC.l31()).toBe(20000 - expectedTotalExpenses)
  })
})
