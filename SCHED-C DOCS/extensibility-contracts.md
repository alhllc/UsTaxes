
---

### **Contract 1: The Data Schema (`federal.ts`)**

This defines the shape of the data so all agents know what fields to read/write.

**File:** `src/forms/Y2021/data/federal.ts`
**Instruction:** Find the `ScheduleC` interface and **replace/extend** it with this definition.

```typescript
// ... existing imports

export interface VehicleExpense {
  makeModel?: string;
  datePlacedInService?: string;
  totalMiles?: number;
  businessMiles?: number;
  commutingMiles?: number;
  otherMiles?: number;
  availableForPersonalUse?: boolean;
  spouseAvailable?: boolean;
  evidenceSupported?: boolean;
  evidenceWritten?: boolean;
}

export interface CostOfGoods {
  method?: 'cost' | 'lowerOfCostOrMarket' | 'other';
  openingInventory?: number;
  purchases?: number;
  costOfLabor?: number;
  materialsAndSupplies?: number;
  otherCosts?: number;
  closingInventory?: number;
}

export interface HomeOffice {
  address?: string;
  areaUsed?: number;
  totalArea?: number;
  method?: 'simplified' | 'actual';
  simplifiedRate?: boolean; // True if using $5/sqft method
  grossIncome?: number; // Usually derived, but helpful for form logic
  expenses?: {
    mortgageInterest?: number;
    realEstateTaxes?: number;
    insurance?: number;
    rent?: number;
    repairsAndMaintenance?: number;
    utilities?: number;
    other?: number;
    carryoverPriorYear?: number;
  }
}

export interface ScheduleC {
  // --- Existing Basic Info ---
  businessName?: string;
  businessCode?: string;
  ein?: string;
  address?: string;
  accountingMethod?: 'cash' | 'accrual' | 'other';
  
  // --- Income ---
  grossReceipts?: number;
  returnsAndAllowances?: number;
  otherIncome?: number;

  // --- New Modules (The Contract) ---
  costOfGoods?: CostOfGoods;
  vehicleExpenses?: VehicleExpense[]; 
  homeOffice?: HomeOffice; 

  // --- General Expenses ---
  advertising?: number;
  carAndTruckExpenses?: number; // Calculated or direct entry
  commissionsAndFees?: number;
  contractLabor?: number;
  depletion?: number;
  depreciation?: number;
  employeeBenefitPrograms?: number;
  insurance?: number;
  interestMortgage?: number;
  interestOther?: number;
  legalAndProfessionalServices?: number;
  officeExpense?: number;
  pensionAndProfitSharing?: number;
  rentVehicles?: number;
  rentOther?: number;
  repairsAndMaintenance?: number;
  supplies?: number;
  taxesAndLicenses?: number;
  travel?: number;
  meals?: number; // 50% or 100% logic handled in code usually
  utilities?: number;
  wages?: number;
  otherExpenses?: { description: string; amount: number }[];
  
  // --- Questions ---
  materiallyParticipate?: boolean;
  startedOrAcquired?: boolean;
  payments1099?: boolean;
  filed1099?: boolean;
}

```

---

### **Contract 2: The UI Component Shells**

Create these files. They are empty "black boxes" that your agents will fill with logic later.

**Directory:** `src/components/income/scheduleC_modules/` (Create this folder)

**File 1:** `HomeOfficeInput.tsx`

```typescript
import React from 'react';
import { ScheduleC, HomeOffice } from '../../../forms/Y2021/data/federal';

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

```

**File 2:** `COGSInput.tsx`

```typescript
import React from 'react';
import { ScheduleC, CostOfGoods } from '../../../forms/Y2021/data/federal';

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

```

**File 3:** `VehicleInput.tsx`

```typescript
import React from 'react';
import { VehicleExpense } from '../../../forms/Y2021/data/federal';

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

```

---

### **Contract 3: The Integration Point (`ScheduleC.tsx`)**

Update the main page to render these shells.

**File:** `src/components/income/ScheduleC.tsx`
**Instruction:** Import the new components and add them to the JSX.

```typescript
// ... imports
import { HomeOfficeInput } from './scheduleC_modules/HomeOfficeInput';
import { COGSInput } from './scheduleC_modules/COGSInput';
import { VehicleInput } from './scheduleC_modules/VehicleInput';

// ... inside the component function
// Assuming 'scheduleC' is the current form state object

return (
  <FormContainer>
    {/* ... Existing General Info Inputs ... */}

    <hr className="my-6" />
    
    {/* COGS Module Injection */}
    <COGSInput 
      data={scheduleC.costOfGoods} 
      onChange={(cogs) => updateFields({ costOfGoods: cogs })} 
    />

    <hr className="my-6" />

    {/* Vehicle Module Injection */}
    <VehicleInput 
      data={scheduleC.vehicleExpenses} 
      onChange={(vehicles) => updateFields({ vehicleExpenses: vehicles })} 
    />

    <hr className="my-6" />

    {/* Home Office Module Injection */}
    <HomeOfficeInput 
      data={scheduleC.homeOffice} 
      onChange={(ho) => updateFields({ homeOffice: ho })} 
    />

    {/* ... Existing Expenses Inputs ... */}
  </FormContainer>
)

```
