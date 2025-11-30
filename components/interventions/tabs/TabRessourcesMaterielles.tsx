'use client'

import { useState } from 'react'
import { Package, CheckCircle, X, AlertCircle, Truck, Wrench } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface Intervention {
  id: string
  ressourcesIntervention: {
    id: string
    type: string
    nom: string
    description: string | null
    quantite: number
    reference: string | null
    valide: boolean
    restitue: boolean
    dateValidation: Date | null
    dateRestitution: Date | null
    commentaire: string | null
  }[]
}

interface TabRessourcesMateriellesProps {
  intervention: Intervention
  user: any
}

const typesRessources: Record<string, string> = {
  outillage: 'Outillage',
  fourniture: 'Fourniture',
  epi: 'EPI',
  vehicule: 'Véhicule',
  engin: 'Engin'
}

const typeIcons: Record<string, any> = {
  outillage: Wrench,
  fourniture: Package,
  epi: Package,
  vehicule: Truck,
  engin: Truck
}

export default function TabRessourcesMaterielles({ intervention, user }: TabRessourcesMateriellesProps) {
  const canValidate = ['PREPA', 'CE', 'RDC', 'CAFF', 'ADMIN'].includes(user.role)

  const handleValidate = async (resourceId: string) => {
    if (!confirm('Valider cette ressource ?')) return

    try {
      const response = await fetch(`/api/interventions/${intervention.id}/ressources/${resourceId}/valider`, {
        method: 'POST'
      })

      if (response.ok) {
        window.location.reload()
      }
    } catch (error) {
      console.error('Erreur lors de la validation:', error)
    }
  }

  const handleRestitue = async (resourceId: string) => {
    if (!confirm('Marquer cette ressource comme restituée ?')) return

    try {
      const response = await fetch(`/api/interventions/${intervention.id}/ressources/${resourceId}/restitue`, {
        method: 'POST'
      })

      if (response.ok) {
        window.location.reload()
      }
    } catch (error) {
      console.error('Erreur lors de la restitution:', error)
    }
  }

  const resourcesByType = intervention.ressourcesIntervention.reduce((acc, resource) => {
    if (!acc[resource.type]) {
      acc[resource.type] = []
    }
    acc[resource.type].push(resource)
    return acc
  }, {} as Record<string, typeof intervention.ressourcesIntervention>)

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Ressources matérielles</h3>

      {Object.keys(resourcesByType).length === 0 ? (
        <p className="text-gray-500 text-center py-8">Aucune ressource matérielle</p>
      ) : (
        Object.entries(resourcesByType).map(([type, resources]) => {
          const Icon = typeIcons[type] || Package

          return (
            <div key={type} className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Icon className="text-primary-600" size={20} />
                <h4 className="text-base font-semibold text-gray-900">
                  {typesRessources[type] || type} ({resources.length})
                </h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {resources.map((resource) => (
                  <div
                    key={resource.id}
                    className={`card ${
                      resource.restitue
                        ? 'bg-gray-50 border-gray-200'
                        : resource.valide
                        ? 'border-green-200 bg-green-50'
                        : 'border-yellow-200 bg-yellow-50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h5 className="font-semibold text-gray-900">{resource.nom}</h5>
                      <div className="flex gap-1">
                        {resource.valide && (
                          <CheckCircle className="text-green-600" size={18} />
                        )}
                        {resource.restitue && (
                          <X className="text-gray-400" size={18} />
                        )}
                        {!resource.valide && !resource.restitue && (
                          <AlertCircle className="text-yellow-600" size={18} />
                        )}
                      </div>
                    </div>

                    {resource.description && (
                      <p className="text-sm text-gray-600 mb-2">{resource.description}</p>
                    )}

                    <div className="space-y-1 text-sm text-gray-600 mb-3">
                      {resource.quantite > 1 && (
                        <p>Quantité: {resource.quantite}</p>
                      )}
                      {resource.reference && (
                        <p>Référence: {resource.reference}</p>
                      )}
                    </div>

                    {resource.commentaire && (
                      <p className="text-xs text-gray-500 mb-3 italic">{resource.commentaire}</p>
                    )}

                    <div className="space-y-2">
                      {resource.valide && resource.dateValidation && (
                        <p className="text-xs text-green-600">
                          ✓ Validé le {formatDate(resource.dateValidation)}
                        </p>
                      )}
                      {resource.restitue && resource.dateRestitution && (
                        <p className="text-xs text-gray-500">
                          Restitué le {formatDate(resource.dateRestitution)}
                        </p>
                      )}

                      {canValidate && !resource.valide && (
                        <button
                          onClick={() => handleValidate(resource.id)}
                          className="btn btn-primary text-sm w-full"
                        >
                          Valider
                        </button>
                      )}

                      {canValidate && resource.valide && !resource.restitue && (
                        <button
                          onClick={() => handleRestitue(resource.id)}
                          className="btn btn-secondary text-sm w-full"
                        >
                          Marquer comme restitué
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}
