import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TierBadge } from './TierBadge';

describe('TierBadge', () => {
  it.each([1, 2, 3] as const)('renders Tier %i with accessible label', (tier) => {
    render(<TierBadge tier={tier} />);
    expect(screen.getByText(`Tier ${tier}`)).toBeInTheDocument();
  });
});
