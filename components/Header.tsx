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
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4 flex-wrap">
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          
          {/* Affichage des périmètres sur la même ligne */}
          {perimetres.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold text-primary-700">Périmètre(s) :</span>
              {perimetres.map((perimetre) => (
                <span 
                  key={perimetre.id} 
                  className="inline-flex items-center gap-1 px-3 py-1 bg-primary-50 rounded-full text-sm font-medium text-gray-700 border border-primary-200"
                >
                  <MapPin size={14} className="text-primary-600" />
                  {perimetre.nom}
                  {perimetre.ville && (
                    <span className="text-xs text-gray-500 ml-1">
                      ({perimetre.ville})
                    </span>
                  )}
                </span>
              ))}
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Rechercher..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 w-64"
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
    </header>
  )
}
