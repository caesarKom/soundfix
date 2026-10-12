import { ENV } from "@/config/env.config"
import { authService } from "@/services/auth.service"
import { UserPayload } from "@/types/auth.types"
import { LogOut } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"

function SidebarFooter({ user }: { user: UserPayload | null}) {
  const router = useRouter()

  const handleLogoutClick = async () => {
    try {
      await authService.logout()
    } catch {
    } finally {
      router.push("/login")
    }
  }

  return (
    <div className="bg-spotify-base rounded-lg p-4 flex flex-col gap-2 items-center md:items-start mt-auto">
      <div className="flex items-center gap-3 w-full justify-center md:justify-start px-2 py-1">
        {user?.profile.avatar ? (
          <div className="flex relative size-8 rounded-full items-center justify-center overflow-hidden">
            <Image
              src={ENV.getMediaUrl(user.profile.avatar)}
              alt={user.name}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
        ) : (
          <div className="w-7 h-7 rounded-full bg-spotify-green flex items-center justify-center text-spotify-black font-bold text-xs shrink-0 select-none">
            {user?.name?.charAt(0).toUpperCase() || "U"}
          </div>
        )}
        <span className="text-sm font-medium text-spotify-white truncate hidden md:inline">
          {user?.name || "Account"}
        </span>
      </div>
      <button
        onClick={handleLogoutClick}
        className="flex items-center gap-5 text-sm font-bold text-spotify-muted hover:text-red-500 transition w-full justify-center md:justify-start p-2 rounded hover:bg-spotify-highlight cursor-pointer"
      >
        <LogOut size={20} />
        <span className="hidden md:inline">Log Out</span>
      </button>
    </div>
  )
}

export default SidebarFooter
