import React from 'react';
import { CostOfGoods } from 'ustaxes/core/data';

export interface COGSInputProps {
  data: CostOfGoods | undefined;
  onChange: (value: CostOfGoods) => void;
}

export const COGSInput = ({ data, onChange }: COGSInputProps) => {
  return (
    <div className="p-4 border rounded bg-gray-50 mb-4">
      <h3 className="font-bold">Cost of Goods Sold (Part III)</h3>
      <p className="text-gray-500 italic">Module not implemented yet.</p>
      {/* Agent "Inventory" will implement fields here */}
    </div>
  );
};
