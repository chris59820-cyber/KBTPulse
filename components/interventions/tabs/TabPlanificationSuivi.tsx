'use client'

import { useState } from 'react'
import { Calendar, Clock, TrendingUp, Image, Plus, CheckCircle, X, MessageSquare } from 'lucide-react'
import { formatDate, formatDateTime } from '@/lib/utils'

interface Intervention {
  id: string
  dateDebut: Date | null
  dateFin: Date | null
  dateDebutReelle: Date | null
  dateFinReelle: Date | null
  tempsPrevu: number | null
  dureeReelle: number | null
  avancement: number
  retexPositifs: string | null
  retexNegatifs: string | null
  photosIntervention: {
    id: string
    url: string
    description: string | null
    createdAt: Date
  }[]
  autoControles: {
    id: string
    element: string
    verifie: boolean
    commentaire: string | null
    dateVerification: Date | null
  }[]
}

interface TabPlanificationSuiviProps {
  intervention: Intervention
  user: any
}

export default function TabPlanificationSuivi({ intervention, user }: TabPlanificationSuiviProps) {
  const [showAvancementForm, setShowAvancementForm] = useState(false)
  const [avancement, setAvancement] = useState(intervention.avancement.toString())
  const [dureeReelle, setDureeReelle] = useState(intervention.dureeReelle?.toString() || '')

  const handleUpdateAvancement = async () => {
    try {
      const response = await fetch(`/api/interventions/${intervention.id}/avancement`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          avancement: parseInt(avancement),
          dureeReelle: dureeReelle ? parseFloat(dureeReelle) : null
        })
      })

      if (response.ok) {
        setShowAvancementForm(false)
        window.location.reload()
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error)
    }
  }

  const handleToggleAutoControle = async (autoControleId: string, verifie: boolean) => {
    try {
      const response = await fetch(`/api/interventions/${intervention.id}/auto-controles/${autoControleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verifie: !verifie })
      })

      if (response.ok) {
        window.location.reload()
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Horaires */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Horaires</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="card">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="text-primary-600" size={20} />
              <h4 className="font-semibold text-gray-900">Dates prévues</h4>
            </div>
            <div className="space-y-2 text-sm">
              <div>
                <p className="text-gray-500">Date de début</p>
                {intervention.dateDebut ? (
                  <p className="text-gray-900 font-medium">{formatDate(intervention.dateDebut)}</p>
                ) : (
                  <p className="text-gray-400 italic">Non planifiée</p>
                )}
              </div>
              {intervention.dateFin && (
                <div>
                  <p className="text-gray-500">Date de fin</p>
                  <p className="text-gray-900 font-medium">{formatDate(intervention.dateFin)}</p>
                </div>
              )}
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="text-green-600" size={20} />
              <h4 className="font-semibold text-gray-900">Dates réelles</h4>
            </div>
            <div className="space-y-2 text-sm">
              {intervention.dateDebutReelle ? (
                <div>
                  <p className="text-gray-500">Date de début réelle</p>
                  <p className="text-gray-900 font-medium">
                    {formatDateTime(intervention.dateDebutReelle)}
                  </p>
                </div>
              ) : (
                <p className="text-gray-400 italic">Pas encore commencé</p>
              )}
              {intervention.dateFinReelle && (
                <div>
                  <p className="text-gray-500">Date de fin réelle</p>
                  <p className="text-gray-900 font-medium">
                    {formatDateTime(intervention.dateFinReelle)}
                  </p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Avancement */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Avancement</h3>
          <button
            onClick={() => setShowAvancementForm(!showAvancementForm)}
            className="btn btn-primary text-sm flex items-center gap-2"
          >
            <TrendingUp size={18} />
            Saisir avancement
          </button>
        </div>

        {showAvancementForm && (
          <div className="card mb-4">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Avancement (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={avancement}
                  onChange={(e) => setAvancement(e.target.value)}
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Temps réellement passé (heures)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={dureeReelle}
                  onChange={(e) => setDureeReelle(e.target.value)}
                  className="input"
                  placeholder="Heures"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleUpdateAvancement}
                  className="btn btn-primary"
                >
                  Enregistrer
                </button>
                <button
                  onClick={() => setShowAvancementForm(false)}
                  className="btn btn-secondary"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Progression</span>
            <span className="text-sm font-bold text-primary-600">{intervention.avancement}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className="bg-primary-600 h-4 rounded-full transition-all duration-300"
              style={{ width: `${intervention.avancement}%` }}
            />
          </div>
        </div>
      </div>

      {/* Auto-contrôle */}
      {intervention.autoControles.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Auto-contrôle</h3>
          <div className="space-y-2">
            {intervention.autoControles.map((autoControle) => (
              <div
                key={autoControle.id}
                className={`card flex items-center justify-between ${
                  autoControle.verifie ? 'bg-green-50 border-green-200' : ''
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {autoControle.verifie ? (
                      <CheckCircle className="text-green-600" size={18} />
                    ) : (
                      <X className="text-gray-400" size={18} />
                    )}
                    <p className="font-medium text-gray-900">{autoControle.element}</p>
                  </div>
                  {autoControle.commentaire && (
                    <p className="text-sm text-gray-600 ml-7">{autoControle.commentaire}</p>
                  )}
                </div>
                <button
                  onClick={() => handleToggleAutoControle(autoControle.id, autoControle.verifie)}
                  className={`btn text-sm ${
                    autoControle.verifie ? 'btn-secondary' : 'btn-primary'
                  }`}
                >
                  {autoControle.verifie ? 'Dévalider' : 'Valider'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Photos */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Documentation - Photos</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {intervention.photosIntervention.map((photo) => (
            <div key={photo.id} className="card p-0 overflow-hidden">
              <img
                src={photo.url}
                alt={photo.description || 'Photo intervention'}
                className="w-full h-32 object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder-image.png'
                }}
              />
              {photo.description && (
                <p className="p-2 text-xs text-gray-600">{photo.description}</p>
              )}
            </div>
          ))}
          <button className="card p-0 border-dashed border-2 border-gray-300 hover:border-primary-600 transition-colors flex flex-col items-center justify-center min-h-[120px] cursor-pointer">
            <Plus className="text-gray-400 mb-2" size={24} />
            <span className="text-sm text-gray-500">Ajouter photo</span>
          </button>
        </div>
      </div>

      {/* Mini RETEX */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Mini retour d'expérience</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="card">
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare className="text-green-600" size={20} />
              <h4 className="font-semibold text-gray-900">Points positifs</h4>
            </div>
            {intervention.retexPositifs ? (
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{intervention.retexPositifs}</p>
            ) : (
              <p className="text-sm text-gray-400 italic">Aucun point positif enregistré</p>
            )}
          </div>
          <div className="card">
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare className="text-red-600" size={20} />
              <h4 className="font-semibold text-gray-900">Points négatifs</h4>
            </div>
            {intervention.retexNegatifs ? (
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{intervention.retexNegatifs}</p>
            ) : (
              <p className="text-sm text-gray-400 italic">Aucun point négatif enregistré</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
