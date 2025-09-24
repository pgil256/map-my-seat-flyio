import React from 'react';
import { render } from '@testing-library/react';
import MakeAlert from './MakeAlert';

describe('MakeAlert', () => {
  it('renders without crashing', () => {
    render(<MakeAlert />);
  });

  it('displays one error message correctly', () => {
    const errorMessage = 'This is an error message';
    const { getByText } = render(<MakeAlert messages={[errorMessage]} />);
    expect(getByText(errorMessage)).toBeInTheDocument();
  });

  it('displays multiple error messages correctly', () => {
    const errorMessages = ['Error 1', 'Error 2', 'Error 3'];
    const { getByText } = render(<MakeAlert messages={errorMessages} />);
    errorMessages.forEach((message) => {
      expect(getByText(message)).toBeInTheDocument();
    });
  });
});
