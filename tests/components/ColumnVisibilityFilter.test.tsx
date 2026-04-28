import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ColumnVisibilityFilter } from '@/components/filters/ColumnVisibilityFilter';
import { createWrapper } from '../utils';
import type { ColumnVisibilityMap } from '@/types';

const mockColumns: ColumnVisibilityMap = {
  id: false,
  name: true,
  document: false,
  cv_zonajobs: true,
  cv_bumeran: false,
  phone: false,
  email: true,
  date: true,
  age: false,
  has_university: false,
  career: true,
  graduated: false,
  courses_approved: false,
  location: false,
  accepts_working_hours: false,
  desired_salary: true,
  had_interview: false,
  reason: true,
};

function setup() {
  const { wrapper, queryClient } = createWrapper();
  queryClient.setQueryData(['columns'], mockColumns);
  return { wrapper, queryClient };
}

describe('ColumnVisibilityFilter', () => {
  afterEach(() => vi.restoreAllMocks());

  it('renders the "Visible Columns" trigger button', () => {
    const { wrapper } = setup();
    render(<ColumnVisibilityFilter />, { wrapper });
    expect(screen.getByText('Visible Columns')).toBeInTheDocument();
  });

  it('shows all columns (excluding id, merging CV) when opened', async () => {
    const user = userEvent.setup();
    const { wrapper } = setup();
    render(<ColumnVisibilityFilter />, { wrapper });

    await user.click(screen.getByText('Visible Columns'));

    expect(await screen.findByText('Name')).toBeInTheDocument();
    expect(screen.getByText('CV')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.queryByText('Id')).not.toBeInTheDocument();
    expect(screen.queryByText('Cv Zonajobs')).not.toBeInTheDocument();
    expect(screen.queryByText('Cv Bumeran')).not.toBeInTheDocument();
  });

  it('sends PUT /columns with updated payload on Confirm', async () => {
    const mockFetch = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockColumns),
    } as unknown as Response);

    const user = userEvent.setup();
    const { wrapper } = setup();
    render(<ColumnVisibilityFilter />, { wrapper });

    await user.click(screen.getByText('Visible Columns'));
    await screen.findByText('Name');
    await user.click(screen.getByRole('button', { name: /confirm/i }));

    await waitFor(() =>
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/columns',
        expect.objectContaining({ method: 'PUT' })
      )
    );
  });

  it('switch reflects current column visibility via aria-checked', async () => {
    const user = userEvent.setup();
    const { wrapper } = setup();
    render(<ColumnVisibilityFilter />, { wrapper });

    await user.click(screen.getByText('Visible Columns'));
    await screen.findByText('Email');

    // Email is true in mockColumns
    expect(screen.getByRole('switch', { name: /toggle email column visibility/i }))
      .toHaveAttribute('aria-checked', 'true');
    // Phone is false in mockColumns
    expect(screen.getByRole('switch', { name: /toggle phone column visibility/i }))
      .toHaveAttribute('aria-checked', 'false');
  });

  it('toggling a switch flips its aria-checked state', async () => {
    const user = userEvent.setup();
    const { wrapper } = setup();
    render(<ColumnVisibilityFilter />, { wrapper });

    await user.click(screen.getByText('Visible Columns'));
    const emailSwitch = await screen.findByRole('switch', { name: /toggle email column visibility/i });

    expect(emailSwitch).toHaveAttribute('aria-checked', 'true');
    await user.click(emailSwitch);
    expect(screen.getByRole('switch', { name: /toggle email column visibility/i }))
      .toHaveAttribute('aria-checked', 'false');
  });

  it('discards draft when closed without confirming', async () => {
    const mockFetch = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockColumns),
    } as unknown as Response);

    const user = userEvent.setup();
    const { wrapper } = setup();
    render(<ColumnVisibilityFilter />, { wrapper });

    await user.click(screen.getByText('Visible Columns'));
    await screen.findByText('Email');
    await user.click(screen.getByRole('switch', { name: /toggle email column visibility/i }));

    // Close by pressing Escape
    await user.keyboard('{Escape}');

    expect(mockFetch).not.toHaveBeenCalledWith(
      'http://localhost:3001/columns',
      expect.anything()
    );
  });
});
