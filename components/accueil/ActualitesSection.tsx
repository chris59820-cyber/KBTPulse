'use client'

import { Calendar, Image as ImageIcon, ChevronRight } from 'lucide-react'
import { formatDateTime } from '@/lib/utils'
import { useState } from 'react'

interface Actualite {
  id: string
  titre: string
  description: string | null
  contenu: string | null
  imageUrl: string | null
  images: string | null
  datePublication: Date
  auteurId: string | null
  perimetre?: {
    id: string
    nom: string
  } | null
}

interface ActualitesSectionProps {
  actualites: Actualite[]
}

export default function ActualitesSection({ actualites }: ActualitesSectionProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const getAdditionalImages = (images: string | null): string[] => {
    if (!images) return []
    try {
      const parsed = JSON.parse(images)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">Actualités</h2>
      </div>

      <div className="space-y-4">
        {actualites.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Aucune actualité pour le moment</p>
        ) : (
          actualites.map((actualite) => {
            const additionalImages = getAdditionalImages(actualite.images)
            const isExpanded = expandedId === actualite.id

            return (
              <div
                key={actualite.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                {/* Images */}
                {(actualite.imageUrl || additionalImages.length > 0) && (
                  <div className="mb-4 rounded-lg overflow-hidden space-y-2">
                    {actualite.imageUrl && (
                      <div className="relative w-[250px] h-[250px] mx-auto overflow-hidden rounded-lg bg-gray-100 flex items-center justify-center">
                        <img
                          src={actualite.imageUrl}
                          alt={actualite.titre}
                          className="max-w-full max-h-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none'
                          }}
                        />
                      </div>
                    )}
                    
                    {additionalImages.length > 0 && (
                      <div className={`grid gap-2 ${additionalImages.length === 1 ? 'grid-cols-1 max-w-md mx-auto' : additionalImages.length === 2 ? 'grid-cols-2 max-w-md mx-auto' : 'grid-cols-3'}`}>
                        {additionalImages.slice(0, isExpanded ? additionalImages.length : 3).map((imgUrl, index) => (
                          <div key={index} className="relative w-[250px] h-[250px] overflow-hidden rounded-lg bg-gray-100 flex items-center justify-center">
                            <img
                              src={imgUrl}
                              alt={`${actualite.titre} - Image ${index + 1}`}
                              className="max-w-full max-h-full object-contain"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none'
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {actualite.titre}
                </h3>
                
                {actualite.description && (
                  <p className="text-gray-600 mb-3">{actualite.description}</p>
                )}
                
                {actualite.contenu && (
                  <div className="mb-3">
                    <p className={`text-sm text-gray-500 ${!isExpanded ? 'line-clamp-3' : ''}`}>
                      {actualite.contenu}
                    </p>
                    {actualite.contenu.length > 150 && (
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : actualite.id)}
                        className="text-sm text-primary-600 hover:text-primary-700 mt-1 flex items-center gap-1"
                      >
                        {isExpanded ? 'Voir moins' : 'Voir plus'}
                        <ChevronRight 
                          size={14} 
                          className={`transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                        />
                      </button>
                    )}
                  </div>
                )}
                
                <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Calendar size={14} />
                      <span>{formatDateTime(actualite.datePublication)}</span>
                    </div>
                    {actualite.perimetre && (
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {actualite.perimetre.nom}
                      </span>
                    )}
                  </div>
                  {additionalImages.length > 3 && (
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : actualite.id)}
                      className="flex items-center gap-1 text-primary-600 hover:text-primary-700"
                    >
                      <ImageIcon size={14} />
                      <span>{isExpanded ? 'Voir moins' : `Voir ${additionalImages.length - 3} images supplémentaires`}</span>
                    </button>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
