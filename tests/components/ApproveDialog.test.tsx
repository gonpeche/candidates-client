import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ApproveDialog } from '@/components/candidates/ApproveDialog';
import { createWrapper, stubFetch } from '../utils';

describe('ApproveDialog', () => {
  afterEach(() => vi.restoreAllMocks());

  it('renders the candidate name in the description', () => {
    stubFetch({});
    const { wrapper } = createWrapper();
    render(
      <ApproveDialog
        candidateId="1"
        candidateName="John Doe"
        open={true}
        onOpenChange={vi.fn()}
      />,
      { wrapper }
    );

    expect(screen.getByText(/John Doe/)).toBeInTheDocument();
  });

  it('calls PATCH /candidates/:id with reasons: [] on Confirm', async () => {
    const mockFetchFn = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: '1', reason: '' }),
    } as unknown as Response);

    const user = userEvent.setup();
    const { wrapper } = createWrapper();
    render(
      <ApproveDialog
        candidateId="1"
        candidateName="John Doe"
        open={true}
        onOpenChange={vi.fn()}
      />,
      { wrapper }
    );

    await user.click(screen.getByRole('button', { name: /confirm/i }));

    expect(mockFetchFn).toHaveBeenCalledWith(
      'http://localhost:3001/candidates/1',
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({ reasons: [] }),
      })
    );
  });

  it('disables Cancel and Confirm while the mutation is pending', async () => {
    // Mutation stays in-flight — never resolves
    vi.spyOn(globalThis, 'fetch').mockReturnValue(new Promise(() => {}));

    const user = userEvent.setup();
    const { wrapper } = createWrapper();
    render(
      <ApproveDialog
        candidateId="1"
        candidateName="John Doe"
        open={true}
        onOpenChange={vi.fn()}
      />,
      { wrapper }
    );

    await user.click(screen.getByRole('button', { name: /confirm/i }));

    expect(screen.getByRole('button', { name: /confirm/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeDisabled();
  });
});
