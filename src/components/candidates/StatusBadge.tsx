import { Badge } from '@/components/ui/badge';
import { CircleAlertIcon } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type { CandidateWithStatus } from '@/types';

interface StatusBadgeProps {
  candidate: CandidateWithStatus;
}

export function StatusBadge({ candidate }: StatusBadgeProps) {
  const { id, status, reason } = candidate;

  if (status === 'approved') {
    return <Badge variant="success">Approved</Badge>;
  }

  const reasons = reason
    .split(',')
    .map((r) => r.trim())
    .join(', ');

  const srId = `rejection-reasons-${id}`;

  return (
    <div className="flex items-center gap-1.5">
      <Badge variant="destructive">Rejected</Badge>
      <Tooltip>
        <TooltipTrigger className="cursor-default" aria-describedby={srId}>
          <CircleAlertIcon className="h-4 w-4 text-destructive" />
        </TooltipTrigger>
        <TooltipContent>
          <p>{reasons}</p>
        </TooltipContent>
      </Tooltip>
      <span id={srId} className="sr-only">
        {`Rejection reasons: ${reasons}`}
      </span>
    </div>
  );
}
