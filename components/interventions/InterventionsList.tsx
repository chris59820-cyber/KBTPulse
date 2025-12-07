'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Wrench, Calendar, Building2, User, FileText, Briefcase, GripVertical } from 'lucide-react'
import { formatDateTime } from '@/lib/utils'

interface Intervention {
  id: string
  titre: string
  description?: string | null
  dateDebut?: Date | string | null
  dateFin?: Date | string | null
  duree?: number | null
  statut: string
  ordre?: number | null
  chantier?: {
    nom?: string | null
  } | null
  salarie?: {
    prenom: string
    nom: string
  } | null
  rdc?: {
    prenom: string
    nom: string
  } | null
  codeAffaire?: {
    code: string
    description?: string | null
  } | null
  affectationsIntervention?: Array<{
    id: string
    salarie: {
      prenom: string
      nom: string
    }
    role: string
  }> | null
}

interface InterventionsListProps {
  interventions: Intervention[]
  canReorder?: boolean
}

export default function InterventionsList({ interventions: initialInterventions, canReorder = true }: InterventionsListProps) {
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
            className={`card hover:shadow-lg transition-shadow cursor-pointer block relative ${
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
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-4 flex-1">
                <div className="p-3 bg-primary-100 rounded-lg">
                  <Wrench className="text-primary-600" size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="card-title mb-2">{intervention.titre}</h3>
                  {intervention.description && (
                    <p className="text-sm text-gray-600 mb-3">{intervention.description}</p>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Building2 size={16} />
                      <span>{intervention.chantier?.nom || 'Chantier non défini'}</span>
                    </div>
                    {intervention.salarie && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <User size={16} />
                        <span>{intervention.salarie.prenom} {intervention.salarie.nom}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar size={16} />
                      <span>{intervention.dateDebut ? formatDateTime(intervention.dateDebut) : 'Non planifiée'}</span>
                    </div>
                  </div>
                  {(intervention.codeAffaire || intervention.rdc) && (
                    <div className="mt-3 flex items-center gap-4 flex-wrap text-sm">
                      {intervention.codeAffaire && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <FileText size={16} className="text-gray-400" />
                          <span className="text-gray-500">Code affaire:</span>
                          <span className="font-medium">{intervention.codeAffaire.code} - {intervention.codeAffaire.description || 'Sans description'}</span>
                        </div>
                      )}
                      {intervention.rdc && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Briefcase size={16} className="text-gray-400" />
                          <span className="text-gray-500">RDC:</span>
                          <span className="font-medium">{intervention.rdc.prenom} {intervention.rdc.nom}</span>
                        </div>
                      )}
                    </div>
                  )}
                  {intervention.duree && (
                    <div className="text-sm text-gray-600 mt-2">
                      Durée prévue: {intervention.duree}h
                    </div>
                  )}
                  {intervention.affectationsIntervention && intervention.affectationsIntervention.length > 0 && (
                    <div className="mt-3 flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-gray-500">Équipe:</span>
                      {intervention.affectationsIntervention.slice(0, 5).map((aff) => (
                        <span key={aff.id} className="badge badge-info text-xs">
                          {aff.salarie.prenom} {aff.salarie.nom} ({aff.role === 'chef_equipe' ? 'Chef d\'équipe' : 'Ouvrier'})
                        </span>
                      ))}
                      {intervention.affectationsIntervention.length > 5 && (
                        <span className="text-xs text-gray-500">
                          +{intervention.affectationsIntervention.length - 5} autre(s)
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <span className={`badge ${
                intervention.statut === 'terminee' ? 'badge-success' :
                intervention.statut === 'en_cours' ? 'badge-info' :
                intervention.statut === 'annulee' ? 'badge-danger' :
                intervention.statut === 'en_attente' ? 'badge-warning' :
                intervention.statut === 'planifiee' ? 'badge-info' :
                'badge-warning'
              }`}>
                {intervention.statut === 'planifiee' ? 'Planifiée' :
                 intervention.statut === 'en_attente' ? 'En attente' :
                 intervention.statut === 'en_cours' ? 'En cours' :
                 intervention.statut === 'terminee' ? 'Terminée' :
                 intervention.statut === 'annulee' ? 'Annulée' :
                 intervention.statut.replace('_', ' ')}
              </span>
            </div>
            </Link>
          </div>
        </div>
      ))}
    </div>
  )
}

