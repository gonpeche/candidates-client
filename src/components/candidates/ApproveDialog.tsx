import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useReclassifyCandidate } from '@/hooks/useReclassifyCandidate';

interface ApproveDialogProps {
  candidateId: string;
  candidateName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ApproveDialog({
  candidateId,
  candidateName,
  open,
  onOpenChange,
}: ApproveDialogProps) {
  const { mutate, isPending } = useReclassifyCandidate();

  const handleConfirm = (e: React.MouseEvent) => {
    e.preventDefault();
    mutate(
      { id: candidateId, payload: { reasons: [] } },
      {
        onSuccess: () => {
          onOpenChange(false);
          toast.success(`${candidateName} has been approved.`);
        },
        onError: () => {
          toast.error('Failed to approve candidate. Please try again.');
        },
      }
    );
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Approve candidate</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to approve{' '}
            <span className="font-medium text-foreground">{candidateName}</span>? All rejection
            reasons will be removed.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending} className="cursor-pointer">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isPending}
            className="cursor-pointer"
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirm
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
