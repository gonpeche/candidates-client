import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { CandidateWithStatus } from '@/types';

export function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }

  return { wrapper: Wrapper, queryClient };
}

const baseCandidate = {
  document: 12345678,
  cv_zonajobs: '',
  cv_bumeran: '',
  phone: '555-1234',
  date: ' 2024-01-01 00:00:00.000',
  age: 25,
  has_university: 'Si',
  career: 'Administración',
  graduated: 'Ya me recibí',
  courses_approved: '',
  location: 'Buenos Aires',
  accepts_working_hours: 'Si',
  desired_salary: '20000',
  had_interview: 'No',
};

export const mockApprovedCandidate: CandidateWithStatus = {
  ...baseCandidate,
  id: '1',
  name: 'John Doe',
  email: 'john@example.com',
  reason: '',
  status: 'approved',
};

export const mockRejectedCandidate: CandidateWithStatus = {
  ...baseCandidate,
  id: '2',
  name: 'Jane Smith',
  email: 'jane@example.com',
  reason: 'Edad fuera de rango, Salario pretendido fuera de rango',
  status: 'rejected',
};

export const mockRejectionReasons = ['Edad fuera de rango', 'Salario pretendido fuera de rango'];

export function stubFetch(data: unknown) {
  vi.spyOn(globalThis, 'fetch').mockResolvedValue({
    ok: true,
    json: () => Promise.resolve(data),
  } as unknown as Response);
}

export function stubFetchError() {
  vi.spyOn(globalThis, 'fetch').mockResolvedValue({
    ok: false,
    status: 500,
  } as unknown as Response);
}
