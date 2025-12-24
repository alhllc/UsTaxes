import React from 'react';
import { VehicleExpense } from 'ustaxes/core/data';

export interface VehicleInputProps {
  data: VehicleExpense[] | undefined;
  onChange: (value: VehicleExpense[]) => void;
}

export const VehicleInput = ({ data, onChange }: VehicleInputProps) => {
  return (
    <div className="p-4 border rounded bg-gray-50 mb-4">
      <h3 className="font-bold">Vehicle Expenses (Part IV)</h3>
      <p className="text-gray-500 italic">Module not implemented yet.</p>
      {/* Agent "Vehicle" will implement fields here */}
    </div>
  );
};
