import { useState } from 'react';
import { Loader2, PlusIcon, XIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useReclassifyCandidate } from '@/hooks/useReclassifyCandidate';
import { useRejectionReasons } from '@/hooks/useRejectionReasons';

interface RejectModalProps {
  candidateId: string;
  candidateName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RejectModal({ candidateId, candidateName, open, onOpenChange }: RejectModalProps) {
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [customReason, setCustomReason] = useState('');
  const [customDraft, setCustomDraft] = useState('');
  const [showInput, setShowInput] = useState(false);
  const { data, isLoading: reasonsLoading } = useRejectionReasons();
  const { mutate, isPending } = useReclassifyCandidate();

  const reasons = data?.reasons ?? [];

  const handleToggle = (reason: string, checked: boolean) => {
    setSelectedReasons((prev) => (checked ? [...prev, reason] : prev.filter((r) => r !== reason)));
  };

  const handleAddCustom = () => {
    const trimmed = customDraft.trim();
    if (!trimmed) return;
    if (reasons.includes(trimmed) || trimmed === customReason) return;
    setCustomReason(trimmed);
    setSelectedReasons((prev) => [...prev, trimmed]);
    setCustomDraft('');
    setShowInput(false);
  };

  const handleRemoveCustom = () => {
    setSelectedReasons((prev) => prev.filter((r) => r !== customReason));
    setCustomReason('');
  };

  const handleConfirm = () => {
    const payload = {
      reasons: selectedReasons,
      ...(customReason ? { newReason: customReason } : {}),
    };
    mutate(
      { id: candidateId, payload },
      {
        onSuccess: () => {
          onOpenChange(false);
          resetState();
          toast.success(`${candidateName} has been rejected.`);
        },
        onError: () => {
          toast.error('Failed to reject candidate. Please try again.');
        },
      }
    );
  };

  const resetState = () => {
    setSelectedReasons([]);
    setCustomReason('');
    setCustomDraft('');
    setShowInput(false);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) resetState();
    onOpenChange(nextOpen);
  };

  const isDuplicate = customDraft.trim() !== '' &&
    (reasons.includes(customDraft.trim()) || customDraft.trim() === customReason);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Reject candidate</DialogTitle>
          <DialogDescription>
            Select one or more reasons for rejecting{' '}
            <span className="font-medium text-foreground">{candidateName}</span>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          {reasonsLoading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              {reasons.map((reason) => {
                const id = `reason-${reason}`;
                return (
                  <div
                    key={reason}
                    className="flex items-center gap-3 rounded-md px-1 py-1 hover:bg-muted/50 transition-colors"
                  >
                    <Checkbox
                      id={id}
                      checked={selectedReasons.includes(reason)}
                      onCheckedChange={(checked) => handleToggle(reason, !!checked)}
                      disabled={isPending}
                    />
                    <label htmlFor={id} className="text-sm leading-none cursor-pointer select-none">
                      {reason}
                    </label>
                  </div>
                );
              })}

              {customReason && (
                <div className="flex items-center gap-3 rounded-md px-1 py-1 hover:bg-muted/50 transition-colors">
                  <Checkbox
                    id="reason-custom"
                    checked={selectedReasons.includes(customReason)}
                    onCheckedChange={(checked) => handleToggle(customReason, !!checked)}
                    disabled={isPending}
                  />
                  <label htmlFor="reason-custom" className="text-sm leading-none cursor-pointer select-none flex-1">
                    {customReason}
                  </label>
                  <button
                    type="button"
                    onClick={handleRemoveCustom}
                    disabled={isPending}
                    className="ml-auto text-muted-foreground hover:text-foreground disabled:opacity-50"
                    aria-label="Remove custom reason"
                  >
                    <XIcon className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}

              {!customReason && (
                showInput ? (
                  <div className="flex items-center gap-2 pt-1">
                    <Input
                      autoFocus
                      value={customDraft}
                      onChange={(e) => setCustomDraft(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddCustom()}
                      placeholder="Type a reason…"
                      className="h-8 text-sm"
                      disabled={isPending}
                    />
                    <Button
                      size="sm"
                      onClick={handleAddCustom}
                      disabled={!customDraft.trim() || isDuplicate || isPending}
                    >
                      Add
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => { setShowInput(false); setCustomDraft(''); }}
                      disabled={isPending}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowInput(true)}
                    disabled={isPending}
                    className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground disabled:opacity-50 transition-colors pt-1"
                  >
                    <PlusIcon className="h-3.5 w-3.5" />
                    Add custom reason
                  </button>
                )
              )}
            </>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isPending}
            className="cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={selectedReasons.length === 0 || isPending}
            className="cursor-pointer"
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Confirm'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
