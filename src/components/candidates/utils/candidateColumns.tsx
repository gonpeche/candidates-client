import { Fragment } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown, ExternalLink } from "lucide-react";
import type { CandidateWithStatus } from "@/types";
import { ActionMenu } from "@/components/candidates/ActionMenu";
import { StatusBadge } from "@/components/candidates/StatusBadge";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

const col = createColumnHelper<CandidateWithStatus>();

const CV_SOURCES: { key: keyof CandidateWithStatus; label: string }[] = [
  { key: "cv_zonajobs", label: "Zonajobs" },
  { key: "cv_bumeran", label: "Bumeran" },
];

const textCell = (value: string | number) =>
  value !== "" && value !== null && value !== undefined ? (
    <span>{String(value)}</span>
  ) : (
    <span className="text-muted-foreground">—</span>
  );

const truncatedCell = (value: string, maxWidth = "max-w-[16rem]") =>
  value ? (
    <span className={`block ${maxWidth} truncate`} title={value}>
      {value}
    </span>
  ) : (
    <span className="text-muted-foreground">—</span>
  );

const numericCell = (value: number | string) => (
  <span className="tabular-nums">{value}</span>
);

export const candidateColumns = [
  col.accessor("id", {
    size: 150,
    minSize: 150,
    maxSize: 150,
    header: "ID",
    cell: (i) => truncatedCell(i.getValue(), "max-w-[8rem]"),
  }),
  col.accessor("name", {
    size: 220,
    minSize: 150,
    maxSize: 150,
    header: "NAME",
    cell: (i) => (
      <span
        className="block max-w-[12rem] truncate font-medium text-foreground"
        title={i.getValue()}
      >
        {i.getValue()}
      </span>
    ),
  }),
  col.accessor("document", {
    size: 130,
    minSize: 130,
    maxSize: 130,
    header: () => <span className="flex justify-center">DOCUMENT</span>,
    cell: (i) => (
      <span className="block w-full text-center tabular-nums">
        {i.getValue()}
      </span>
    ),
  }),
  col.display({
    id: "cv",
    size: 80,
    minSize: 80,
    maxSize: 80,
    header: () => <span className="flex justify-center">CV</span>,
    cell: ({ row }) => {
      const links = CV_SOURCES.filter((s) => row.original[s.key]);
      if (links.length === 0) return null;
      return (
        <div className="flex items-center justify-center gap-2">
          {links.map(({ key, label }, index) => (
            <Fragment key={key}>
              {index > 0 && (
                <span className="text-muted-foreground select-none">|</span>
              )}
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
  col.accessor("phone", {
    size: 140,
    minSize: 140,
    maxSize: 140,
    header: "PHONE",
    cell: (i) => textCell(i.getValue()),
  }),
  col.accessor("email", {
    size: 250,
    minSize: 160,
    maxSize: 160,
    header: "EMAIL",
    cell: (i) => truncatedCell(i.getValue(), "max-w-[14rem]"),
  }),
  col.accessor("date", {
    size: 130,
    minSize: 130,
    maxSize: 130,
    header: "DATE",
    cell: (i) => (
      <span className="tabular-nums text-muted-foreground whitespace-nowrap">
        {i.getValue().trim().slice(0, 10)}
      </span>
    ),
  }),
  col.accessor("age", {
    size: 90,
    minSize: 90,
    maxSize: 90,
    header: "AGE",
    cell: (i) => numericCell(i.getValue()),
  }),
  col.accessor("has_university", {
    size: 130,
    minSize: 130,
    maxSize: 130,
    enableSorting: true,
    sortingFn: (rowA, rowB, columnId) =>
      String(rowA.getValue(columnId)).localeCompare(
        String(rowB.getValue(columnId)),
      ),
    header: ({ column }) => {
      const sorted = column.getIsSorted();
      return (
        <button
          onClick={() => column.toggleSorting(sorted === "asc")}
          className="flex items-center justify-center gap-1 w-full cursor-pointer select-none"
          aria-label={`Sort by university${sorted === "asc" ? ", descending" : sorted === "desc" ? ", clear sort" : ", ascending"}`}
        >
          UNIVERSITY
          {sorted === "asc" ? (
            <ArrowUp className="h-3 w-3" />
          ) : sorted === "desc" ? (
            <ArrowDown className="h-3 w-3" />
          ) : (
            <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
          )}
        </button>
      );
    },
    cell: (i) => textCell(i.getValue()),
  }),
  col.accessor("career", {
    size: 224,
    minSize: 224,
    maxSize: 224,
    header: "CAREER",
    cell: (i) => truncatedCell(i.getValue(), "max-w-[14rem]"),
  }),
  col.accessor("graduated", {
    size: 120,
    minSize: 120,
    maxSize: 120,
    header: "GRADUATED",
    cell: (i) => textCell(i.getValue()),
  }),
  col.accessor("courses_approved", {
    size: 170,
    minSize: 170,
    maxSize: 170,
    header: "COURSES APPROVED",
    cell: (i) => textCell(i.getValue()),
  }),
  col.accessor("location", {
    size: 240,
    minSize: 240,
    maxSize: 240,
    header: "LOCATION",
    cell: (i) => truncatedCell(i.getValue(), "max-w-[16rem]"),
  }),
  col.accessor("accepts_working_hours", {
    size: 150,
    minSize: 150,
    maxSize: 150,
    enableSorting: true,
    sortingFn: (rowA, rowB, columnId) =>
      String(rowA.getValue(columnId)).localeCompare(
        String(rowB.getValue(columnId)),
      ),
    header: ({ column }) => {
      const sorted = column.getIsSorted();
      return (
        <button
          onClick={() => column.toggleSorting(sorted === "asc")}
          className="flex items-center justify-center gap-1 w-full cursor-pointer select-none"
          aria-label={`Sort by accepts hours${sorted === "asc" ? ", descending" : sorted === "desc" ? ", clear sort" : ", ascending"}`}
        >
          ACCEPTS HOURS
          {sorted === "asc" ? (
            <ArrowUp className="h-3 w-3" />
          ) : sorted === "desc" ? (
            <ArrowDown className="h-3 w-3" />
          ) : (
            <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
          )}
        </button>
      );
    },
    cell: (i) => textCell(i.getValue()),
  }),
  col.accessor("desired_salary", {
    size: 170,
    minSize: 170,
    maxSize: 170,
    enableSorting: true,
    sortingFn: (rowA, rowB, columnId) =>
      Number(rowA.getValue(columnId)) - Number(rowB.getValue(columnId)),
    header: ({ column }) => {
      const sorted = column.getIsSorted();
      return (
        <button
          onClick={() => column.toggleSorting(sorted === "asc")}
          className="flex items-center justify-center gap-1 w-full cursor-pointer select-none"
          aria-label={`Sort by desired salary${sorted === "asc" ? ", descending" : sorted === "desc" ? ", clear sort" : ", ascending"}`}
        >
          DESIRED SALARY
          {sorted === "asc" ? (
            <ArrowUp className="h-3 w-3" />
          ) : sorted === "desc" ? (
            <ArrowDown className="h-3 w-3" />
          ) : (
            <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
          )}
        </button>
      );
    },
    cell: (i) => (
      <span className="block w-full text-center tabular-nums">
        {i.getValue() ? (
          `$${i.getValue()}`
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </span>
    ),
  }),
  col.accessor("had_interview", {
    size: 140,
    minSize: 140,
    maxSize: 140,
    header: "HAD INTERVIEW",
    cell: (i) => textCell(i.getValue()),
  }),
  col.accessor("reason", {
    size: 300,
    minSize: 300,
    maxSize: 300,
    header: "REASON",
    cell: (i) => {
      const value = i.getValue();
      if (!value) return <span className="text-muted-foreground">—</span>;
      return (
        <Tooltip>
          <TooltipTrigger className="block w-full max-w-full overflow-hidden text-center cursor-default">
            <span className="block w-full truncate">{value}</span>
          </TooltipTrigger>
          <TooltipContent
            side="top"
            className="max-w-sm whitespace-pre-wrap break-words"
          >
            {value}
          </TooltipContent>
        </Tooltip>
      );
    },
  }),
  // Pinned UI columns — not in columnVisibility, always visible
  col.display({
    id: "status",
    header: "STATUS",
    enableHiding: false,
    size: 140,
    minSize: 140,
    maxSize: 140,
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <StatusBadge candidate={row.original} />
      </div>
    ),
  }),
  col.display({
    id: "action",
    header: "ACTIONS",
    enableHiding: false,
    size: 96,
    minSize: 96,
    maxSize: 96,
    cell: ({ row }) => (
      <div className="flex justify-center">
        <ActionMenu candidate={row.original} />
      </div>
    ),
  }),
];
