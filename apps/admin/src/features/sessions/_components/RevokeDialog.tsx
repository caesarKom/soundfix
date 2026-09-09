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

export function RevokeDialog() {
  const {
    selectedSessionId,
    isRevokeDialogOpen,
    setRevokeDialogOpen,
    setSelectedSessionId,
  } = useSessionStore();

  const { sessions, revokeSession, isRevoking } = useSessions();

  const session = sessions.find((s) => s.id === selectedSessionId);

  const handleConfirm = () => {
    if (selectedSessionId) {
      revokeSession(selectedSessionId, {
        onSuccess: () => {
          setRevokeDialogOpen(false);
          setSelectedSessionId(null);
        },
      });
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setRevokeDialogOpen(false);
      setSelectedSessionId(null);
    }
  };

  return (
    <Dialog open={isRevokeDialogOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Revoke Session
          </DialogTitle>
          <DialogDescription>
            This will force logout the user from this specific session. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        {session && (
          <div className="rounded-md bg-muted p-4 text-sm">
            <div className="grid grid-cols-2 gap-2">
              <span className="text-muted-foreground">User:</span>
              <span className="font-medium">{session.userName} ({session.userEmail})</span>
              <span className="text-muted-foreground">Device:</span>
              <span className="font-medium">{session.deviceInfo || 'Unknown'}</span>
              <span className="text-muted-foreground">IP:</span>
              <span className="font-mono text-xs">{session.ipAddress || 'N/A'}</span>
              <span className="text-muted-foreground">Created:</span>
              <span className="font-medium">
                {new Date(session.createdAt).toLocaleString()}
              </span>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={isRevoking}>
            {isRevoking ? 'Revoking...' : 'Confirm Revoke'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}