import { renderHook, waitFor } from '@testing-library/react';
import { useRejectionReasons } from '@/hooks/useRejectionReasons';
import { createWrapper, mockRejectionReasons, stubFetch } from '../utils';

describe('useRejectionReasons', () => {
  afterEach(() => vi.restoreAllMocks());

  it('returns the rejection reasons array from the API', async () => {
    stubFetch({ reasons: mockRejectionReasons });
    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useRejectionReasons(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.reasons).toEqual(mockRejectionReasons);
  });
});
