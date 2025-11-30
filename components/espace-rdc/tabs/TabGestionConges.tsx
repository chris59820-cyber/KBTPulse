'use client'

import { useState, useEffect } from 'react'
import { Calendar, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface TabGestionCongesProps {
  user: any
  salarieRDC: any
  congesRTTEnAttente: number
}

interface Conge {
  id: string
  salarieId: string
  salarie: {
    nom: string
    prenom: string
    matricule: string | null
  }
  type: string
  dateDebut: Date
  dateFin: Date
  dureeJours: number | null
  dureeHeures: number | null
  commentaire: string | null
  statut: string
  createdAt: Date
}

export default function TabGestionConges({
  user,
  salarieRDC,
  congesRTTEnAttente
}: TabGestionCongesProps) {
  const [conges, setConges] = useState<Conge[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadConges()
  }, [])

  const loadConges = async () => {
    try {
      const response = await fetch('/api/espace-rdc/conges?type=RTT&statut=en_attente')
      if (response.ok) {
        const data = await response.json()
        setConges(data)
      }
    } catch (error) {
      console.error('Erreur lors du chargement:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleValidation = async (congeId: string, valide: boolean, commentaire?: string) => {
    try {
      const response = await fetch(`/api/espace-rdc/conges/${congeId}/valider`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          valide,
          commentaire: commentaire || null
        })
      })

      if (response.ok) {
        loadConges()
      }
    } catch (error) {
      console.error('Erreur lors de la validation:', error)
    }
  }

  // Vérifier que le congé RTT est d'une journée maximum
  const isCongValide = (conge: Conge) => {
    if (conge.dureeJours && conge.dureeJours > 1) {
      return false
    }
    if (conge.dureeHeures && conge.dureeHeures > 8) {
      return false
    }
    const dateDebut = new Date(conge.dateDebut)
    const dateFin = new Date(conge.dateFin)
    const diffTime = dateFin.getTime() - dateDebut.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
    return diffDays <= 1
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Gestion des congés - Validation des RTT
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Validation des RTT posés par les ouvriers (maximum 1 journée)
          </p>
        </div>
        <div className="text-sm text-gray-600">
          {congesRTTEnAttente} demande(s) en attente
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
        </div>
      ) : conges.length === 0 ? (
        <p className="text-gray-500 text-center py-8">Aucune demande de RTT en attente</p>
      ) : (
        <div className="space-y-4">
          {conges.map((conge) => {
            const valide = isCongValide(conge)
            const duree = conge.dureeJours || (conge.dureeHeures ? conge.dureeHeures / 8 : 1)

            return (
              <div
                key={conge.id}
                className={`card ${
                  !valide ? 'border-red-200 bg-red-50' : 'border-yellow-200 bg-yellow-50'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Calendar className="text-primary-600" size={20} />
                      <h5 className="font-semibold text-gray-900">
                        {conge.salarie.prenom} {conge.salarie.nom}
                      </h5>
                      {conge.salarie.matricule && (
                        <span className="text-sm text-gray-500">({conge.salarie.matricule})</span>
                      )}
                      {!valide && (
                        <span className="badge badge-danger text-xs">
                          Durée invalide (> 1 jour)
                        </span>
                      )}
                    </div>

                    <div className="space-y-1 text-sm text-gray-600 ml-8">
                      <p>
                        <span className="font-medium">Type:</span> {conge.type}
                      </p>
                      <p>
                        <span className="font-medium">Période:</span> Du {formatDate(conge.dateDebut)} au {formatDate(conge.dateFin)}
                      </p>
                      <p>
                        <span className="font-medium">Durée:</span> {duree} jour(s)
                        {conge.dureeHeures && !conge.dureeJours && (
                          <span className="text-gray-500"> ({conge.dureeHeures} heures)</span>
                        )}
                      </p>
                      {conge.commentaire && (
                        <p className="mt-2">
                          <span className="font-medium">Commentaire:</span> {conge.commentaire}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-2">
                        Demande effectuée le {formatDate(conge.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>

                {!valide && (
                  <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="text-red-600 mt-0.5" size={18} />
                      <div className="text-sm text-red-800">
                        <p className="font-semibold mb-1">Durée invalide</p>
                        <p>Les RTT ne peuvent excéder 1 journée. Cette demande fait {duree} jour(s).</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      if (confirm(`Valider la demande de RTT de ${conge.salarie.prenom} ${conge.salarie.nom} ?`)) {
                        handleValidation(conge.id, true)
                      }
                    }}
                    disabled={!valide}
                    className={`btn flex-1 flex items-center justify-center gap-2 ${
                      valide ? 'btn-success' : 'btn-secondary'
                    }`}
                  >
                    <CheckCircle size={18} />
                    Valider
                  </button>
                  <button
                    onClick={() => {
                      const commentaire = prompt('Raison du refus (optionnel):')
                      if (commentaire !== null) {
                        handleValidation(conge.id, false, commentaire || undefined)
                      }
                    }}
                    className="btn btn-danger flex-1 flex items-center justify-center gap-2"
                  >
                    <XCircle size={18} />
                    Refuser
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
