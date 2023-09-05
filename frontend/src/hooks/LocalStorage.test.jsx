import React from 'react';
import { render } from '@testing-library/react';
import UserContext from '../auth/UserContext';
import Home from './Home';

describe('Home', () => {
  const currentUser = {
    firstName: 'John',
    lastName: 'Doe',
    username: 'johndoe'
  };

  it('renders without crashing', () => {
    render(
      <UserContext.Provider value={{ currentUser }}>
        <Home />
      </UserContext.Provider>
    );
  });

  it('displays a welcome message with the user name if currentUser is present', () => {
    const { getByText } = render(
      <UserContext.Provider value={{ currentUser }}>
        <Home />
      </UserContext.Provider>
    );

    expect(getByText(/Welcome, John!/i)).toBeInTheDocument();
  });

  it('displays a welcome message with instructions if no currentUser is present', () => {
    const { getByText } = render(<Home />);

    expect(getByText(/Welcome to Map My Seat/i)).toBeInTheDocument();
    expect(getByText(/To get started:/i)).toBeInTheDocument();
    expect(getByText(/Set Up Classes/i)).toBeInTheDocument();
    expect(getByText(/Create Classroom/i)).toBeInTheDocument();
  });
});
