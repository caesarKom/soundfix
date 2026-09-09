import { Button } from "@/components/ui/button"
import { useSessions } from "@/hooks/useSessions"
import { useSessionStore } from "@/store/sessionStore"
import { Trash2 } from "lucide-react"
import { useState } from "react"
import { SessionsFilters } from "./_components/SessionsFilters"
import { SessionsTable } from "./_components/SessionsTable"
import { RevokeDialog } from "./_components/RevokeDialog"
import { RevokeAllDialog } from "./_components/RevokeAllDialog"

export function SessionsView() {
  const {
    sessions,
    meta,
    isLoading,
    isError,
    refetch,
    revokeSession,
    isCleaning,
    cleanupExpired,
  } = useSessions()
  const { setRevokeAllDialogOpen } = useSessionStore()
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await refetch()
    setIsRefreshing(false)
  }

  const handleRevoke = (sessionId: string) => {
    revokeSession(sessionId)
  }

  const handleRevokeAll = (userId: string, userEmail: string) => {
    setRevokeAllDialogOpen(true, userId, userEmail)
  }

  const handleCleanup = () => {
    cleanupExpired()
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-destructive/10 p-3">
          <Trash2 className="h-8 w-8 text-destructive" />
        </div>
        <h3 className="mt-4 text-lg font-medium">Failed to load sessions</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          There was an error loading the session data. Please try again.
        </p>
        <Button onClick={handleRefresh} className="mt-4">
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Session Management
          </h1>
          <p className="text-muted-foreground">
            View and manage all active user sessions across the platform.
          </p>
        </div>
        <Button variant="outline" onClick={handleCleanup} disabled={isCleaning}>
          <Trash2 className="mr-2 h-4 w-4 text-red-400" />
          <span className="text-red-400">{isCleaning ? "Cleaning..." : "Clean Expired"}</span>
        </Button>
      </div>

      <SessionsFilters
        total={meta?.total ?? 0}
        page={meta?.page ?? 1}
        limit={meta?.limit ?? 20}
        totalPages={meta?.totalPages ?? 1}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      />

      <SessionsTable
        sessions={sessions}
        isLoading={isLoading}
        onRevoke={handleRevoke}
        onRevokeAll={handleRevokeAll}
      />

      <RevokeDialog />
      <RevokeAllDialog />
    </div>
  )
}
