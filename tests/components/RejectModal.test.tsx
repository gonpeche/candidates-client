import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RejectModal } from '@/components/candidates/RejectModal';
import { createWrapper, mockRejectionReasons, stubFetch } from '../utils';

function setupFetch(fetchFn = vi.fn()) {
  vi.spyOn(globalThis, 'fetch').mockImplementation(fetchFn);
  return fetchFn;
}

describe('RejectModal', () => {
  afterEach(() => vi.restoreAllMocks());

  it('renders all rejection reasons as checkboxes', async () => {
    setupFetch(
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ reasons: mockRejectionReasons }),
      })
    );
    const { wrapper } = createWrapper();
    render(
      <RejectModal
        candidateId="2"
        candidateName="Jane Smith"
        open={true}
        onOpenChange={vi.fn()}
      />,
      { wrapper }
    );

    for (const reason of mockRejectionReasons) {
      expect(await screen.findByText(reason)).toBeInTheDocument();
    }
  });

  it('disables Confirm when no reasons are selected', async () => {
    setupFetch(
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ reasons: mockRejectionReasons }),
      })
    );
    const { wrapper } = createWrapper();
    render(
      <RejectModal
        candidateId="2"
        candidateName="Jane Smith"
        open={true}
        onOpenChange={vi.fn()}
      />,
      { wrapper }
    );

    await screen.findByText(mockRejectionReasons[0]);
    expect(screen.getByRole('button', { name: /confirm/i })).toBeDisabled();
  });

  it('enables Confirm after selecting at least one reason', async () => {
    setupFetch(
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ reasons: mockRejectionReasons }),
      })
    );
    const user = userEvent.setup();
    const { wrapper } = createWrapper();
    render(
      <RejectModal
        candidateId="2"
        candidateName="Jane Smith"
        open={true}
        onOpenChange={vi.fn()}
      />,
      { wrapper }
    );

    await user.click(await screen.findByLabelText(mockRejectionReasons[0]));
    expect(screen.getByRole('button', { name: /confirm/i })).toBeEnabled();
  });

  it('calls PATCH /candidates/:id with selected reasons on Confirm', async () => {
    const mockFetchFn = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ reasons: mockRejectionReasons }),
    });
    setupFetch(mockFetchFn);

    const user = userEvent.setup();
    const { wrapper } = createWrapper();
    render(
      <RejectModal
        candidateId="2"
        candidateName="Jane Smith"
        open={true}
        onOpenChange={vi.fn()}
      />,
      { wrapper }
    );

    await user.click(await screen.findByLabelText(mockRejectionReasons[0]));
    await user.click(screen.getByRole('button', { name: /confirm/i }));

    await waitFor(() =>
      expect(mockFetchFn).toHaveBeenCalledWith(
        'http://localhost:3001/candidates/2',
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({ reasons: [mockRejectionReasons[0]] }),
        })
      )
    );
  });

  describe('custom reason', () => {
    it('shows the "+ Add custom reason" trigger', async () => {
      setupFetch(
        vi.fn().mockResolvedValue({
          ok: true,
          json: () => Promise.resolve({ reasons: mockRejectionReasons }),
        })
      );
      const { wrapper } = createWrapper();
      render(
        <RejectModal candidateId="2" candidateName="Jane Smith" open={true} onOpenChange={vi.fn()} />,
        { wrapper }
      );

      await screen.findByText(mockRejectionReasons[0]);
      expect(screen.getByRole('button', { name: /add custom reason/i })).toBeInTheDocument();
    });

    it('reveals input when trigger is clicked', async () => {
      setupFetch(
        vi.fn().mockResolvedValue({
          ok: true,
          json: () => Promise.resolve({ reasons: mockRejectionReasons }),
        })
      );
      const user = userEvent.setup();
      const { wrapper } = createWrapper();
      render(
        <RejectModal candidateId="2" candidateName="Jane Smith" open={true} onOpenChange={vi.fn()} />,
        { wrapper }
      );

      await user.click(await screen.findByRole('button', { name: /add custom reason/i }));
      expect(screen.getByPlaceholderText(/type a reason/i)).toBeInTheDocument();
    });

    it('disables Add when input is empty or duplicates an existing reason', async () => {
      setupFetch(
        vi.fn().mockResolvedValue({
          ok: true,
          json: () => Promise.resolve({ reasons: mockRejectionReasons }),
        })
      );
      const user = userEvent.setup();
      const { wrapper } = createWrapper();
      render(
        <RejectModal candidateId="2" candidateName="Jane Smith" open={true} onOpenChange={vi.fn()} />,
        { wrapper }
      );

      await user.click(await screen.findByRole('button', { name: /add custom reason/i }));
      expect(screen.getByRole('button', { name: /^add$/i })).toBeDisabled();

      await user.type(screen.getByPlaceholderText(/type a reason/i), mockRejectionReasons[0]);
      expect(screen.getByRole('button', { name: /^add$/i })).toBeDisabled();
    });

    it('appends the custom reason pre-checked and hides the trigger', async () => {
      setupFetch(
        vi.fn().mockResolvedValue({
          ok: true,
          json: () => Promise.resolve({ reasons: mockRejectionReasons }),
        })
      );
      const user = userEvent.setup();
      const { wrapper } = createWrapper();
      render(
        <RejectModal candidateId="2" candidateName="Jane Smith" open={true} onOpenChange={vi.fn()} />,
        { wrapper }
      );

      await user.click(await screen.findByRole('button', { name: /add custom reason/i }));
      await user.type(screen.getByPlaceholderText(/type a reason/i), 'My custom reason');
      await user.click(screen.getByRole('button', { name: /^add$/i }));

      expect(screen.getByText('My custom reason')).toBeInTheDocument();
      expect(screen.getByRole('checkbox', { name: 'My custom reason' })).toBeChecked();
      expect(screen.queryByRole('button', { name: /add custom reason/i })).not.toBeInTheDocument();
    });

    it('removes the custom reason and re-shows the trigger on ✕ click', async () => {
      setupFetch(
        vi.fn().mockResolvedValue({
          ok: true,
          json: () => Promise.resolve({ reasons: mockRejectionReasons }),
        })
      );
      const user = userEvent.setup();
      const { wrapper } = createWrapper();
      render(
        <RejectModal candidateId="2" candidateName="Jane Smith" open={true} onOpenChange={vi.fn()} />,
        { wrapper }
      );

      await user.click(await screen.findByRole('button', { name: /add custom reason/i }));
      await user.type(screen.getByPlaceholderText(/type a reason/i), 'My custom reason');
      await user.click(screen.getByRole('button', { name: /^add$/i }));
      await user.click(screen.getByRole('button', { name: /remove custom reason/i }));

      expect(screen.queryByText('My custom reason')).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: /add custom reason/i })).toBeInTheDocument();
    });

    it('includes newReason in the PATCH payload', async () => {
      const mockFetchFn = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ reasons: mockRejectionReasons }),
      });
      setupFetch(mockFetchFn);

      const user = userEvent.setup();
      const { wrapper } = createWrapper();
      render(
        <RejectModal candidateId="2" candidateName="Jane Smith" open={true} onOpenChange={vi.fn()} />,
        { wrapper }
      );

      await user.click(await screen.findByRole('button', { name: /add custom reason/i }));
      await user.type(screen.getByPlaceholderText(/type a reason/i), 'My custom reason');
      await user.click(screen.getByRole('button', { name: /^add$/i }));
      await user.click(screen.getByRole('button', { name: /confirm/i }));

      await waitFor(() =>
        expect(mockFetchFn).toHaveBeenCalledWith(
          'http://localhost:3001/candidates/2',
          expect.objectContaining({
            method: 'PATCH',
            body: JSON.stringify({
              reasons: ['My custom reason'],
              newReason: 'My custom reason',
            }),
          })
        )
      );
    });
  });
});
