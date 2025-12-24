import { ReactElement } from 'react'
import { Message, useForm, useWatch, FormProvider, useFieldArray } from 'react-hook-form'
import { useDispatch } from 'ustaxes/redux'
import { useYearSelector } from 'ustaxes/redux/yearDispatch'
import { useSelector } from 'react-redux'
import { Helmet } from 'react-helmet'

import {
  addScheduleC,
  editScheduleC,
  removeScheduleC
} from 'ustaxes/redux/actions'
import { usePager } from 'ustaxes/components/pager'
import {
  ScheduleC,
  Address,
  ScheduleCExpenseType,
  ScheduleCExpenseTypeName,
  PersonRole,
  TaxYear
} from 'ustaxes/core/data'
import { YearsTaxesState } from 'ustaxes/redux'
import AddressFields from 'ustaxes/components/TaxPayer/Address'
import {
  Currency,
  GenericLabeledDropdown,
  LabeledCheckbox,
  LabeledInput
} from 'ustaxes/components/input'
import { Patterns } from 'ustaxes/components/Patterns'
import { enumKeys, intentionallyFloat } from 'ustaxes/core/util'
import { BusinessOutlined, Add, Remove } from '@material-ui/icons'
import { FormListContainer } from 'ustaxes/components/FormContainer'
import { Grid, Button, IconButton } from '@material-ui/core'
import _ from 'lodash'

// Helper types for the form
interface ScheduleCForm {
  personRole: PersonRole.PRIMARY | PersonRole.SPOUSE
  businessName?: string
  address?: Address
  businessCode?: string
  ein?: string
  accountingMethod: 'Cash' | 'Accrual' | 'Other'
  accountingMethodOther?: string
  materiallyParticipate: boolean
  startedCurrentYear: boolean
  grossReceipts: number
  returnsAndAllowances: number
  costOfGoodsSold: number
  otherIncome: number
  expenses: Partial<{ [K in ScheduleCExpenseTypeName]: number }>
  otherExpenses: { description: string; amount: number }[]
}

const blankScheduleCForm: ScheduleCForm = {
  personRole: PersonRole.PRIMARY,
  accountingMethod: 'Cash',
  materiallyParticipate: true,
  startedCurrentYear: false,
  grossReceipts: 0,
  returnsAndAllowances: 0,
  costOfGoodsSold: 0,
  otherIncome: 0,
  expenses: {},
  otherExpenses: []
}

const displayExpense = (k: ScheduleCExpenseType): string => {
  const lookup = {
    [ScheduleCExpenseType.advertising]: 'Advertising',
    [ScheduleCExpenseType.carAndTruck]: 'Car and truck expenses',
    [ScheduleCExpenseType.commissions]: 'Commissions and fees',
    [ScheduleCExpenseType.contractLabor]: 'Contract labor',
    [ScheduleCExpenseType.depletion]: 'Depletion',
    [ScheduleCExpenseType.depreciation]: 'Depreciation',
    [ScheduleCExpenseType.employeeBenefitPrograms]: 'Employee benefit programs',
    [ScheduleCExpenseType.insurance]: 'Insurance (other than health)',
    [ScheduleCExpenseType.mortgageInterest]: 'Mortgage interest',
    [ScheduleCExpenseType.otherInterest]: 'Other interest',
    [ScheduleCExpenseType.legalAndProfessional]: 'Legal and professional services',
    [ScheduleCExpenseType.officeExpense]: 'Office expense',
    [ScheduleCExpenseType.pensionAndProfitSharing]: 'Pension and profit-sharing plans',
    [ScheduleCExpenseType.rentOrLeaseVehicles]: 'Rent or lease (vehicles, machinery, equipment)',
    [ScheduleCExpenseType.rentOrLeaseOther]: 'Rent or lease (other business property)',
    [ScheduleCExpenseType.repairsAndMaintenance]: 'Repairs and maintenance',
    [ScheduleCExpenseType.supplies]: 'Supplies',
    [ScheduleCExpenseType.taxesAndLicenses]: 'Taxes and licenses',
    [ScheduleCExpenseType.travel]: 'Travel',
    [ScheduleCExpenseType.meals]: 'Deductible meals',
    [ScheduleCExpenseType.utilities]: 'Utilities',
    [ScheduleCExpenseType.wages]: 'Wages (less employment credits)',
    [ScheduleCExpenseType.other]: 'Other expenses (list below)'
  }
  return lookup[k]
}

const toScheduleC = (formData: ScheduleCForm): ScheduleC => {
  return {
    ...formData,
    businessAddress: formData.address,
    grossReceipts: Number(formData.grossReceipts),
    returnsAndAllowances: Number(formData.returnsAndAllowances),
    costOfGoodsSold: Number(formData.costOfGoodsSold),
    otherIncome: Number(formData.otherIncome),
    expenses: Object.fromEntries(
      Object.entries(formData.expenses).map(([k, v]) => [k, Number(v)])
    ) as Partial<{ [K in ScheduleCExpenseTypeName]: number }>,
    otherExpenses: formData.otherExpenses.map(e => ({
      ...e,
      amount: Number(e.amount)
    }))
  }
}

export default function ScheduleCPage(): ReactElement {
  const defaultValues = blankScheduleCForm
  const methods = useForm<ScheduleCForm>({ defaultValues })
  const { handleSubmit, control, watch } = methods

  const dispatch = useDispatch()
  const { onAdvance, navButtons } = usePager()

  const scheduleCs: ScheduleC[] = useYearSelector(
    (state) => state.information.scheduleCs
  )

  const deleteScheduleC = (n: number): void => {
    dispatch(removeScheduleC(n))
  }

  const onAddScheduleC = (formData: ScheduleCForm): void => {
    dispatch(addScheduleC(toScheduleC(formData)))
  }

  const onEditScheduleC =
    (index: number) =>
    (formData: ScheduleCForm): void => {
      dispatch(editScheduleC({ value: toScheduleC(formData), index }))
    }

  const accountingMethod = useWatch({
    control,
    name: 'accountingMethod'
  })

  const { fields: otherExpenseFields, append: appendOtherExpense, remove: removeOtherExpense } = useFieldArray({
    control,
    name: "otherExpenses"
  });

  const expenseFields: ReactElement[] = enumKeys(ScheduleCExpenseType)
    .filter(k => k !== 'other')
    .map(
    (k, i) => (
      <LabeledInput
        key={i}
        label={displayExpense(ScheduleCExpenseType[k])}
        name={`expenses.${k.toString()}`}
        patternConfig={Patterns.currency}
        required={false}
      />
    )
  )

  const form = (
    <FormListContainer
      defaultValues={defaultValues}
      items={scheduleCs}
      icon={() => <BusinessOutlined />}
      primary={(p) => p.businessName || 'Business'}
      secondary={(p) => <Currency value={p.grossReceipts} />}
      onSubmitAdd={onAddScheduleC}
      onSubmitEdit={onEditScheduleC}
      removeItem={(i) => deleteScheduleC(i)}
    >
      <h3>Business Information</h3>
      <Grid container spacing={2}>
        <GenericLabeledDropdown
          dropDownData={[PersonRole.PRIMARY, PersonRole.SPOUSE]}
          label="Who owns this business?"
          textMapping={(r) => r === PersonRole.PRIMARY ? 'Primary Taxpayer' : 'Spouse'}
          keyMapping={(r) => r}
          name="personRole"
          valueMapping={(r) => r}
        />
        <LabeledInput name="businessName" label="Name of business" />
        <AddressFields
          autofocus={false}
          checkboxText="Does the business have a foreign address?"
          allowForeignCountry={false}
        />
        <LabeledInput name="businessCode" label="Business code" />
        <LabeledInput name="ein" label="Employer ID Number (EIN)" />
        <GenericLabeledDropdown
          dropDownData={['Cash', 'Accrual', 'Other']}
          label="Accounting Method"
          name="accountingMethod"
          valueMapping={(x) => x}
          textMapping={(x) => x}
          keyMapping={(x) => x}
        />
        {accountingMethod === 'Other' && (
          <LabeledInput name="accountingMethodOther" label="Specify other method" />
        )}
        <LabeledCheckbox
          name="materiallyParticipate"
          label="Did you materially participate in the operation of this business during the year?"
        />
        <LabeledCheckbox
          name="startedCurrentYear"
          label="Did you start or acquire this business during the year?"
        />
      </Grid>

      <h3>Income</h3>
      <Grid container spacing={2}>
        <LabeledInput
          name="grossReceipts"
          label="Gross receipts or sales"
          patternConfig={Patterns.currency}
        />
        <LabeledInput
          name="returnsAndAllowances"
          label="Returns and allowances"
          patternConfig={Patterns.currency}
        />
        <LabeledInput
          name="costOfGoodsSold"
          label="Cost of goods sold"
          patternConfig={Patterns.currency}
        />
        <LabeledInput
          name="otherIncome"
          label="Other income"
          patternConfig={Patterns.currency}
        />
      </Grid>

      <h3>Expenses</h3>
      <Grid container spacing={2}>
        {_.chain(expenseFields)
          .chunk(2)
          .map((segment, i) =>
            segment.map((item, k) => (
              <Grid item key={`${i}-${k}`} xs={12} sm={6}>
                {item}
              </Grid>
            ))
          )
          .value()}
      </Grid>
      <h4>Other Expenses</h4>
      <Grid container spacing={2}>
        {otherExpenseFields.map((field, index) => (
          <Grid item xs={12} key={field.id}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={6}>
                <LabeledInput
                  name={`otherExpenses.${index}.description`}
                  label="Description"
                />
              </Grid>
              <Grid item xs={4}>
                <LabeledInput
                  name={`otherExpenses.${index}.amount`}
                  label="Amount"
                  patternConfig={Patterns.currency}
                />
              </Grid>
              <Grid item xs={2}>
                <IconButton onClick={() => removeOtherExpense(index)}>
                  <Remove />
                </IconButton>
              </Grid>
            </Grid>
          </Grid>
        ))}
        <Grid item xs={12}>
          <Button
            startIcon={<Add />}
            onClick={() => appendOtherExpense({ description: '', amount: 0 })}
          >
            Add Other Expense
          </Button>
        </Grid>
      </Grid>
    </FormListContainer>
  )

  return (
    <FormProvider {...methods}>
      <form
        tabIndex={-1}
        onSubmit={intentionallyFloat(handleSubmit(onAdvance))}
      >
        <Helmet>
          <title>Self-Employment (Schedule C) | Income | UsTaxes.org</title>
        </Helmet>
        <h2>Self-Employment (Schedule C)</h2>
        {form}
        {navButtons}
      </form>
    </FormProvider>
  )
}
