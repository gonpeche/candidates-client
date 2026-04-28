import { act, renderHook, waitFor } from '@testing-library/react';
import { useReclassifyCandidate } from '@/hooks/useReclassifyCandidate';
import { createWrapper, stubFetch } from '../utils';

const updatedCandidate = { id: '1', reason: '' };

describe('useReclassifyCandidate', () => {
  afterEach(() => vi.restoreAllMocks());

  it('calls PATCH /candidates/:id with the correct body', async () => {
    const mockFetchFn = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(updatedCandidate),
    } as unknown as Response);

    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useReclassifyCandidate(), { wrapper });

    act(() => result.current.mutate({ id: '1', payload: { reasons: ['Edad fuera de rango'] } }));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockFetchFn).toHaveBeenCalledWith(
      'http://localhost:3001/candidates/1',
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({ reasons: ['Edad fuera de rango'] }),
      })
    );
  });

  it('invalidates the candidates query on success', async () => {
    stubFetch(updatedCandidate);
    const { wrapper, queryClient } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useReclassifyCandidate(), { wrapper });

    act(() => result.current.mutate({ id: '1', payload: { reasons: [] } }));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['candidates'] });
  });

  it('invalidates rejection-reasons when newReason is present', async () => {
    stubFetch(updatedCandidate);
    const { wrapper, queryClient } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useReclassifyCandidate(), { wrapper });

    act(() =>
      result.current.mutate({ id: '1', payload: { reasons: ['Custom'], newReason: 'Custom' } })
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['rejection-reasons'] });
  });

  it('does not invalidate rejection-reasons when newReason is absent', async () => {
    stubFetch(updatedCandidate);
    const { wrapper, queryClient } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useReclassifyCandidate(), { wrapper });

    act(() => result.current.mutate({ id: '1', payload: { reasons: ['Edad fuera de rango'] } }));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(invalidateSpy).not.toHaveBeenCalledWith({ queryKey: ['rejection-reasons'] });
  });
});
