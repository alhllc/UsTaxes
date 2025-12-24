import React from 'react';
import { HomeOffice } from 'ustaxes/core/data';

export interface HomeOfficeInputProps {
  data: HomeOffice | undefined;
  onChange: (value: HomeOffice) => void;
}

export const HomeOfficeInput = ({ data, onChange }: HomeOfficeInputProps) => {
  return (
    <div className="p-4 border rounded bg-gray-50 mb-4">
      <h3 className="font-bold">Home Office Deduction (Form 8829)</h3>
      <p className="text-gray-500 italic">Module not implemented yet.</p>
      {/* Agent "HomeOffice" will implement fields here */}
    </div>
  );
};
