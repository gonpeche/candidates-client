import { toLabel, toEntries } from '@/components/filters/utils/visibilityFilters';
import type { ColumnVisibilityMap } from '@/types';

const fullMap: ColumnVisibilityMap = {
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
  reason: false,
};

describe('toLabel', () => {
  it('converts snake_case to Title Case', () => {
    expect(toLabel('has_university')).toBe('Has University');
    expect(toLabel('desired_salary')).toBe('Desired Salary');
    expect(toLabel('accepts_working_hours')).toBe('Accepts Working Hours');
  });

  it('handles single-word keys', () => {
    expect(toLabel('name')).toBe('Name');
    expect(toLabel('email')).toBe('Email');
  });
});

describe('toEntries', () => {
  it('excludes the id column', () => {
    const entries = toEntries(fullMap);
    expect(entries.find((e) => e.key === 'id')).toBeUndefined();
  });

  it('merges cv_zonajobs and cv_bumeran into a single CV entry', () => {
    const entries = toEntries(fullMap);
    const cvKeys = entries.filter((e) => e.key === 'cv_zonajobs' || (e.key as string) === 'cv_bumeran');
    expect(cvKeys).toHaveLength(1);
    expect(cvKeys[0].label).toBe('CV');
  });

  it('uses cv_zonajobs visibility for the CV entry', () => {
    const withZonajobsTrue = { ...fullMap, cv_zonajobs: true, cv_bumeran: false };
    const withZonajobsFalse = { ...fullMap, cv_zonajobs: false, cv_bumeran: false };

    expect(toEntries(withZonajobsTrue).find((e) => e.label === 'CV')?.visible).toBe(true);
    expect(toEntries(withZonajobsFalse).find((e) => e.label === 'CV')?.visible).toBe(false);
  });

  it('preserves visibility for non-CV columns', () => {
    const entries = toEntries(fullMap);
    expect(entries.find((e) => e.key === 'name')?.visible).toBe(true);
    expect(entries.find((e) => e.key === 'phone')?.visible).toBe(false);
    expect(entries.find((e) => e.key === 'email')?.visible).toBe(true);
  });

  it('generates correct labels for non-CV columns', () => {
    const entries = toEntries(fullMap);
    expect(entries.find((e) => e.key === 'name')?.label).toBe('Name');
    expect(entries.find((e) => e.key === 'has_university')?.label).toBe('Has University');
  });
});
