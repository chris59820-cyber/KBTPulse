'use client'

import { useState } from 'react'
import { Calendar, Plus, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react'
import { formatDate, formatDateTime } from '@/lib/utils'
import FormDemandeConge from './FormDemandeConge'
import CalendrierConges from './CalendrierConges'

interface Salarie {
  id: string
  conges: {
    id: string
    type: string
    dateDebut: Date
    dateFin: Date
    dureeJours: number | null
    dureeHeures: number | null
    commentaire: string | null
    statut: string
    commentaireValidation: string | null
    dateValidation: Date | null
    createdAt: Date
  }[]
}

interface TabGestionCongesProps {
  salarie: Salarie
}

export default function TabGestionConges({ salarie }: TabGestionCongesProps) {
  const [showForm, setShowForm] = useState(false)
  const [activeView, setActiveView] = useState<'liste' | 'calendrier' | 'compteurs'>('liste')

  // Compter les congés disponibles par type (simulé - à implémenter avec les données réelles)
  const congesDisponibles = {
    CP: 25, // Jours de congés payés disponibles
    RTT: 10,
    Repos: 5,
    RC: 0,
    RL: 0,
    EF: 2
  }

  // Compter les congés pris par type
  const congesPris = salarie.conges
    .filter(c => c.statut === 'valide')
    .reduce((acc, conge) => {
      acc[conge.type] = (acc[conge.type] || 0) + (conge.dureeJours || 0)
      return acc
    }, {} as Record<string, number>)

  const statutColors: Record<string, string> = {
    en_attente: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    valide: 'bg-green-50 border-green-200 text-green-800',
    refuse: 'bg-red-50 border-red-200 text-red-800',
    annule: 'bg-gray-50 border-gray-200 text-gray-800',
  }

  const statutIcons: Record<string, any> = {
    en_attente: Clock,
    valide: CheckCircle,
    refuse: XCircle,
    annule: AlertCircle,
  }

  // Fonction pour formater le type de congé avec son libellé
  const formatTypeConge = (type: string): string => {
    const typesLibelles: Record<string, string> = {
      CP: 'CP - Congés payés',
      RTT: 'RTT',
      Repos: 'Repos',
      RC: 'RC',
      RL: 'RL',
      EF: 'EF - Événement familial',
    }
    return typesLibelles[type] || type
  }

  return (
    <div className="space-y-6">
      {/* Bouton pour poser des congés */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Gestion des congés</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus size={18} />
          Poser des congés
        </button>
      </div>

      {/* Formulaire de demande */}
      {showForm && (
        <div className="card mb-6">
          <FormDemandeConge salarieId={salarie.id} onClose={() => setShowForm(false)} />
        </div>
      )}

      {/* Navigation des vues */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-1">
          {[
            { id: 'compteurs' as const, label: 'Compteurs' },
            { id: 'liste' as const, label: 'Suivi' },
            { id: 'calendrier' as const, label: 'Calendrier' },
          ].map((view) => (
            <button
              key={view.id}
              onClick={() => setActiveView(view.id)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeView === view.id
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {view.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Compteurs des congés disponibles */}
      {activeView === 'compteurs' && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          {Object.entries(congesDisponibles).map(([type, disponible]) => {
            const pris = congesPris[type] || 0
            const restant = disponible - pris
            const pourcentage = (pris / disponible) * 100

            return (
              <div key={type} className="card text-center">
                <p className="text-sm text-gray-500 mb-1">{type}</p>
                <p className="text-2xl font-bold text-gray-900 mb-1">{restant}</p>
                <p className="text-xs text-gray-500">
                  Restant sur {disponible} jours
                </p>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary-600 h-2 rounded-full"
                    style={{ width: `${Math.min(pourcentage, 100)}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Suivi des demandes */}
      {activeView === 'liste' && (
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-900">Suivi des demandes</h4>
          {salarie.conges.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Aucune demande de congé</p>
          ) : (
            salarie.conges.map((conge) => {
              const StatutIcon = statutIcons[conge.statut] || Clock
              const colorClass = statutColors[conge.statut] || statutColors.en_attente

              return (
                <div
                  key={conge.id}
                  className={`p-4 border rounded-lg ${colorClass}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <StatutIcon size={18} />
                      <h5 className="font-semibold">
                        {formatTypeConge(conge.type)} - Du {formatDate(conge.dateDebut)} au {formatDate(conge.dateFin)}
                      </h5>
                    </div>
                    <span className={`badge text-xs ${colorClass.replace('bg-', 'badge-')}`}>
                      {conge.statut.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-sm mb-2">
                    {conge.dureeJours && (
                      <span>{conge.dureeJours} jour(s)</span>
                    )}
                    {conge.dureeHeures && (
                      <span>{conge.dureeHeures} heure(s)</span>
                    )}
                    <span className="text-xs text-gray-500">
                      Demandé le {formatDateTime(conge.createdAt)}
                    </span>
                  </div>

                  {conge.commentaire && (
                    <p className="text-sm mb-2">{conge.commentaire}</p>
                  )}

                  {conge.commentaireValidation && (
                    <div className="mt-2 p-2 bg-white bg-opacity-50 rounded">
                      <p className="text-xs font-semibold mb-1">Commentaire de validation:</p>
                      <p className="text-sm">{conge.commentaireValidation}</p>
                    </div>
                  )}

                  {conge.dateValidation && (
                    <p className="text-xs mt-2">
                      Validé le {formatDate(conge.dateValidation)}
                    </p>
                  )}
                </div>
              )
            })
          )}
        </div>
      )}

      {/* Calendrier de visualisation */}
      {activeView === 'calendrier' && (
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Calendrier des congés et formations</h4>
          <CalendrierConges conges={salarie.conges} />
        </div>
      )}
    </div>
  )
}
