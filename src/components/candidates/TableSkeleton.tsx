import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

const SKELETON_ROWS = 15;
const SKELETON_COLS = 8;

export function TableSkeleton() {
  return (
    <div className="rounded-lg border shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              {Array.from({ length: SKELETON_COLS }).map((_, i) => (
                <TableHead key={i} className="px-4 py-3">
                  <Skeleton className="h-3 w-20" />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: SKELETON_ROWS }).map((_, i) => (
              <TableRow
                key={i}
                className={i % 2 === 1 ? "bg-muted/20" : ""}
              >
                {Array.from({ length: SKELETON_COLS }).map((_, j) => (
                  <TableCell key={j} className="px-4 py-3">
                    <Skeleton className="h-4 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
