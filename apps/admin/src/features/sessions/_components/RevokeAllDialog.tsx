import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { useSessionStore } from '@/store/sessionStore';
import { useSessions } from '@/hooks/useSessions';

export function RevokeAllDialog() {
  const {
    isRevokeAllDialogOpen,
    setRevokeAllDialogOpen,
    targetUserId,
    targetUserEmail,
  } = useSessionStore();

  const { revokeAllSessions, isRevokingAll } = useSessions();

  const handleConfirm = () => {
    if (targetUserId) {
      revokeAllSessions(targetUserId, {
        onSuccess: () => {
          setRevokeAllDialogOpen(false, undefined, undefined);
        },
      });
    }
  };

  return (
    <Dialog
      open={isRevokeAllDialogOpen}
      onOpenChange={(open) => {
        if (!open) setRevokeAllDialogOpen(false, undefined, undefined);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Revoke All Sessions
          </DialogTitle>
          <DialogDescription>
            This will force logout the user from <strong>all</strong> their active sessions.
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-md bg-muted p-4 text-sm">
          <span className="text-muted-foreground">User:</span>
          <span className="ml-2 font-medium">{targetUserEmail || 'Unknown'}</span>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setRevokeAllDialogOpen(false, undefined, undefined)}
          >
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={isRevokingAll}>
            {isRevokingAll ? 'Revoking...' : 'Confirm Revoke All'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}