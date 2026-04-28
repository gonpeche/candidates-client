import type { ColumnVisibilityMap } from '@/types';

export const CV_KEYS: (keyof ColumnVisibilityMap)[] = ['cv_zonajobs', 'cv_bumeran'];

export type ColumnEntry = { key: keyof ColumnVisibilityMap; label: string; visible: boolean };

export function toLabel(key: string): string {
  return key
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function toEntries(draft: ColumnVisibilityMap): ColumnEntry[] {
  const entries: ColumnEntry[] = [];
  let cvSeen = false;

  for (const [key, visible] of Object.entries(draft) as [keyof ColumnVisibilityMap, boolean][]) {
    if (key === 'id') continue;
    if (CV_KEYS.includes(key)) {
      if (!cvSeen) {
        entries.push({ key: 'cv_zonajobs', label: 'CV', visible: draft.cv_zonajobs });
        cvSeen = true;
      }
      continue;
    }
    entries.push({ key, label: toLabel(key), visible });
  }

  return entries;
}
