import { useState } from 'react';
import { Check, MoreHorizontal, X } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { CandidateWithStatus } from '@/types';
import { ApproveDialog } from './ApproveDialog';
import { RejectModal } from './RejectModal';

interface ActionMenuProps {
  candidate: CandidateWithStatus;
}

export function ActionMenu({ candidate }: ActionMenuProps) {
  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label={`Actions for ${candidate.name}`}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
        >
          <MoreHorizontal className="h-4 w-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" side="bottom" className="w-fit p-2">
          {candidate.status === 'rejected' && (
            <DropdownMenuItem onClick={() => setApproveOpen(true)} className="cursor-pointer">
              <Check className="h-4 w-4" />
              Approve Candidate
            </DropdownMenuItem>
          )}
          {candidate.status === 'approved' && (
            <DropdownMenuItem onClick={() => setRejectOpen(true)} className="cursor-pointer">
              <X className="h-4 w-4" />
              Reject Candidate
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <ApproveDialog
        candidateId={candidate.id}
        candidateName={candidate.name}
        open={approveOpen}
        onOpenChange={setApproveOpen}
      />

      <RejectModal
        candidateId={candidate.id}
        candidateName={candidate.name}
        open={rejectOpen}
        onOpenChange={setRejectOpen}
      />
    </>
  );
}
