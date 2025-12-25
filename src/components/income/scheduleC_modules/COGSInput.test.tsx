import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { COGSInput } from './COGSInput';
import { CostOfGoods } from 'ustaxes/core/data';

describe('COGSInput', () => {
  const mockOnChange = jest.fn();
  const defaultData: CostOfGoods = {};

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('renders all fields', () => {
    render(<COGSInput data={defaultData} onChange={mockOnChange} />);

    expect(screen.getByText('Cost of Goods Sold (Part III)')).toBeInTheDocument();
    expect(screen.getByText('Method used to value closing inventory:')).toBeInTheDocument();
    expect(screen.getByLabelText('Inventory at beginning of year')).toBeInTheDocument();
    expect(screen.getByLabelText('Purchases less cost of items withdrawn for personal use')).toBeInTheDocument();
    expect(screen.getByLabelText('Cost of labor')).toBeInTheDocument();
    expect(screen.getByLabelText('Materials and supplies')).toBeInTheDocument();
    expect(screen.getByLabelText('Other costs')).toBeInTheDocument();
    expect(screen.getByLabelText('Inventory at end of year')).toBeInTheDocument();
  });

  it('calls onChange when valuation method is selected', () => {
    render(<COGSInput data={defaultData} onChange={mockOnChange} />);

    fireEvent.click(screen.getByLabelText('Cost'));
    expect(mockOnChange).toHaveBeenCalledWith({ method: 'cost' });

    fireEvent.click(screen.getByLabelText('Other'));
    expect(mockOnChange).toHaveBeenCalledWith({ method: 'other' });
  });

  it('calls onChange with correct numeric values for inventory fields', () => {
    render(<COGSInput data={defaultData} onChange={mockOnChange} />);

    const input = screen.getByLabelText('Inventory at beginning of year');
    fireEvent.change(input, { target: { value: '1,234.56' } });

    // NumberFormat uses floatValue, so we expect the number
    expect(mockOnChange).toHaveBeenCalledWith({ openingInventory: 1234.56 });
  });

  it('renders existing data correctly', () => {
    const data: CostOfGoods = {
      method: 'lowerOfCostOrMarket',
      openingInventory: 5000,
      purchases: 2000,
    };
    render(<COGSInput data={data} onChange={mockOnChange} />);

    expect(screen.getByLabelText('Lower of cost or market')).toBeChecked();
    // The value in the input does not include the $ prefix because it is an adornment
    expect(screen.getByLabelText('Inventory at beginning of year')).toHaveValue('5,000');
    expect(screen.getByLabelText('Purchases less cost of items withdrawn for personal use')).toHaveValue('2,000');
  });
});
