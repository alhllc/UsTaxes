import React from 'react';
import { VehicleExpense } from 'ustaxes/core/data';
import {
  Button,
  Grid,
  IconButton,
  TextField,
  Typography,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  makeStyles,
  createStyles,
  Theme
} from '@material-ui/core';
import { Add, Delete } from '@material-ui/icons';
import { Patterns } from 'ustaxes/components/Patterns';
import NumberFormat from 'react-number-format';

export interface VehicleInputProps {
  data: VehicleExpense[] | undefined;
  onChange: (value: VehicleExpense[]) => void;
}

const useStyles = makeStyles(({ palette, spacing }: Theme) =>
  createStyles({
    vehicleContainer: {
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

const emptyVehicle: VehicleExpense = {
  makeModel: '',
  datePlacedInService: '',
  totalMiles: 0,
  businessMiles: 0,
  commutingMiles: 0,
  otherMiles: 0,
  availableForPersonalUse: undefined,
  spouseAvailable: undefined,
  evidenceSupported: undefined,
  evidenceWritten: undefined,
};

// Helper for currency/number inputs to match LabeledInput style
const NumberInput = ({
  label,
  value,
  onChange,
  prefix,
}: {
  label: string;
  value: number | undefined;
  onChange: (val: number) => void;
  prefix?: string;
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
        variant="filled"
        fullWidth
        InputLabelProps={{ shrink: true }}
    />
  );
};

const BooleanQuestion = ({
    label,
    value,
    onChange
}: {
    label: string;
    value: boolean | undefined;
    onChange: (val: boolean) => void;
}) => {
    return (
        <FormControl component="fieldset" style={{ marginTop: 16 }}>
            <FormLabel component="legend">{label}</FormLabel>
            <RadioGroup
                row
                value={value === undefined ? '' : value.toString()}
                onChange={(e) => onChange(e.target.value === 'true')}
            >
                <FormControlLabel value="true" control={<Radio />} label="Yes" />
                <FormControlLabel value="false" control={<Radio />} label="No" />
            </RadioGroup>
        </FormControl>
    );
};


export const VehicleInput = ({ data, onChange }: VehicleInputProps) => {
  const classes = useStyles();
  const vehicles = data || [];

  const updateVehicle = (index: number, updates: Partial<VehicleExpense>) => {
    const newVehicles = [...vehicles];
    newVehicles[index] = { ...newVehicles[index], ...updates };
    onChange(newVehicles);
  };

  const addVehicle = () => {
    onChange([...vehicles, { ...emptyVehicle }]);
  };

  const removeVehicle = (index: number) => {
    const newVehicles = [...vehicles];
    newVehicles.splice(index, 1);
    onChange(newVehicles);
  };

  return (
    <div>
      <Typography variant="h5" className={classes.sectionTitle}>Vehicle Expenses (Part IV)</Typography>
      {vehicles.map((vehicle, index) => (
        <div key={index} className={classes.vehicleContainer}>
          <IconButton
            className={classes.removeButton}
            onClick={() => removeVehicle(index)}
            aria-label="delete vehicle"
          >
            <Delete />
          </IconButton>

          <Grid container spacing={2}>
             <Grid item xs={12}>
                <Typography variant="h6">Vehicle {index + 1}</Typography>
             </Grid>

            {/* Make/Model & Date */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="Make and Model"
                variant="filled"
                fullWidth
                value={vehicle.makeModel || ''}
                onChange={(e) => updateVehicle(index, { makeModel: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Date Placed in Service"
                type="date"
                variant="filled"
                fullWidth
                value={vehicle.datePlacedInService || ''}
                onChange={(e) => updateVehicle(index, { datePlacedInService: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            {/* Miles */}
            <Grid item xs={12} sm={6}>
               <NumberInput
                 label="Total Miles"
                 value={vehicle.totalMiles}
                 onChange={(v) => updateVehicle(index, { totalMiles: v })}
               />
            </Grid>
            <Grid item xs={12} sm={6}>
               <NumberInput
                 label="Business Miles"
                 value={vehicle.businessMiles}
                 onChange={(v) => updateVehicle(index, { businessMiles: v })}
               />
            </Grid>
            <Grid item xs={12} sm={6}>
               <NumberInput
                 label="Commuting Miles"
                 value={vehicle.commutingMiles}
                 onChange={(v) => updateVehicle(index, { commutingMiles: v })}
               />
            </Grid>
            <Grid item xs={12} sm={6}>
               <NumberInput
                 label="Other Miles"
                 value={vehicle.otherMiles}
                 onChange={(v) => updateVehicle(index, { otherMiles: v })}
               />
            </Grid>

            {/* Questions */}
            <Grid item xs={12}>
                <BooleanQuestion
                    label="Available for personal use?"
                    value={vehicle.availableForPersonalUse}
                    onChange={(v) => updateVehicle(index, { availableForPersonalUse: v })}
                />
            </Grid>
            <Grid item xs={12}>
                <BooleanQuestion
                    label="Do you (or your spouse) have another vehicle available for personal use?"
                    value={vehicle.spouseAvailable}
                    onChange={(v) => updateVehicle(index, { spouseAvailable: v })}
                />
            </Grid>
            <Grid item xs={12}>
                <BooleanQuestion
                    label="Do you have evidence to support your deduction?"
                    value={vehicle.evidenceSupported}
                    onChange={(v) => updateVehicle(index, { evidenceSupported: v })}
                />
            </Grid>
             <Grid item xs={12}>
                <BooleanQuestion
                    label="If 'Yes', is the evidence written?"
                    value={vehicle.evidenceWritten}
                    onChange={(v) => updateVehicle(index, { evidenceWritten: v })}
                />
            </Grid>
          </Grid>
        </div>
      ))}
      <Button
        variant="outlined"
        startIcon={<Add />}
        onClick={addVehicle}
      >
        Add Vehicle
      </Button>
    </div>
  );
};
