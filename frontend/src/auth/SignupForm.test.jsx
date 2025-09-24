import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { render, fireEvent, waitFor } from '@testing-library/react';
import SignupForm from './SignupForm';

// Mock signup function with sample data
const mockSignup = jest.fn((formData) => {
  return {
    success: true,
    errors: [],
  };
});

describe('SignupForm', () => {
  it('renders without crashing', () => {
    render(
      <MemoryRouter>
        <SignupForm signup={mockSignup} />
      </MemoryRouter>
    );
  });

  it('can fill out the form and submit successfully', async () => {
    const { getByLabelText, getByText } = render(
      <MemoryRouter>
        <SignupForm signup={mockSignup} />
      </MemoryRouter>
    );

    fireEvent.change(getByLabelText(/username/i), {
      target: { value: 'testuser' },
    });
    fireEvent.change(getByLabelText(/password/i), {
      target: { value: 'password123' },
    });
    fireEvent.click(getByLabelText(/mr./i));
    fireEvent.change(getByLabelText(/first name/i), {
      target: { value: 'John' },
    });
    fireEvent.change(getByLabelText(/last name/i), {
      target: { value: 'Doe' },
    });
    fireEvent.change(getByLabelText(/email/i), {
      target: { value: 'johndoe@example.com' },
    });

    fireEvent.click(getByText(/submit/i));
    await waitFor(() => expect(mockSignup).toHaveBeenCalledTimes(1));
  });

  it('displays an error message when the username contains a period', () => {
    const { getByLabelText, getByText } = render(
      <MemoryRouter>
        <SignupForm signup={mockSignup} />
      </MemoryRouter>
    );

    fireEvent.change(getByLabelText(/username/i), {
      target: { value: 'test.user' },
    });

    fireEvent.click(getByText(/submit/i));

    expect(getByText(/periods may not be included in username/i)).toBeInTheDocument();
  });
});
