import { Fragment } from 'react';
import { createColumnHelper } from '@tanstack/react-table';
import { ExternalLink } from 'lucide-react';
import type { CandidateWithStatus } from '@/types';
import { ActionMenu } from '@/components/candidates/ActionMenu';
import { StatusBadge } from '@/components/candidates/StatusBadge';

const col = createColumnHelper<CandidateWithStatus>();

const CV_SOURCES: { key: keyof CandidateWithStatus; label: string }[] = [
  { key: 'cv_zonajobs', label: 'Zonajobs' },
  { key: 'cv_bumeran', label: 'Bumeran' },
];

const textCell = (value: string | number) =>
  value !== '' && value !== null && value !== undefined ? (
    <span>{String(value)}</span>
  ) : (
    <span className="text-muted-foreground">—</span>
  );

const truncatedCell = (value: string, maxWidth = 'max-w-[16rem]') =>
  value ? (
    <span className={`block ${maxWidth} truncate`} title={value}>
      {value}
    </span>
  ) : (
    <span className="text-muted-foreground">—</span>
  );

const numericCell = (value: number | string) => <span className="tabular-nums">{value}</span>;

export const candidateColumns = [
  col.accessor('id', {
    header: 'ID',
    cell: (i) => truncatedCell(i.getValue(), 'max-w-[8rem]'),
  }),
  col.accessor('name', {
    header: 'Name',
    cell: (i) => <span className="font-medium text-foreground">{i.getValue()}</span>,
  }),
  col.accessor('document', {
    header: () => <span className="flex justify-center">Document</span>,
    cell: (i) => <span className="block w-full text-center tabular-nums">{i.getValue()}</span>,
  }),
  col.display({
    id: 'cv',
    size: 80,
    header: () => <span className="flex justify-center">CV</span>,
    cell: ({ row }) => {
      const links = CV_SOURCES.filter((s) => row.original[s.key]);
      if (links.length === 0) return <span className="text-muted-foreground">—</span>;
      return (
        <div className="flex items-center justify-center gap-2">
          {links.map(({ key, label }, index) => (
            <Fragment key={key}>
              {index > 0 && <span className="text-muted-foreground select-none">|</span>}
              <a
                href={row.original[key] as string}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                title={label}
                className="text-primary hover:text-primary/80"
              >
                <ExternalLink className="h-3 w-3" />
              </a>
            </Fragment>
          ))}
        </div>
      );
    },
  }),
  col.accessor('phone', {
    header: 'Phone',
    cell: (i) => textCell(i.getValue()),
  }),
  col.accessor('email', {
    header: 'Email',
    cell: (i) => truncatedCell(i.getValue(), 'max-w-[14rem]'),
  }),
  col.accessor('date', {
    header: 'Date',
    cell: (i) => (
      <span className="tabular-nums text-muted-foreground whitespace-nowrap">
        {i.getValue().trim().slice(0, 10)}
      </span>
    ),
  }),
  col.accessor('age', {
    header: 'Age',
    cell: (i) => numericCell(i.getValue()),
  }),
  col.accessor('has_university', {
    header: 'University',
    cell: (i) => textCell(i.getValue()),
  }),
  col.accessor('career', {
    header: 'Career',
    cell: (i) => truncatedCell(i.getValue(), 'max-w-[14rem]'),
  }),
  col.accessor('graduated', {
    header: 'Graduated',
    cell: (i) => textCell(i.getValue()),
  }),
  col.accessor('courses_approved', {
    header: 'Courses Approved',
    cell: (i) => textCell(i.getValue()),
  }),
  col.accessor('location', {
    header: 'Location',
    cell: (i) => truncatedCell(i.getValue(), 'max-w-[16rem]'),
  }),
  col.accessor('accepts_working_hours', {
    header: 'Accepts Hours',
    cell: (i) => textCell(i.getValue()),
  }),
  col.accessor('desired_salary', {
    header: () => <span className="flex justify-center">Desired Salary</span>,
    cell: (i) => (
      <span className="block w-full text-center tabular-nums">
        {i.getValue() ? `$${i.getValue()}` : <span className="text-muted-foreground">—</span>}
      </span>
    ),
  }),
  col.accessor('had_interview', {
    header: 'Had Interview',
    cell: (i) => textCell(i.getValue()),
  }),
  // Pinned UI columns — not in columnVisibility, always visible
  col.display({
    id: 'status',
    header: 'Status',
    enableHiding: false,
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <StatusBadge candidate={row.original} />
      </div>
    ),
  }),
  col.display({
    id: 'action',
    header: 'Actions',
    enableHiding: false,
    cell: ({ row }) => (
      <div className="flex justify-center">
        <ActionMenu candidate={row.original} />
      </div>
    ),
  }),
];
