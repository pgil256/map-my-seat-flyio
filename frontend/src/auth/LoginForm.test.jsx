describe('LoginForm', () => {
    it('renders without crashing', () => {
      render(
        <MemoryRouter>
          <LoginForm login={mockLogin} />
        </MemoryRouter>
      );
    });
  
    it('can fill out the form and submit successfully', async () => {
      const { getByLabelText, getByText } = render(
        <MemoryRouter>
          <LoginForm login={mockLogin} />
        </MemoryRouter>
      );
  
      fireEvent.change(getByLabelText(/username/i), {
        target: { value: 'testuser' },
      });
      fireEvent.change(getByLabelText(/password/i), {
        target: { value: 'password123' },
      });
  

      fireEvent.click(getByText(/submit/i));
      await waitFor(() => expect(mockLogin).toHaveBeenCalledTimes(1));
    });
  
    it('displays error messages when form submission fails', async () => {
      const mockErrorLogin = jest.fn((formData) => {
        return {
          success: false,
          errors: ['Invalid credentials'],
        };
      });
  
      const { getByLabelText, getByText, queryByText } = render(
        <MemoryRouter>
          <LoginForm login={mockErrorLogin} />
        </MemoryRouter>
      );
  
      fireEvent.change(getByLabelText(/username/i), {
        target: { value: 'testuser' },
      });
      fireEvent.change(getByLabelText(/password/i), {
        target: { value: 'invalidpassword' },
      });

      fireEvent.click(getByText(/submit/i));
      await waitFor(() => expect(mockErrorLogin).toHaveBeenCalledTimes(1));
  

      expect(queryByText(/invalid credentials/i)).toBeInTheDocument();
    });
  });
  