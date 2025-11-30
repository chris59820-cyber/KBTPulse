'use client'

import { useState } from 'react'
import { Users, User, FileText, Star, History, Eye, Edit, Calendar, Briefcase } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'

interface TabGestionPersonnelProps {
  user: any
  salarieRDC: any
  personnelAffecte: any[]
}

export default function TabGestionPersonnel({
  user,
  salarieRDC,
  personnelAffecte
}: TabGestionPersonnelProps) {
  const [selectedSalarie, setSelectedSalarie] = useState<any | null>(null)
  const [activeView, setActiveView] = useState<'liste' | 'detail' | 'evaluations' | 'historique'>('liste')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Gestion du personnel ({personnelAffecte.length})
        </h3>
        <div className="text-sm text-gray-600">
          Liste du personnel affecté au RDC
        </div>
      </div>

      {activeView === 'liste' && (
        <div className="space-y-3">
          {personnelAffecte.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Aucun personnel affecté</p>
          ) : (
            personnelAffecte.map((salarie) => (
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

                      <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
                        {salarie.email && (
                          <span>{salarie.email}</span>
                        )}
                        {salarie.telephone && (
                          <span>{salarie.telephone}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Link
                      href={`/ouvriers`}
                      onClick={(e) => e.stopPropagation()}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Voir le profil"
                    >
                      <Eye size={18} className="text-gray-600" />
                    </Link>
                  </div>
                </div>

                {/* Indicateurs rapides */}
                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-200">
                  {salarie.conges && salarie.conges.length > 0 && (
                    <div className="flex items-center gap-1 text-sm text-yellow-600">
                      <Calendar size={14} />
                      <span>{salarie.conges.length} RTT en attente</span>
                    </div>
                  )}
                  {salarie.evaluations && salarie.evaluations.length > 0 && (
                    <div className="flex items-center gap-1 text-sm text-blue-600">
                      <Star size={14} />
                      <span>{salarie.evaluations.length} évaluations</span>
                    </div>
                  )}
                  {salarie.interventions && salarie.interventions.length > 0 && (
                    <div className="flex items-center gap-1 text-sm text-green-600">
                      <Briefcase size={14} />
                      <span>{salarie.interventions.length} interventions</span>
                    </div>
                  )}
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
                Évaluations
              </button>
              <button
                onClick={() => setActiveView('historique')}
                className="btn btn-secondary text-sm flex items-center gap-2"
              >
                <History size={18} />
                Historique RH
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
                  {selectedSalarie.adresse && (
                    <p><span className="text-gray-600">Adresse:</span> {selectedSalarie.adresse}</p>
                  )}
                  {selectedSalarie.dateNaissance && (
                    <p><span className="text-gray-600">Date de naissance:</span> {formatDate(selectedSalarie.dateNaissance)}</p>
                  )}
                  {selectedSalarie.dateEmbauche && (
                    <p><span className="text-gray-600">Date d'embauche:</span> {formatDate(selectedSalarie.dateEmbauche)}</p>
                  )}
                </div>
              </div>

              <div>
                <h5 className="font-semibold text-gray-900 mb-3">Informations professionnelles</h5>
                <div className="space-y-2 text-sm">
                  {selectedSalarie.typeContrat && (
                    <p><span className="text-gray-600">Type de contrat:</span> {selectedSalarie.typeContrat}</p>
                  )}
                  {selectedSalarie.coefficient !== null && (
                    <p><span className="text-gray-600">Coefficient:</span> {selectedSalarie.coefficient}</p>
                  )}
                  {selectedSalarie.tauxHoraire !== null && (
                    <p><span className="text-gray-600">Taux horaire:</span> {selectedSalarie.tauxHoraire} €</p>
                  )}
                  <p><span className="text-gray-600">Statut:</span> 
                    <span className={`ml-2 badge ${
                      selectedSalarie.statut === 'actif' ? 'badge-success' : 'badge-secondary'
                    }`}>
                      {selectedSalarie.statut}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeView === 'evaluations' && selectedSalarie && (
        <div>
          {/* Section évaluations - sera créée dans un composant séparé */}
          <p className="text-gray-500 text-center py-8">
            Section des évaluations en cours de développement
          </p>
        </div>
      )}

      {activeView === 'historique' && selectedSalarie && (
        <div>
          {/* Section historique RH - sera créée dans un composant séparé */}
          <p className="text-gray-500 text-center py-8">
            Section de l'historique RH en cours de développement
          </p>
        </div>
      )}
    </div>
  )
}
