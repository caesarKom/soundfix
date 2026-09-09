import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { MoreVertical, Trash2, UserX, Clock, Globe, Monitor } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { enGB } from 'date-fns/locale';
import type { SessionResponse } from '../types/session';
import { useSessionStore } from '@/store/sessionStore';

interface SessionsTableProps {
  sessions: SessionResponse[];
  isLoading: boolean;
  onRevoke: (sessionId: string) => void;
  onRevokeAll: (userId: string, userEmail: string) => void;
}

export function SessionsTable({
  sessions,
  isLoading,
  onRevoke,
  onRevokeAll,
}: SessionsTableProps) {
  const { setSelectedSessionId, setRevokeDialogOpen } = useSessionStore();

  const getDeviceIcon = (deviceInfo?: string) => {
    if (!deviceInfo) return <Monitor className="h-4 w-4" />;
    const lower = deviceInfo.toLowerCase();
    if (lower.includes('mobile') || lower.includes('ios') || lower.includes('android')) {
      return <Globe className="h-4 w-4" />;
    }
    return <Monitor className="h-4 w-4" />;
  };

  const formatDate = (date: string) => {
    return formatDistanceToNow(new Date(date), {
      addSuffix: true,
      locale: enGB,
    });
  };

  const formatExpiry = (date: string) => {
    const d = new Date(date);
    if (d < new Date()) {
      return <span className="text-red-500">Expired</span>;
    }
    return formatDistanceToNow(d, { addSuffix: true, locale: enGB });
  };

  if (isLoading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Device</TableHead>
              <TableHead>IP Address</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Expires</TableHead>
              <TableHead className="w-15"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                <TableCell><Skeleton className="h-5 w-28" /></TableCell>
                <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                <TableCell><Skeleton className="h-8 w-8 rounded-full" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-muted p-3">
          <Globe className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="mt-4 text-lg font-medium">No sessions found</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          There are no active or historical sessions matching your filters.
        </p>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className='text-green-600'>User</TableHead>
              <TableHead className='text-green-600'>Device</TableHead>
              <TableHead className='text-green-600'>IP Address</TableHead>
              <TableHead className='text-green-600'>Status</TableHead>
              <TableHead className='text-green-600'>Created</TableHead>
              <TableHead className='text-green-600'>Expires</TableHead>
              <TableHead className="w-15 text-green-600">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sessions.map((session) => (
              <TableRow key={session.id} className="group">
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{session.userName}</span>
                    <span className="text-xs text-muted-foreground">{session.userEmail}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getDeviceIcon(session.deviceInfo)}
                    <span className="text-sm truncate max-w-37.5">
                      {session.deviceInfo || 'Unknown device'}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="font-mono text-sm">{session.ipAddress || 'N/A'}</span>
                </TableCell>
                <TableCell>
                  {session.isRevoked ? (
                    <Badge variant="destructive" className="gap-1">
                      <Clock className="h-3 w-3" />
                      Revoked
                    </Badge>
                  ) : new Date(session.expiresAt) < new Date() ? (
                    <Badge variant="destructive" className="gap-1">
                      <Clock className="h-3 w-3" />
                      Expired
                    </Badge>
                  ) : (
                    <Badge variant="default" className="gap-1 bg-green-700 hover:bg-green-700">
                      Active
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <Tooltip>
                    <TooltipTrigger>
                      <span className="text-sm cursor-help">
                        {formatDate(session.createdAt)}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      {format(new Date(session.createdAt), 'EEEE d', { locale: enGB })}
                    </TooltipContent>
                  </Tooltip>
                </TableCell>
                <TableCell>
                  <Tooltip>
                    <TooltipTrigger>
                      <span className="text-sm cursor-help">
                        {formatExpiry(session.expiresAt)}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      {format(new Date(session.expiresAt), 'EEEE d', { locale: enGB })}
                    </TooltipContent>
                  </Tooltip>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedSessionId(session.id);
                          setRevokeDialogOpen(true);
                        }}
                        disabled={session.isRevoked}
                        className="text-red-600 focus:text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Revoke session
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onRevokeAll(session.userId, session.userEmail)}
                        className="text-red-600 focus:text-red-600"
                      >
                        <UserX className="mr-2 h-4 w-4" />
                        Revoke all for this user
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </TooltipProvider>
  );
}