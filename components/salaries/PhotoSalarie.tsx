'use client'

import { User } from 'lucide-react'

interface PhotoSalarieProps {
  photoUrl: string | null | undefined
  prenom: string
  nom: string
  size?: number
  className?: string
}

export default function PhotoSalarie({ 
  photoUrl, 
  prenom, 
  nom, 
  size = 40,
  className = ''
}: PhotoSalarieProps) {
  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt={`${prenom} ${nom}`}
        className={`rounded-full object-cover ${className}`}
        style={{ width: size, height: size }}
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = 'none'
        }}
      />
    )
  }

  return (
    <div 
      className={`rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      <User className="text-primary-600" size={size * 0.5} />
    </div>
  )
}



