import React from 'react';
import { HomeOffice } from 'ustaxes/core/data';
import {
  Grid,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  InputAdornment,
  Box,
  Typography
} from '@material-ui/core';
import NumberFormat from 'react-number-format';

export interface HomeOfficeInputProps {
  data: HomeOffice | undefined;
  onChange: (value: HomeOffice) => void;
}

interface NumberInputProps {
  label: string;
  value: number | undefined;
  onChange: (val: number | undefined) => void;
  prefix?: string;
  suffix?: string;
  decimalScale?: number;
  id?: string;
}

const NumberInput = ({ label, value, onChange, prefix, suffix, decimalScale, id }: NumberInputProps) => {
  const inputId = id || label.replace(/\s+/g, '-').toLowerCase();
  return (
    <NumberFormat
      customInput={TextField}
      label={label}
      value={value}
      onValueChange={(values) => {
        onChange(values.floatValue);
      }}
      thousandSeparator={true}
      prefix={prefix}
      suffix={suffix}
      decimalScale={decimalScale}
      allowNegative={false}
      fullWidth
      variant="filled"
      id={inputId}
      InputLabelProps={{ shrink: true, htmlFor: inputId }}
      InputProps={{
        startAdornment: prefix ? <InputAdornment position="start">{prefix}</InputAdornment> : undefined,
        endAdornment: suffix ? <InputAdornment position="end">{suffix}</InputAdornment> : undefined,
      }}
    />
  );
};

export const HomeOfficeInput = ({ data, onChange }: HomeOfficeInputProps) => {
  const homeOffice = data || {};

  const handleUpdate = (updates: Partial<HomeOffice>) => {
    onChange({ ...homeOffice, ...updates });
  };

  const handleExpenseUpdate = (key: keyof NonNullable<HomeOffice['expenses']>, value: number | undefined) => {
    const expenses = homeOffice.expenses || {};
    handleUpdate({
      expenses: {
        ...expenses,
        [key]: value
      }
    });
  };

  const areaUsed = homeOffice.areaUsed || 0;
  const totalArea = homeOffice.totalArea || 0;
  const percentage = totalArea > 0 ? (areaUsed / totalArea) * 100 : 0;

  return (
    <div className="p-4 border rounded bg-gray-50 mb-4">
      <h3 className="font-bold mb-4">Home Office Deduction (Form 8829)</h3>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <FormControl component="fieldset">
            <FormLabel component="legend">Calculation Method</FormLabel>
            <RadioGroup
              aria-label="method"
              name="method"
              value={homeOffice.method || 'simplified'}
              onChange={(e) => handleUpdate({ method: e.target.value as 'simplified' | 'actual', simplifiedRate: e.target.value === 'simplified' })}
            >
              <FormControlLabel value="simplified" control={<Radio color="primary" />} label="Simplified Method ($5/sqft)" />
              <FormControlLabel value="actual" control={<Radio color="primary" />} label="Actual Expenses" />
            </RadioGroup>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={4}>
          <NumberInput
            label="Total Area of Home"
            value={homeOffice.totalArea}
            onChange={(val) => handleUpdate({ totalArea: val })}
            suffix=" sq ft"
            decimalScale={0}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <NumberInput
            label="Area Used for Business"
            value={homeOffice.areaUsed}
            onChange={(val) => handleUpdate({ areaUsed: val })}
            suffix=" sq ft"
            decimalScale={0}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
           <Box display="flex" flexDirection="column" justifyContent="center" height="100%">
             <Typography variant="caption" color="textSecondary">Business Percentage</Typography>
             <Typography variant="h6">{percentage.toFixed(2)}%</Typography>
           </Box>
        </Grid>

        {homeOffice.method === 'actual' && (
          <>
            <Grid item xs={12}>
              <Typography variant="subtitle1" className="mt-2 font-semibold">Actual Expenses</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <NumberInput
                label="Mortgage Interest"
                value={homeOffice.expenses?.mortgageInterest}
                onChange={(val) => handleExpenseUpdate('mortgageInterest', val)}
                prefix="$"
                decimalScale={2}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <NumberInput
                label="Real Estate Taxes"
                value={homeOffice.expenses?.realEstateTaxes}
                onChange={(val) => handleExpenseUpdate('realEstateTaxes', val)}
                prefix="$"
                decimalScale={2}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <NumberInput
                label="Insurance"
                value={homeOffice.expenses?.insurance}
                onChange={(val) => handleExpenseUpdate('insurance', val)}
                prefix="$"
                decimalScale={2}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <NumberInput
                label="Rent"
                value={homeOffice.expenses?.rent}
                onChange={(val) => handleExpenseUpdate('rent', val)}
                prefix="$"
                decimalScale={2}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <NumberInput
                label="Repairs and Maintenance"
                value={homeOffice.expenses?.repairsAndMaintenance}
                onChange={(val) => handleExpenseUpdate('repairsAndMaintenance', val)}
                prefix="$"
                decimalScale={2}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <NumberInput
                label="Utilities"
                value={homeOffice.expenses?.utilities}
                onChange={(val) => handleExpenseUpdate('utilities', val)}
                prefix="$"
                decimalScale={2}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <NumberInput
                label="Other Expenses"
                value={homeOffice.expenses?.other}
                onChange={(val) => handleExpenseUpdate('other', val)}
                prefix="$"
                decimalScale={2}
              />
            </Grid>
             <Grid item xs={12} sm={6}>
              <NumberInput
                label="Carryover from Prior Year"
                value={homeOffice.expenses?.carryoverPriorYear}
                onChange={(val) => handleExpenseUpdate('carryoverPriorYear', val)}
                prefix="$"
                decimalScale={2}
              />
            </Grid>
          </>
        )}
      </Grid>
    </div>
  );
};
