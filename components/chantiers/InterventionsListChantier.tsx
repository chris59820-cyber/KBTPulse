'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { formatDateTime } from '@/lib/utils'
import { GripVertical } from 'lucide-react'

interface Intervention {
  id: string
  titre: string
  description?: string | null
  dateDebut?: Date | string | null
  dateFin?: Date | string | null
  avancement?: number | null
  statut: string
  ordre?: number | null
  responsable?: {
    prenom: string
    nom: string
  } | null
  rdc?: {
    prenom: string
    nom: string
  } | null
  affectationsIntervention?: Array<{
    id: string
    salarie: {
      prenom: string
      nom: string
    }
  }> | null
}

interface InterventionsListChantierProps {
  interventions: Intervention[]
  canReorder?: boolean
  statutColors: Record<string, string>
  statutLabels: Record<string, string>
}

export default function InterventionsListChantier({ 
  interventions: initialInterventions, 
  canReorder = true,
  statutColors,
  statutLabels
}: InterventionsListChantierProps) {
  const router = useRouter()
  const [interventions, setInterventions] = useState(initialInterventions)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const dragItemRef = useRef<number | null>(null)

  // Mettre à jour l'état lorsque les interventions initiales changent
  useEffect(() => {
    setInterventions(initialInterventions)
  }, [initialInterventions])

  // Trier les interventions par ordre
  const sortedInterventions = [...interventions].sort((a, b) => {
    const ordreA = a.ordre ?? 999999
    const ordreB = b.ordre ?? 999999
    return ordreA - ordreB
  })

  const handleDragStart = (index: number) => {
    if (!canReorder) return
    dragItemRef.current = index
    setDraggedIndex(index)
  }

  const handleDragEnter = (index: number) => {
    if (!canReorder || draggedIndex === null) return
    if (index !== draggedIndex) {
      setDragOverIndex(index)
    }
  }

  const handleDragLeave = () => {
    setDragOverIndex(null)
  }

  const handleDragOver = (e: React.DragEvent) => {
    if (!canReorder) return
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = async (e: React.DragEvent, dropIndex: number) => {
    if (!canReorder || draggedIndex === null || dragItemRef.current === null) return
    
    e.preventDefault()
    
    const newInterventions = [...sortedInterventions]
    const draggedItem = newInterventions[dragItemRef.current]
    
    // Retirer l'élément de sa position actuelle
    newInterventions.splice(dragItemRef.current, 1)
    
    // Insérer l'élément à la nouvelle position
    newInterventions.splice(dropIndex, 0, draggedItem)
    
    // Mettre à jour l'ordre localement
    setInterventions(newInterventions)
    setDraggedIndex(null)
    setDragOverIndex(null)
    dragItemRef.current = null

    // Sauvegarder l'ordre dans la base de données
    try {
      const interventionIds = newInterventions.map(intervention => intervention.id)
      const response = await fetch('/api/interventions/reorder', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ interventionIds }),
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la sauvegarde de l\'ordre')
      }

      // Rafraîchir la page pour refléter les changements
      router.refresh()
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'ordre:', error)
      // Revenir à l'état précédent en cas d'erreur
      setInterventions(initialInterventions)
      alert('Erreur lors de la sauvegarde de l\'ordre des interventions')
    }
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
    setDragOverIndex(null)
    dragItemRef.current = null
  }

  const handleCardClick = (e: React.MouseEvent, interventionId: string) => {
    // Si on clique sur la poignée, ne pas naviguer
    if ((e.target as HTMLElement).closest('.drag-handle')) {
      return
    }
    // Si on vient de faire un drag, ne pas naviguer
    if (draggedIndex !== null) {
      e.preventDefault()
      return
    }
  }

  return (
    <div className="space-y-4">
      {sortedInterventions.map((intervention, index) => (
        <div
          key={intervention.id}
          draggable={canReorder}
          onDragStart={() => handleDragStart(index)}
          onDragEnter={() => handleDragEnter(index)}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, index)}
          onDragEnd={handleDragEnd}
          className={`relative transition-all ${
            draggedIndex === index ? 'opacity-50 scale-95 z-50' : ''
          } ${
            dragOverIndex === index ? 'translate-y-1' : ''
          }`}
        >
          <div
            className={`block p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow relative ${
              canReorder ? 'group' : ''
            } ${draggedIndex === index ? 'ring-2 ring-primary-500' : ''} ${
              dragOverIndex === index ? 'ring-2 ring-blue-400 border-blue-400' : ''
            }`}
          >
            {canReorder && (
              <div 
                className="drag-handle absolute left-2 top-1/2 -translate-y-1/2 cursor-move opacity-0 group-hover:opacity-100 hover:opacity-100 z-10 p-2 -ml-2"
                onMouseDown={(e) => {
                  e.stopPropagation()
                }}
              >
                <GripVertical className="text-gray-400 hover:text-gray-600" size={20} />
              </div>
            )}
            <Link
              href={`/interventions/${intervention.id}`}
              onClick={(e) => handleCardClick(e, intervention.id)}
              className="block"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">{intervention.titre}</h3>
                  {intervention.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">{intervention.description}</p>
                  )}
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${statutColors[intervention.statut] || 'bg-gray-100 text-gray-800'}`}>
                  {statutLabels[intervention.statut] || intervention.statut}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
                <div>
                  <p className="text-gray-500 mb-1">Date de début</p>
                  {intervention.dateDebut ? (
                    <p className="text-gray-900">{formatDateTime(intervention.dateDebut)}</p>
                  ) : (
                    <p className="text-gray-400 italic">Non planifiée</p>
                  )}
                </div>
                {intervention.dateFin && (
                  <div>
                    <p className="text-gray-500 mb-1">Date de fin</p>
                    <p className="text-gray-900">{formatDateTime(intervention.dateFin)}</p>
                  </div>
                )}
                {intervention.responsable && (
                  <div>
                    <p className="text-gray-500 mb-1">Responsable</p>
                    <p className="text-gray-900">
                      {intervention.responsable.prenom} {intervention.responsable.nom}
                    </p>
                  </div>
                )}
                {intervention.rdc && (
                  <div>
                    <p className="text-gray-500 mb-1">RDC</p>
                    <p className="text-gray-900">
                      {intervention.rdc.prenom} {intervention.rdc.nom}
                    </p>
                  </div>
                )}
              </div>

              {intervention.affectationsIntervention && intervention.affectationsIntervention.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-500 mb-2">Équipe ({intervention.affectationsIntervention.length} personne{intervention.affectationsIntervention.length > 1 ? 's' : ''})</p>
                  <div className="flex flex-wrap gap-2">
                    {intervention.affectationsIntervention.map((affectation) => (
                      <span key={affectation.id} className="text-sm text-gray-700">
                        {affectation.salarie.prenom} {affectation.salarie.nom}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {intervention.avancement !== null && (
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-600">Avancement</span>
                    <span className="text-gray-900 font-medium">{intervention.avancement}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full transition-all"
                      style={{ width: `${intervention.avancement}%` }}
                    />
                  </div>
                </div>
              )}
            </Link>
          </div>
        </div>
      ))}
    </div>
  )
}

