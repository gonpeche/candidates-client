import { act, renderHook, waitFor } from '@testing-library/react';
import { useUpdateColumns } from '@/hooks/useUpdateColumns';
import { createWrapper, stubFetch } from '../utils';

const mockColumns = { id: false, name: true, email: true };

describe('useUpdateColumns', () => {
  afterEach(() => vi.restoreAllMocks());

  it('calls PUT /columns with the payload', async () => {
    const mockFetch = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockColumns),
    } as unknown as Response);

    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useUpdateColumns(), { wrapper });

    act(() => result.current.mutate(mockColumns as never));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:3001/columns',
      expect.objectContaining({
        method: 'PUT',
        body: JSON.stringify(mockColumns),
      })
    );
  });

  it('invalidates the columns query on success', async () => {
    stubFetch(mockColumns);
    const { wrapper, queryClient } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useUpdateColumns(), { wrapper });

    act(() => result.current.mutate(mockColumns as never));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['columns'] });
  });
});
