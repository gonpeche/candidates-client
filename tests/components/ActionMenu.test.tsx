import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ActionMenu } from '@/components/candidates/ActionMenu';
import { createWrapper, mockApprovedCandidate, mockRejectedCandidate, stubFetch } from '../utils';

describe('ActionMenu', () => {
  afterEach(() => vi.restoreAllMocks());

  it('shows "Approve Candidate" for a rejected candidate', async () => {
    stubFetch({});
    const user = userEvent.setup();
    const { wrapper } = createWrapper();
    render(<ActionMenu candidate={mockRejectedCandidate} />, { wrapper });

    await user.click(screen.getByRole('button', { name: /actions for jane smith/i }));

    expect(await screen.findByText('Approve Candidate')).toBeInTheDocument();
  });

  it('shows "Reject Candidate" for an approved candidate', async () => {
    stubFetch({});
    const user = userEvent.setup();
    const { wrapper } = createWrapper();
    render(<ActionMenu candidate={mockApprovedCandidate} />, { wrapper });

    await user.click(screen.getByRole('button', { name: /actions for john doe/i }));

    expect(await screen.findByText('Reject Candidate')).toBeInTheDocument();
  });
});
