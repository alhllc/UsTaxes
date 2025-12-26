import React from 'react';
import { DepreciableAsset } from 'ustaxes/core/data';
import {
  Button,
  Grid,
  IconButton,
  TextField,
  Typography,
  makeStyles,
  createStyles,
  Theme,
  MenuItem
} from '@material-ui/core';
import { Add, Delete } from '@material-ui/icons';
import NumberFormat from 'react-number-format';

export interface DepreciationInputProps {
  data: DepreciableAsset[] | undefined;
  onChange: (value: DepreciableAsset[]) => void;
}

const useStyles = makeStyles(({ palette, spacing }: Theme) =>
  createStyles({
    assetContainer: {
      padding: spacing(2),
      border: `1px solid ${palette.divider}`,
      borderRadius: spacing(1),
      marginBottom: spacing(2),
      backgroundColor: palette.background.paper,
      position: 'relative'
    },
    removeButton: {
      position: 'absolute',
      top: spacing(1),
      right: spacing(1),
    },
    sectionTitle: {
        marginBottom: spacing(2),
    }
  })
);

const emptyAsset: DepreciableAsset = {
  description: '',
  datePlacedInService: '',
  costBasis: 0,
  method: 'MACRS',
  recoveryPeriod: 5,
  convention: 'HY',
  priorDepreciation: 0
};

// Helper for currency/number inputs
const NumberInput = ({
  label,
  value,
  onChange,
  prefix,
  decimalScale
}: {
  label: string;
  value: number | undefined;
  onChange: (val: number) => void;
  prefix?: string;
  decimalScale?: number;
}) => {
  return (
    <NumberFormat
        customInput={TextField}
        label={label}
        value={value}
        onValueChange={(values) => {
            const floatValue = values.floatValue;
            onChange(floatValue === undefined ? 0 : floatValue);
        }}
        thousandSeparator={true}
        prefix={prefix}
        decimalScale={decimalScale}
        variant="filled"
        fullWidth
        InputLabelProps={{ shrink: true }}
    />
  );
};

export const DepreciationInput = ({ data, onChange }: DepreciationInputProps) => {
  const classes = useStyles();
  const assets = data || [];

  const updateAsset = (index: number, updates: Partial<DepreciableAsset>) => {
    const newAssets = [...assets];
    newAssets[index] = { ...newAssets[index], ...updates };
    onChange(newAssets);
  };

  const addAsset = () => {
    onChange([...assets, { ...emptyAsset }]);
  };

  const removeAsset = (index: number) => {
    const newAssets = [...assets];
    newAssets.splice(index, 1);
    onChange(newAssets);
  };

  return (
    <div>
      <Typography variant="h5" className={classes.sectionTitle}>Depreciation (Form 4562)</Typography>
      {assets.map((asset, index) => (
        <div key={index} className={classes.assetContainer}>
          <IconButton
            className={classes.removeButton}
            onClick={() => removeAsset(index)}
            aria-label="delete asset"
          >
            <Delete />
          </IconButton>

          <Grid container spacing={2}>
             <Grid item xs={12}>
                <Typography variant="h6">Asset {index + 1}</Typography>
             </Grid>

            {/* Description & Date */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="Description"
                variant="filled"
                fullWidth
                value={asset.description || ''}
                onChange={(e) => updateAsset(index, { description: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Date Placed in Service"
                type="date"
                variant="filled"
                fullWidth
                value={asset.datePlacedInService || ''}
                onChange={(e) => updateAsset(index, { datePlacedInService: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            {/* Cost & Prior Depreciation */}
            <Grid item xs={12} sm={6}>
               <NumberInput
                 label="Cost or Basis"
                 value={asset.costBasis}
                 onChange={(v) => updateAsset(index, { costBasis: v })}
                 prefix="$"
                 decimalScale={2}
               />
            </Grid>
            <Grid item xs={12} sm={6}>
               <NumberInput
                 label="Prior Year Depreciation"
                 value={asset.priorDepreciation}
                 onChange={(v) => updateAsset(index, { priorDepreciation: v })}
                 prefix="$"
                 decimalScale={2}
               />
            </Grid>

            {/* Method, Recovery, Convention */}
            <Grid item xs={12} sm={4}>
                <TextField
                    select
                    label="Method"
                    value={asset.method}
                    onChange={(e) => updateAsset(index, { method: e.target.value as 'MACRS' | 'Other' })}
                    variant="filled"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                >
                    <MenuItem value="MACRS">MACRS</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                </TextField>
            </Grid>
             <Grid item xs={12} sm={4}>
                <TextField
                    select
                    label="Recovery Period"
                    value={asset.recoveryPeriod}
                    onChange={(e) => updateAsset(index, { recoveryPeriod: Number(e.target.value) })}
                    variant="filled"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                >
                    <MenuItem value={3}>3 Years</MenuItem>
                    <MenuItem value={5}>5 Years</MenuItem>
                    <MenuItem value={7}>7 Years</MenuItem>
                    <MenuItem value={10}>10 Years</MenuItem>
                    <MenuItem value={15}>15 Years</MenuItem>
                    <MenuItem value={20}>20 Years</MenuItem>
                    <MenuItem value={27.5}>27.5 Years</MenuItem>
                    <MenuItem value={39}>39 Years</MenuItem>
                </TextField>
            </Grid>
            <Grid item xs={12} sm={4}>
                 <TextField
                    select
                    label="Convention"
                    value={asset.convention}
                    onChange={(e) => updateAsset(index, { convention: e.target.value as 'HY' | 'MQ' | 'MM' })}
                    variant="filled"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                >
                    <MenuItem value="HY">Half-Year</MenuItem>
                    <MenuItem value="MQ">Mid-Quarter</MenuItem>
                    <MenuItem value="MM">Mid-Month</MenuItem>
                </TextField>
            </Grid>

          </Grid>
        </div>
      ))}
      <Button
        variant="outlined"
        startIcon={<Add />}
        onClick={addAsset}
      >
        Add Asset
      </Button>
    </div>
  );
};
