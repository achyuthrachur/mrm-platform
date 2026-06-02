import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { VerdictChip } from './VerdictChip';

describe('VerdictChip', () => {
  it.each(['pass', 'warn', 'fail'] as const)('renders %s verdict with icon + text', (verdict) => {
    render(<VerdictChip verdict={verdict} />);
    const chip = screen.getByRole('status');
    expect(chip).toBeInTheDocument();
    expect(chip.textContent?.trim()).not.toBe('');
  });

  it('has accessible aria-label', () => {
    render(<VerdictChip verdict="fail" />);
    expect(screen.getByRole('status', { name: 'Verdict: Fail' })).toBeInTheDocument();
  });
});
