import { renderHook, waitFor } from '@testing-library/react';
import { useCandidates } from '@/hooks/useCandidates';
import { createWrapper, stubFetch, stubFetchError } from '../utils';

const rawCandidates = [
  { id: '1', name: 'John Doe', email: 'john@example.com', reason: '' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', reason: 'Edad fuera de rango' },
];

describe('useCandidates', () => {
  afterEach(() => vi.restoreAllMocks());

  it('fetches candidates from the API', async () => {
    stubFetch(rawCandidates);
    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useCandidates(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(2);
  });

  it('derives status "approved" when reason is empty', async () => {
    stubFetch(rawCandidates);
    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useCandidates(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data![0].status).toBe('approved');
  });

  it('derives status "rejected" when reason is non-empty', async () => {
    stubFetch(rawCandidates);
    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useCandidates(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data![1].status).toBe('rejected');
  });

  it('returns isError when the API call fails', async () => {
    stubFetchError();
    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useCandidates(), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
