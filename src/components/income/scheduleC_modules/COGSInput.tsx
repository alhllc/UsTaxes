import React from 'react';
import { CostOfGoods } from 'ustaxes/core/data';
import {
  Grid,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  InputAdornment
} from '@material-ui/core';
import NumberFormat from 'react-number-format';

export interface COGSInputProps {
  data: CostOfGoods | undefined;
  onChange: (value: CostOfGoods) => void;
}

interface CurrencyInputProps {
  field: Exclude<keyof CostOfGoods, 'method'>;
  label: string;
  value: number | undefined;
  onChange: (value: number | undefined) => void;
}

const CurrencyInput = ({ field, label, value, onChange }: CurrencyInputProps) => (
  <Grid item xs={12} sm={6}>
    <NumberFormat
      customInput={TextField}
      id={`cogs-${field}`}
      label={label}
      value={value ?? ''}
      onValueChange={(values) => {
        onChange(values.floatValue);
      }}
      thousandSeparator={true}
      decimalScale={2}
      fixedDecimalScale={false}
      allowEmptyFormatting={true}
      InputProps={{
        startAdornment: <InputAdornment position="start">$</InputAdornment>
      }}
      fullWidth
      variant="filled"
      InputLabelProps={{ shrink: true }}
    />
  </Grid>
);

export const COGSInput = ({ data, onChange }: COGSInputProps) => {
  const updateField = <K extends keyof CostOfGoods>(field: K, value: CostOfGoods[K]) => {
    onChange({
      ...data,
      [field]: value
    });
  };

  return (
    <div className="p-4 border rounded bg-gray-50 mb-4">
      <h3 className="font-bold">Cost of Goods Sold (Part III)</h3>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <FormControl component="fieldset">
            <FormLabel component="legend">Method used to value closing inventory:</FormLabel>
            <RadioGroup
              row
              name="method"
              value={data?.method ?? ''}
              onChange={(e) => updateField('method', e.target.value as CostOfGoods['method'])}
            >
              <FormControlLabel value="cost" control={<Radio color="primary" />} label="Cost" />
              <FormControlLabel value="lowerOfCostOrMarket" control={<Radio color="primary" />} label="Lower of cost or market" />
              <FormControlLabel value="other" control={<Radio color="primary" />} label="Other" />
            </RadioGroup>
          </FormControl>
        </Grid>

        <CurrencyInput
          field="openingInventory"
          label="Inventory at beginning of year"
          value={data?.openingInventory}
          onChange={(val) => updateField('openingInventory', val)}
        />
        <CurrencyInput
          field="purchases"
          label="Purchases less cost of items withdrawn for personal use"
          value={data?.purchases}
          onChange={(val) => updateField('purchases', val)}
        />
        <CurrencyInput
          field="costOfLabor"
          label="Cost of labor"
          value={data?.costOfLabor}
          onChange={(val) => updateField('costOfLabor', val)}
        />
        <CurrencyInput
          field="materialsAndSupplies"
          label="Materials and supplies"
          value={data?.materialsAndSupplies}
          onChange={(val) => updateField('materialsAndSupplies', val)}
        />
        <CurrencyInput
          field="otherCosts"
          label="Other costs"
          value={data?.otherCosts}
          onChange={(val) => updateField('otherCosts', val)}
        />
        <CurrencyInput
          field="closingInventory"
          label="Inventory at end of year"
          value={data?.closingInventory}
          onChange={(val) => updateField('closingInventory', val)}
        />
      </Grid>
    </div>
  );
};
