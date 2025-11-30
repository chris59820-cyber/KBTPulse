'use client'

import { useState, useEffect } from 'react'
import { Users, User, Star, History, Eye, Search } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'

interface TabGestionPersonnelProps {
  user: any
}

interface Salarie {
  id: string
  nom: string
  prenom: string
  email: string | null
  telephone: string | null
  photoUrl: string | null
  poste: string
  fonction: string | null
  matricule: string | null
  dateEmbauche: Date
  evaluations: any[]
  evenementsRH: any[]
}

export default function TabGestionPersonnel({ user }: TabGestionPersonnelProps) {
  const [salaries, setSalaries] = useState<Salarie[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSalarie, setSelectedSalarie] = useState<Salarie | null>(null)
  const [activeView, setActiveView] = useState<'liste' | 'detail' | 'evaluations' | 'historique'>('liste')

  useEffect(() => {
    loadSalaries()
  }, [])

  const loadSalaries = async () => {
    try {
      const response = await fetch('/api/espace-caff/personnel')
      if (response.ok) {
        const data = await response.json()
        setSalaries(data)
      }
    } catch (error) {
      console.error('Erreur lors du chargement:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredSalaries = salaries.filter(salarie =>
    `${salarie.prenom} ${salarie.nom}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    salarie.matricule?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    salarie.poste?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Gestion du personnel ({salaries.length})
        </h3>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Rechercher un salarié..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10 pr-4"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
        </div>
      ) : activeView === 'liste' && (
        <div className="space-y-3">
          {filteredSalaries.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Aucun salarié trouvé</p>
          ) : (
            filteredSalaries.map((salarie) => (
              <div
                key={salarie.id}
                className="card hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => {
                  setSelectedSalarie(salarie)
                  setActiveView('detail')
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    {salarie.photoUrl ? (
                      <img
                        src={salarie.photoUrl}
                        alt={`${salarie.prenom} ${salarie.nom}`}
                        className="w-16 h-16 rounded-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none'
                        }}
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                        <User className="text-primary-600" size={32} />
                      </div>
                    )}

                    <div className="flex-1">
                      <h5 className="font-semibold text-gray-900 text-lg mb-1">
                        {salarie.prenom} {salarie.nom}
                      </h5>
                      <p className="text-sm text-gray-600 mb-2">{salarie.poste}</p>
                      {salarie.fonction && (
                        <p className="text-sm text-gray-500 mb-2">{salarie.fonction}</p>
                      )}
                      {salarie.matricule && (
                        <p className="text-xs text-gray-400">Matricule: {salarie.matricule}</p>
                      )}
                    </div>
                  </div>

                  <Link
                    href={`/ouvriers`}
                    onClick={(e) => e.stopPropagation()}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Voir le profil complet"
                  >
                    <Eye size={18} className="text-gray-600" />
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeView === 'detail' && selectedSalarie && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => {
                setActiveView('liste')
                setSelectedSalarie(null)
              }}
              className="btn btn-secondary text-sm flex items-center gap-2"
            >
              ← Retour à la liste
            </button>
            <div className="flex gap-2">
              <button
                onClick={() => setActiveView('evaluations')}
                className="btn btn-primary text-sm flex items-center gap-2"
              >
                <Star size={18} />
                Évaluations ({selectedSalarie.evaluations?.length || 0})
              </button>
              <button
                onClick={() => setActiveView('historique')}
                className="btn btn-secondary text-sm flex items-center gap-2"
              >
                <History size={18} />
                Historique RH ({selectedSalarie.evenementsRH?.length || 0})
              </button>
            </div>
          </div>

          {/* Fiche détaillée du salarié */}
          <div className="card mb-6">
            <div className="flex items-start gap-6 mb-6">
              {selectedSalarie.photoUrl ? (
                <img
                  src={selectedSalarie.photoUrl}
                  alt={`${selectedSalarie.prenom} ${selectedSalarie.nom}`}
                  className="w-24 h-24 rounded-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none'
                  }}
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                  <User className="text-primary-600" size={48} />
                </div>
              )}

              <div className="flex-1">
                <h4 className="text-2xl font-bold text-gray-900 mb-2">
                  {selectedSalarie.prenom} {selectedSalarie.nom}
                </h4>
                <p className="text-lg text-gray-600 mb-1">{selectedSalarie.poste}</p>
                {selectedSalarie.fonction && (
                  <p className="text-sm text-gray-500 mb-2">{selectedSalarie.fonction}</p>
                )}
                {selectedSalarie.matricule && (
                  <p className="text-sm text-gray-500">Matricule: {selectedSalarie.matricule}</p>
                )}
              </div>

              <Link
                href={`/ouvriers`}
                className="btn btn-primary text-sm flex items-center gap-2"
              >
                <Eye size={18} />
                Voir le profil complet
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h5 className="font-semibold text-gray-900 mb-3">Informations personnelles</h5>
                <div className="space-y-2 text-sm">
                  {selectedSalarie.email && (
                    <p><span className="text-gray-600">Email:</span> {selectedSalarie.email}</p>
                  )}
                  {selectedSalarie.telephone && (
                    <p><span className="text-gray-600">Téléphone:</span> {selectedSalarie.telephone}</p>
                  )}
                  {selectedSalarie.dateEmbauche && (
                    <p><span className="text-gray-600">Date d'embauche:</span> {formatDate(selectedSalarie.dateEmbauche)}</p>
                  )}
                </div>
              </div>

              <div>
                <h5 className="font-semibold text-gray-900 mb-3">Statistiques</h5>
                <div className="space-y-2 text-sm">
                  {selectedSalarie.evaluations && selectedSalarie.evaluations.length > 0 && (
                    <p>
                      <span className="text-gray-600">Nombre d'évaluations:</span> {selectedSalarie.evaluations.length}
                    </p>
                  )}
                  {selectedSalarie.evenementsRH && selectedSalarie.evenementsRH.length > 0 && (
                    <p>
                      <span className="text-gray-600">Événements RH:</span> {selectedSalarie.evenementsRH.length}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeView === 'evaluations' && selectedSalarie && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setActiveView('detail')}
              className="btn btn-secondary text-sm"
            >
              ← Retour à la fiche
            </button>
          </div>
          <div className="card">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Évaluations des salariés</h4>
            <p className="text-gray-500 text-center py-8">
              Section des évaluations en cours de développement
            </p>
          </div>
        </div>
      )}

      {activeView === 'historique' && selectedSalarie && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setActiveView('detail')}
              className="btn btn-secondary text-sm"
            >
              ← Retour à la fiche
            </button>
          </div>
          <div className="card">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Historique des événements RH et évaluations</h4>
            <p className="text-gray-500 text-center py-8">
              Section de l'historique RH en cours de développement
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
