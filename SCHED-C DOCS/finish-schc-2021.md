# Schedule C Implementation: 2021 Audit & Strategy Evaluation

---

## 1. 2021-Scoped Audit Report

My audit confirms that the repository is well-positioned for the "Finish 2021 then Scale" strategy.

### 2021 Form Logic (`src/forms/Y2021/irsForms/ScheduleC.ts`):

* **Status:** Partially Implemented.

* ✅ **Present:** Basic structure, Income (Part I), and Expenses (Part II) are mapped. `l31` (Net Profit) is calculated.

* ✅ **Integration:** `ScheduleSE.ts` (Self-Employment Tax) correctly pulls `l31` from Schedule C.

* ❌ **Missing:**

    * **Part III (COGS):** Mostly stubbed. `l33`–`l42` need logic.

    * **Part IV (Vehicle):** Completely undefined (`undefined`).

    * **Part V (Other Expenses):** Logic exists (`l48`), but relies on the UI populating the data.

    * **Home Office:** `l30` is explicitly `Todo: // TODO: Form 8829 support`.

---

### Shared UI (`src/components/income/ScheduleC.tsx`):

* **Status:** Shared across all years.

* ✅ **Structure:** It binds to the shared `ScheduleC` data interface. Improvements here immediately benefit 2021.

* ❌ **Gaps:** The sub-modules (COGS, Vehicle, Home Office) are placeholders. These need to be built to feed data into the 2021 form logic.

---

### State Integration (`src/forms/Y2021/stateForms/`):

* **Status:** Ready for MO.

* ✅ **Structure:** The directory `MO/` exists with a placeholder `Form.ts`.

* ✅ **Registry:** `stateForms/index.ts` is where we will hook up the MO form once implemented.

---

## 2. Strategy Evaluation: "Build 2021 then Scale"

**Verdict:** 🟢 **Highly Viable**

This is the correct approach for this codebase.

* **Isolated Form Logic:** The PDF mapping and line-by-line calculations are strictly separated by year directories (`Y2021`, `Y2022`, etc.). This means we can perfect `src/forms/Y2021/irsForms/ScheduleC.ts` without fear of breaking or being constrained by other years.

* **Shared Data Contract:** The data model (`src/core/data/index.ts`) is shared. Adding fields for COGS/Vehicles there (which we've already completed) makes them available for all years.

### Scaling Mechanism:

Once 2021 is complete:

1.  **Copy:** `cp src/forms/Y2021/irsForms/ScheduleC.ts src/forms/Y2022/irsForms/ScheduleC.ts`

2.  **Adjust:** We only need to check the 2022 PDF for line number shifts or rate changes (e.g., mileage rate).

3.  The UI will already be working because it's shared.

---

## 3. README-2021-PLAN.md Draft

Here is the draft you requested.

> **Note:** Copy the content below into `README-2021-PLAN.md`

# Schedule C Implementation Plan (2021 Focused)

---

## Goal

Complete the full implementation of **Federal Schedule C (Profit or Loss From Business)** for the **2021 Tax Year**, along with **Missouri (MO)** state integration, before scaling logic to subsequent years.

---

## Strategy: "2021 First"

The codebase separates PDF mapping logic by year (`src/forms/Y{YEAR}/`) but shares the frontend UI and data model.

Our strategy is to:

1.  **Frontend:** Build the shared UI modules (Inventory, Vehicles, Home Office).

2.  **Logic:** Implement the complete 2021 backend logic in `src/forms/Y2021/irsForms/ScheduleC.ts`.

3.  **State:** Implement the 2021 Missouri Schedule C adjustments.

4.  **Scale:** Once verified, copy the 2021 logic to 2022/2023/2024, adjusting only for annual rule changes (line numbers, standard mileage rates, etc.).

---

## Work Streams

### 1. Frontend (Shared UI)

*Located in `src/components/income/scheduleC_modules/`*

- [ ] **Inventory (COGS):** Implement input for opening/closing inventory, purchases, labor.

- [ ] **Vehicles:** Implement multi-vehicle list with mileage tracking (Business/Commuting) and "Standard Mileage vs. Actual" selection.

- [ ] **Home Office:** Implement "Simplified Method" vs. "Actual Expenses" toggle and inputs.

### 2. Backend Logic (2021)

*Located in `src/forms/Y2021/irsForms/ScheduleC.ts`*

- [ ] **Part III (COGS):** Map data fields to Lines 33–42.

- [ ] **Part IV (Vehicle):** Calculate deduction based on 2021 Standard Mileage Rate (**56 cents/mile**).

- [ ] **Part V (Other Expenses):** ensure `otherExpenses` list sums correctly to Line 48.

- [ ] **Line 30 (Home Office):** Implement deduction logic (Form 8829 simplified worksheet).

- [ ] **Integration:** Verify `l31` (Net Profit) flows correctly to **Schedule 1** and **Schedule SE**.

### 3. State Integration (Missouri 2021)

*Located in `src/forms/Y2021/stateForms/MO/`*

- [ ] **Form MO-1040:** scaffolding.

- [ ] **Additions/Subtractions:** Handle any Schedule C adjustments (rare for MO, but checks are needed).

- [ ] **Registry:** Register MO in `src/forms/Y2021/stateForms/index.ts`.

---

## Development Commands

* **Run App:** `npm start` (Runs on port 3000)

* **Test 2021:** `npx craco test src/forms/Y2021`

----------------------------------

# AUDIT & AGENT ROLES

Here is the Schedule C Implementation Plan, including an audit, TODO list, and specialized agent prompts for parallel development.

---

## 1. Repository Audit Report

### Data Model (`src/core/data/index.ts`):

* ✅ **Complete.** The `ScheduleC` interface is well-defined.

* ✅ Sub-interfaces `CostOfGoods`, `VehicleExpense`, and `HomeOffice` are present and correct.

---

### UI Components (`src/components/income/`):

* ⚠️ **Partial.** `ScheduleC.tsx` handles the main form structure (Income, Expenses) and correctly orchestrates the sub-modules.

* ❌ **Missing.** The sub-modules (`COGSInput.tsx`, `VehicleInput.tsx`, `HomeOfficeInput.tsx`) are currently placeholder stubs returning "Module not implemented yet".

---

### Form Logic (`src/forms/Y2024/irsForms/ScheduleC.ts`):

* ❌ **Empty.** The class exists but contains no logic. `l1` (Gross Receipts) and `l31` (Net Profit) are undefined. `fields` returns an empty array.

---

### Integration:

* ❌ **Disconnected.** `ScheduleSE.ts` has a specific TODO (`// TODO: Net profit or (loss) from Schedule C, line 31`) indicating it is not yet pulling data from Schedule C.

---

## 2. Schedule C TODO List

### User Interface (Frontend)

* **Inventory:** Implement `COGSInput.tsx` to handle openingInventory, purchases, labor, materials, closingInventory.

* **Vehicles:** Implement `VehicleInput.tsx` to manage a list of vehicles, mileage types (business/commuting), and standard questions.

* **Home Office:** Implement `HomeOfficeInput.tsx` for Simplified ($5/sqft) vs. Actual Expense methods.

---

### Form Logic (Backend/Calculation)

* **Part I (Income):** Calculate Gross Receipts, subtract Returns/COGS to get Gross Income.

* **Part II (Expenses):** Sum up lines 8-27. Handle 50% meal deduction.

* **Part III (COGS):** Implement logic for Lines 33-42.

* **Part IV (Vehicles):** Calculate standard mileage deduction (Rate * Business Miles).

* **Part V (Other Expenses):** Sum "Other Expenses" list.

* **Net Profit:** Calculate Line 31 (Income - Expenses - Home Office Deduction).

---

### Integration

* **Schedule SE:** Update `l2` in `ScheduleSE.ts` to pull from `f1040.scheduleC.l31()`.

* **Schedule 1:** Ensure Line 3 pulls from Schedule C.

* **PDF Mapping:** Map calculated lines to the official IRS Schedule C PDF fields in `ScheduleC.ts`.

---

## 3. Agent Prompts (For Parallel Development)

You can assign these prompts to separate agents to work in parallel.

---





# Agent 1: Inventory & COGS Module

**Scope:** `src/components/income/scheduleC_modules/COGSInput.tsx`

**Instructions:**

1.  Read `src/core/data/index.ts` to understand the `CostOfGoods` interface.

2.  Edit `src/components/income/scheduleC_modules/COGSInput.tsx`.

3.  Implement the form fields within the existing component structure to capture:

    * Valuation Method (Cost, Lower of Cost or Market, Other).

    * Opening Inventory.

    * Purchases (less personal use).

    * Cost of Labor.

    * Materials and Supplies.

    * Other Costs.

    * Closing Inventory.

4.  Ensure numeric inputs use the Currency pattern (or `Patterns.currency`).

5.  **Constraint:** Use the props provided (`data` and `onChange`). Do not modify the parent `ScheduleC.tsx`.

---

# Agent 2: Vehicle Expenses Module

**Scope:** `src/components/income/scheduleC_modules/VehicleInput.tsx`

**Instructions:**

1.  Read `src/core/data/index.ts` to understand the `VehicleExpense` interface.

2.  Edit `src/components/income/scheduleC_modules/VehicleInput.tsx`.

3.  Implement a list/array input allowing the user to add multiple vehicles.

4.  For each vehicle, capture:

    * Make/Model & Date Placed in Service.

    * Total Miles, Business Miles, Commuting Miles, Other Miles.

    * Yes/No questions: "Available for personal use?", "Do you have another vehicle?", "Do you have evidence?", "Is it written?".

5.  **Constraint:** Ensure data updates propagate correctly via the `onChange` prop.

---

# Agent 3: Home Office Module

**Scope:** `src/components/income/scheduleC_modules/HomeOfficeInput.tsx`

**Instructions:**

1.  Read `src/core/data/index.ts` to understand the `HomeOffice` interface.

2.  Edit `src/components/income/scheduleC_modules/HomeOfficeInput.tsx`.

3.  Implement a toggle for Simplified Method vs. Actual Expenses.

4.  Inputs Required:

    * Total Area of Home (sq ft).

    * Area used for Business (sq ft).

    * Calculated percentage (display only).

    * If "Actual Expenses" is selected, allow entry of Mortgage Interest, Real Estate Taxes, Insurance, Rent, Utilities, etc.

5.  **Constraint:** Stick to the `HomeOffice` data contract.

---

# Agent 4: Core Logic & Integration

**Scope:** `src/forms/Y2024/irsForms/ScheduleC.ts`, `src/forms/Y2024/irsForms/ScheduleSE.ts`

**Instructions:**

1.  Edit `src/forms/Y2024/irsForms/ScheduleC.ts`.

2.  **Calculations:** Implement methods for `l1` (Gross Receipts) through `l31` (Net Profit). If the file is currently empty, initialize the class structure extending `F1040Attachment`.

    * Use data from `this.f1040.info.scheduleCs` (handle multiple Schedule Cs if necessary, defaulting to index 0 for basic implementation).

    * Implement `cogs()` helper to calculate Part III.

    * Implement `vehicleDeduction()` helper to calculate Part IV (Business Miles * Standard Rate).

3.  **PDF Mapping:** Fill the `fields` array to map your calculated methods to the PDF tags (`f1040sc`).

4.  **Integration:**

    * Open `src/forms/Y2024/irsForms/ScheduleSE.ts`.

    * Locate `l2` (Net profit or loss) and replace the TODO or existing logic with a call to `this.f1040.scheduleC.l31()`.

5.  **Verification:** Ensure `npm test` passes.