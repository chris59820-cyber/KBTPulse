import Image from 'next/image'

interface PhotoSalarieProps {
  photoUrl?: string | null
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
  className = "h-10 w-10" 
}: PhotoSalarieProps) {
  if (photoUrl) {
    return (
      <Image
        src={photoUrl}
        alt={`${prenom} ${nom}`}
        width={size}
        height={size}
        className={`rounded-full object-cover ${className}`}
      />
    )
  }

  // Initiales si pas de photo
  const initiales = `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase()
  
  return (
    <div className={`${className} rounded-full bg-primary-600 flex items-center justify-center text-white font-medium`}>
      {initiales}
    </div>
  )
}