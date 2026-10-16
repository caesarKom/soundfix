import { ChevronLeft, ChevronRight, HomeIcon, SearchIcon } from "lucide-react"
import { useRouter } from "next/navigation"

const Header = () => {
    const router = useRouter()
  return (
    <div className="h-fit bg-linear-to-b from-emerald-800 p-6">
        <div className="w-full mb-4 flex items-center justify-between">
        <div className="hidden md:flex gap-x-2 items-center">
          <button
            onClick={() => router.back()}
            className="rounded-full bg-black flex justify-center items-center hover:opacity-75 transition cursor-pointer"
          >
            <ChevronLeft className="text-white" size={35} />
          </button>
          <button
            onClick={() => router.forward()}
            className="rounded-full bg-black flex justify-center items-center hover:opacity-75 transition cursor-pointer"
          >
            <ChevronRight className="text-white" size={35} />
          </button>
        </div>
        {/* mobile view */}
        <div className="flex md:hidden gap-x-2 items-center">
          <button className="rounded-full p-2 bg-white flex items-center justify-center hover:opacity-75 transition cursor-pointer">
            <HomeIcon className="text-black" size={20} />
          </button>
          <button className="rounded-full p-2 bg-white flex items-center justify-center hover:opacity-75 transition cursor-pointer">
            <SearchIcon className="text-black" size={20} />
          </button>
        </div>
    </div>
    </div>
  )
}

export default Header
