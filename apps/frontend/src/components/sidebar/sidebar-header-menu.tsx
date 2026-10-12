import { Home, Search } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

function SidebarHeaderMenu() {
  return (
    <div className="bg-spotify-base rounded-lg p-5 space-y-4 flex flex-col items-center md:items-start">
        <Link
          href="/home"
          className="flex items-center gap-5 text-sm font-bold text-spotify-muted hover:text-spotify-white transition w-full justify-center md:justify-start"
        >
          <Home size={24} />
          <span className="hidden md:inline">Home</span>
        </Link>
        <Link
          href="/search"
          className="flex items-center gap-5 text-sm font-bold text-spotify-muted hover:text-spotify-white transition w-full justify-center md:justify-start"
        >
          <Search size={24} />
          <span className="hidden md:inline">Search</span>
        </Link>
      </div>
  )
}

export default SidebarHeaderMenu