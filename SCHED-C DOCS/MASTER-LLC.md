# MASTER-LLC Integration Docs (Inferred)

## Overview
This document outlines the dependencies between Schedule C (Profit or Loss From Business) and other IRS forms for a Single-Member LLC (disregarded entity).

## Data Flow Connections

### 1. Schedule C to Schedule 1 (Additional Income and Adjustments to Income)
*   **Source:** Schedule C, Line 31 (Net Profit or Loss).
*   **Destination:** Schedule 1, Part I, Line 3 (Business income or (loss)).
*   **Logic:** `Schedule1.l3` must sum the Net Profit from all Schedule C instances.

### 2. Schedule C to Schedule SE (Self-Employment Tax)
*   **Source:** Schedule C, Line 31 (Net Profit or Loss).
*   **Destination:** Schedule SE, Part I, Line 2 (Net profit or (loss) from Schedule C).
*   **Logic:**
    *   If Net Profit > $400, Schedule SE is required.
    *   Sum of all Schedule C profits goes to Schedule SE.
    *   *Note:* There are Short and Long Schedule SE forms. The codebase likely implements one or handles the logic.

### 3. Schedule SE to Schedule 1 (Adjustments to Income)
*   **Source:** Schedule SE, Line 13 (Deduction for one-half of self-employment tax).
*   **Destination:** Schedule 1, Part II, Line 15 (Deductible part of self-employment tax).

### 4. Schedule SE to Schedule 2 (Additional Taxes)
*   **Source:** Schedule SE, Line 12 (Self-employment tax).
*   **Destination:** Schedule 2, Part II, Line 4 (Self-employment tax).

### 5. Schedule C to Form 8995 (Qualified Business Income Deduction)
*   **Source:** Schedule C, Line 31 (Net Profit or Loss) adjusted for SE Tax deduction, etc.
*   **Destination:** Form 8995 (or 8995-A).
*   **Logic:** QBI calculation involves complex netting of incomes and losses.

## State Tax Integration (Missouri - MO-1040) - **FUTURE**
*   Federal Adjusted Gross Income (AGI) flows to MO-1040 Line 1.
*   Business income from Federal Schedule C is included in Federal AGI.
*   *Requirement:* Ensure Federal AGI is correctly calculated with Schedule C data so state forms can pull it downstream.
