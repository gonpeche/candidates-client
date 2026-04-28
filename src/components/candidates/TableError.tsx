import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TableErrorProps {
  onRetry: () => void;
}

export function TableError({ onRetry }: TableErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-md border p-12 text-center">
      <AlertCircle className="h-8 w-8 text-destructive" />
      <div className="space-y-1">
        <p className="font-medium">Failed to load candidates</p>
        <p className="text-sm text-muted-foreground">
          Something went wrong while fetching data from the server.
        </p>
      </div>
      <Button variant="outline" onClick={onRetry}>
        Try again
      </Button>
    </div>
  );
}
