import { useState } from "react";
import { Settings2Icon, Loader2Icon } from "lucide-react";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useColumns } from "@/hooks/useColumns";
import { useUpdateColumns } from "@/hooks/useUpdateColumns";
import type { ColumnVisibilityMap } from "@/types";
import { CV_KEYS, toEntries } from "./utils/visibilityFilters";

export function ColumnVisibilityFilter() {
  const { data: columns } = useColumns();
  const { mutate, isPending } = useUpdateColumns();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<ColumnVisibilityMap | null>(null);

  function handleOpenChange(isOpen: boolean) {
    if (isOpen && columns) {
      setDraft({ ...columns });
    }
    setOpen(isOpen);
  }

  function handleToggle(key: keyof ColumnVisibilityMap, value: boolean) {
    if (!draft) return;
    if (CV_KEYS.includes(key)) {
      setDraft({ ...draft, cv_zonajobs: value, cv_bumeran: value });
    } else {
      setDraft({ ...draft, [key]: value });
    }
  }

  function handleConfirm() {
    if (!draft) return;
    mutate(draft, {
      onSuccess: () => {
        setOpen(false);
        setDraft(null);
        toast.success("Column visibility updated.");
      },
      onError: () => {
        toast.error("Failed to update columns. Please try again.");
      },
    });
  }

  const entries = draft ? toEntries(draft) : [];

  return (
    <DropdownMenu open={open} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger
        className={cn(
          buttonVariants({ variant: "outline" }),
          "gap-2 w-full sm:w-auto",
        )}
      >
        <Settings2Icon className="size-4" />
        Visible Columns
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 p-2" align="start">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <div className="mt-1 space-y-1 max-h-72 overflow-y-auto">
          {entries.map(({ key, label, visible }) => (
            <div
              key={key}
              className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm hover:bg-accent"
            >
              <span>{label}</span>
              <Switch
                checked={visible}
                onCheckedChange={(checked) => handleToggle(key, checked)}
                aria-label={`Toggle ${label} column visibility`}
              />
            </div>
          ))}
        </div>
        <DropdownMenuSeparator className="mt-2" />
        <div className="pt-1">
          <Button
            className="w-full cursor-pointer"
            disabled={isPending}
            onClick={handleConfirm}
          >
            {isPending ? (
              <>
                <Loader2Icon className="size-4 animate-spin" />
                Saving…
              </>
            ) : (
              "Confirm"
            )}
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
