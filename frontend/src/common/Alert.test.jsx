import React from 'react';
import { render } from '@testing-library/react';
import Alert from './Alert';

describe('Alert', () => {
  it('renders without crashing', () => {
    render(<Alert />);
  });

  it('displays one error message correctly', () => {
    const errorMessage = 'This is an error message';
    const { getByText } = render(<Alert messages={[errorMessage]} />);
    expect(getByText(errorMessage)).toBeInTheDocument();
  });

  it('displays multiple error messages correctly', () => {
    const errorMessages = ['Error 1', 'Error 2', 'Error 3'];
    const { getByText } = render(<Alert messages={errorMessages} />);
    errorMessages.forEach((message) => {
      expect(getByText(message)).toBeInTheDocument();
    });
  });
});
