"use client"

import React from "react"
import { X } from "lucide-react"

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  footerActions?: React.ReactNode
  maxWidthClass?: string // Np. "max-w-2xl", "max-w-md"
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  footerActions,
  maxWidthClass = "max-w-2xl"
}: ModalProps) {
  
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-spotify-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-xs">
      <div className={`bg-spotify-highlight border border-spotify-white/10 w-full ${maxWidthClass} rounded-xl overflow-hidden flex flex-col max-h-[85vh] shadow-2xl text-spotify-white animate-fade-in`}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-spotify-white/5">
          <h3 className="text-lg font-bold truncate">{title}</h3>
          <button 
            onClick={onClose} 
            className="text-spotify-muted hover:text-spotify-white transition cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto scrollbar-none flex-1">
          {children}
        </div>

        {/* Footer */}
        {footerActions && (
          <div className="p-4 bg-spotify-base border-t border-spotify-white/5 flex items-center justify-between">
            {footerActions}
          </div>
        )}

      </div>
    </div>
  )
}
