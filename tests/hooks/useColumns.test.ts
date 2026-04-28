import { renderHook, waitFor } from '@testing-library/react';
import { useColumns } from '@/hooks/useColumns';
import { createWrapper, stubFetch } from '../utils';

const mockColumns = { id: true, name: true, email: true, cv_bumeran: false };

describe('useColumns', () => {
  afterEach(() => vi.restoreAllMocks());

  it('returns the column visibility map as-is from the API', async () => {
    stubFetch(mockColumns);
    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useColumns(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockColumns);
  });
});
