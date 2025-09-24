import React from 'react';
import { render } from '@testing-library/react';
import LoadingSpinner from './LoadingSpinner';

describe('LoadingSpinner', () => {
  it('renders without crashing', () => {
    render(<LoadingSpinner />);
  });

  it('has the correct class name', () => {
    const { getByText } = render(<LoadingSpinner />);
    expect(getByText(/Loading/)).toHaveClass('LoadingSpinner');
  });
});
