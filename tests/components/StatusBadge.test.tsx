import { render, screen } from '@testing-library/react';
import { TooltipProvider } from '@/components/ui/tooltip';
import { StatusBadge } from '@/components/candidates/StatusBadge';
import { mockApprovedCandidate, mockRejectedCandidate } from '../utils';

function renderWithTooltip(ui: React.ReactElement) {
  return render(<TooltipProvider>{ui}</TooltipProvider>);
}

describe('StatusBadge', () => {
  it('renders "Approved" for an approved candidate', () => {
    renderWithTooltip(<StatusBadge candidate={mockApprovedCandidate} />);
    expect(screen.getByText('Approved')).toBeInTheDocument();
  });

  it('renders "Rejected" for a rejected candidate', () => {
    renderWithTooltip(<StatusBadge candidate={mockRejectedCandidate} />);
    expect(screen.getByText('Rejected')).toBeInTheDocument();
  });

  it('renders a sr-only span with rejection reasons for rejected candidates', () => {
    renderWithTooltip(<StatusBadge candidate={mockRejectedCandidate} />);
    const srOnly = screen.getByText(/Rejection reasons:/i);
    expect(srOnly).toBeInTheDocument();
    expect(srOnly.className).toContain('sr-only');
    expect(srOnly.textContent).toContain('Edad fuera de rango');
    expect(srOnly.textContent).toContain('Salario pretendido fuera de rango');
  });

  it('links the rejected badge trigger to the sr-only span via aria-describedby', () => {
    renderWithTooltip(<StatusBadge candidate={mockRejectedCandidate} />);
    const srOnly = screen.getByText(/Rejection reasons:/i);
    const srOnlyId = srOnly.id;
    const trigger = screen.getByRole('button');
    expect(trigger).toHaveAttribute('aria-describedby', srOnlyId);
  });

  it('does not render a sr-only span for approved candidates', () => {
    renderWithTooltip(<StatusBadge candidate={mockApprovedCandidate} />);
    expect(screen.queryByText(/Rejection reasons:/i)).not.toBeInTheDocument();
  });
});
