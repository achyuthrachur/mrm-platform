import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusBadge } from './StatusBadge';

describe('StatusBadge', () => {
  it('renders pass with icon and label', () => {
    render(<StatusBadge status="pass" />);
    expect(screen.getByRole('status', { name: 'Pass' })).toBeInTheDocument();
  });

  it('renders warn with icon and label', () => {
    render(<StatusBadge status="warn" />);
    expect(screen.getByRole('status', { name: 'Warn' })).toBeInTheDocument();
  });

  it('renders fail with icon and label', () => {
    render(<StatusBadge status="fail" />);
    expect(screen.getByRole('status', { name: 'Fail' })).toBeInTheDocument();
  });

  it('renders custom label', () => {
    render(<StatusBadge status="pass" label="Model OK" />);
    expect(screen.getByRole('status', { name: 'Model OK' })).toBeInTheDocument();
  });

  it('never uses color alone — always includes text', () => {
    render(<StatusBadge status="fail" />);
    const badge = screen.getByRole('status');
    expect(badge.textContent).not.toBe('');
  });
});
