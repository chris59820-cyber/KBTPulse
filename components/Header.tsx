'use client'

import { Bell, Search, User, MapPin } from 'lucide-react'

interface Perimetre {
  id: string
  nom: string
  ville?: string | null
}

interface HeaderProps {
  title: string
  perimetres?: Perimetre[]
}

export default function Header({ title, perimetres = [] }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
      <div className="px-3 sm:px-4 md:px-6 py-3 md:py-4">
        {/* Première ligne : Titre et actions */}
        <div className="flex items-center justify-between gap-3 mb-2 md:mb-0">
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 truncate flex-1 min-w-0">{title}</h1>
          
          <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
            {/* Recherche mobile - icône seulement */}
            <button className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Search size={20} className="text-gray-600" />
            </button>
            
            {/* Recherche desktop */}
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Rechercher..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 w-48 lg:w-64"
              />
            </div>
            
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative">
              <Bell size={20} className="text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            
            <button className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                <User size={18} className="text-white" />
              </div>
            </button>
          </div>
        </div>
        
        {/* Deuxième ligne : Périmètres (mobile) */}
        {perimetres.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap mt-2 md:mt-0 md:inline-flex">
            <span className="text-xs sm:text-sm font-semibold text-primary-700 hidden sm:inline">Périmètre(s) :</span>
            <span className="text-xs sm:text-sm font-semibold text-primary-700 sm:hidden">Périm. :</span>
            {perimetres.map((perimetre) => (
              <span 
                key={perimetre.id} 
                className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 bg-primary-50 rounded-full text-xs sm:text-sm font-medium text-gray-700 border border-primary-200"
              >
                <MapPin size={12} className="text-primary-600 flex-shrink-0" />
                <span className="truncate max-w-[120px] sm:max-w-none">{perimetre.nom}</span>
                {perimetre.ville && (
                  <span className="text-xs text-gray-500 ml-1 hidden sm:inline">
                    ({perimetre.ville})
                  </span>
                )}
              </span>
            ))}
          </div>
        )}
      </div>
    </header>
  )
}
