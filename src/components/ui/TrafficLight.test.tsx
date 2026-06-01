import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TrafficLight } from './TrafficLight';

describe('TrafficLight', () => {
  it('renders with accessible role', () => {
    render(<TrafficLight light="Green" />);
    expect(screen.getByRole('img')).toBeInTheDocument();
  });

  it('includes descriptive aria-label for each light', () => {
    const { rerender } = render(<TrafficLight light="Green" />);
    expect(screen.getByLabelText(/Green/)).toBeInTheDocument();

    rerender(<TrafficLight light="Yellow" />);
    expect(screen.getByLabelText(/Yellow/)).toBeInTheDocument();

    rerender(<TrafficLight light="Red" />);
    expect(screen.getByLabelText(/Red/)).toBeInTheDocument();
  });

  it('shows label when showLabel=true', () => {
    render(<TrafficLight light="Green" showLabel />);
    expect(screen.getByText('Green')).toBeInTheDocument();
  });
});
