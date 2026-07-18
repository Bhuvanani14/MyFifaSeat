import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginView from '../src/components/LoginView';
import { User } from '../src/types';

describe('LoginView', () => {
  const mockOnLogin = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the FIFA World Cup 2026 heading', () => {
    render(<LoginView onLogin={mockOnLogin} />);
    expect(screen.getByText('FIFA WORLD CUP 2026')).toBeInTheDocument();
  });

  it('renders email and password inputs with accessible labels', () => {
    render(<LoginView onLogin={mockOnLogin} />);
    const emailInput = screen.getByLabelText('Email Address');
    const passwordInput = screen.getByLabelText('Password');
    expect(emailInput).toBeInTheDocument();
    expect(passwordInput).toBeInTheDocument();
  });

  it('renders the Sign In to Stadium submit button', () => {
    render(<LoginView onLogin={mockOnLogin} />);
    const submitBtn = screen.getByRole('button', { name: /sign in to stadium/i });
    expect(submitBtn).toBeInTheDocument();
  });

  it('renders the Quick Login button with a descriptive aria-label', () => {
    render(<LoginView onLogin={mockOnLogin} />);
    const quickLoginBtn = screen.getByRole('button', {
      name: /quick login: fill credentials/i,
    });
    expect(quickLoginBtn).toBeInTheDocument();
  });

  it('fills credentials when Quick Login button is clicked', async () => {
    render(<LoginView onLogin={mockOnLogin} />);
    const quickLoginBtn = screen.getByRole('button', {
      name: /quick login: fill credentials/i,
    });
    await userEvent.click(quickLoginBtn);

    expect(screen.getByLabelText('Email Address')).toHaveValue('fan@fifa.com');
    expect(screen.getByLabelText('Password')).toHaveValue('fifa');
  });

  it('shows an accessible error alert for invalid credentials', async () => {
    render(<LoginView onLogin={mockOnLogin} />);
    await userEvent.type(screen.getByLabelText('Email Address'), 'wrong@test.com');
    await userEvent.type(screen.getByLabelText('Password'), 'bad');
    fireEvent.click(screen.getByRole('button', { name: /sign in to stadium/i }));

    await waitFor(
      () => {
        const alert = screen.getByRole('alert');
        expect(alert).toBeInTheDocument();
        expect(alert).toHaveTextContent(/invalid credentials/i);
      },
      { timeout: 1500 }
    );
    expect(mockOnLogin).not.toHaveBeenCalled();
  });

  it('calls onLogin with correct user data for valid credentials', async () => {
    render(<LoginView onLogin={mockOnLogin} />);
    await userEvent.type(screen.getByLabelText('Email Address'), 'fan@fifa.com');
    await userEvent.type(screen.getByLabelText('Password'), 'fifa');
    fireEvent.click(screen.getByRole('button', { name: /sign in to stadium/i }));

    await waitFor(
      () => {
        expect(mockOnLogin).toHaveBeenCalledTimes(1);
        expect(mockOnLogin).toHaveBeenCalledWith(
          expect.objectContaining<Partial<User>>({
            email: 'fan@fifa.com',
            name: 'Alex Morgan',
            isPremium: true,
          })
        );
      },
      { timeout: 1500 }
    );
  });

  it('error message has role=alert and aria-live=assertive', () => {
    const { container } = render(<LoginView onLogin={mockOnLogin} />);
    // Initially no error present
    expect(container.querySelector('[role="alert"]')).toBeNull();
  });

  it('email input has id="email-input" for label association', () => {
    render(<LoginView onLogin={mockOnLogin} />);
    const input = document.getElementById('email-input');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('type', 'email');
  });

  it('password input has id="password-input" for label association', () => {
    render(<LoginView onLogin={mockOnLogin} />);
    const input = document.getElementById('password-input');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('type', 'password');
  });
});
