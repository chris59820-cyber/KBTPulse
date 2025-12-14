'use client'

import { useState } from 'react'
import { Users, User, Phone, Mail, BadgeCheck, UserPlus, X, Save } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import ModalGestionAffectations from './ModalGestionAffectations'

interface Intervention {
  id: string
  responsable: {
    id: string
    nom: string
    prenom: string
    email: string | null
    telephone: string | null
  } | null
  rdc: {
    id: string
    nom: string
    prenom: string
    email: string | null
    telephone: string | null
    poste: string | null
  } | null
  donneurOrdreNom: string | null
  donneurOrdreTelephone: string | null
  donneurOrdreEmail: string | null
  affectationsIntervention: {
    id: string
    salarie: {
      id: string
      nom: string
      prenom: string
      email: string | null
      telephone: string | null
      photoUrl: string | null
    }
    role: string
    dateDebut: Date
    dateFin: Date | null
    actif: boolean
  }[]
}

interface TabEquipeResponsabilitesProps {
  intervention: Intervention
  user: any
}

const rolesLabels: Record<string, string> = {
  chef_equipe: 'Chef d\'équipe',
  ouvrier: 'Ouvrier'
}

export default function TabEquipeResponsabilites({ intervention, user }: TabEquipeResponsabilitesProps) {
  const [showModal, setShowModal] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  
  const canManageAffectations = ['PREPA', 'CE', 'RDC', 'CAFF', 'ADMIN'].includes(user.role)
  const chefsEquipe = intervention.affectationsIntervention.filter(a => a.role === 'chef_equipe')
  const ouvriers = intervention.affectationsIntervention.filter(a => a.role === 'ouvrier')

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1)
    window.location.reload()
  }

  return (
    <div className="space-y-6">
      {/* Responsables */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Responsables de l'intervention</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {intervention.responsable && (
            <div className="card">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <User className="text-primary-600" size={20} />
                </div>
                <div>
                  <h5 className="font-semibold text-gray-900">
                    {intervention.responsable.prenom} {intervention.responsable.nom}
                  </h5>
                  <p className="text-sm text-gray-500">Responsable</p>
                </div>
              </div>
              {intervention.responsable.email && (
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                  <Mail size={14} />
                  <span>{intervention.responsable.email}</span>
                </div>
              )}
              {intervention.responsable.telephone && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone size={14} />
                  <span>{intervention.responsable.telephone}</span>
                </div>
              )}
            </div>
          )}

          {intervention.rdc && (
            <div className="card">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <User className="text-green-600" size={20} />
                </div>
                <div>
                  <h5 className="font-semibold text-gray-900">
                    {intervention.rdc.prenom} {intervention.rdc.nom}
                  </h5>
                  <p className="text-sm text-gray-500">RDC responsable</p>
                  {intervention.rdc.poste && (
                    <p className="text-xs text-gray-400 mt-1">{intervention.rdc.poste}</p>
                  )}
                </div>
              </div>
              {intervention.rdc.email && (
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                  <Mail size={14} />
                  <span>{intervention.rdc.email}</span>
                </div>
              )}
              {intervention.rdc.telephone && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone size={14} />
                  <span>{intervention.rdc.telephone}</span>
                </div>
              )}
            </div>
          )}

          {intervention.donneurOrdreNom && (
            <div className="card">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <User className="text-primary-600" size={20} />
                </div>
                <div>
                  <h5 className="font-semibold text-gray-900">{intervention.donneurOrdreNom}</h5>
                  <p className="text-sm text-gray-500">Donneur d'ordre</p>
                </div>
              </div>
              {intervention.donneurOrdreEmail && (
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                  <Mail size={14} />
                  <span>{intervention.donneurOrdreEmail}</span>
                </div>
              )}
              {intervention.donneurOrdreTelephone && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone size={14} />
                  <span>{intervention.donneurOrdreTelephone}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Équipe affectée */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Personnes affectées</h3>
          {canManageAffectations && (
            <button
              onClick={() => setShowModal(true)}
              className="btn btn-primary flex items-center gap-2 text-sm"
            >
              <UserPlus size={16} />
              Gérer les affectations
            </button>
          )}
        </div>

        {/* Chefs d'équipe */}
        {chefsEquipe.length > 0 && (
          <div className="mb-6">
            <h4 className="text-base font-semibold text-gray-900 mb-3">Chefs d'équipe ({chefsEquipe.length})</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {chefsEquipe.map((affectation) => (
                <div key={affectation.id} className="card border-l-4 border-l-primary-600">
                  <div className="flex items-start gap-3">
                    {affectation.salarie.photoUrl ? (
                      <img
                        src={affectation.salarie.photoUrl}
                        alt={`${affectation.salarie.prenom} ${affectation.salarie.nom}`}
                        className="w-12 h-12 rounded-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none'
                        }}
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                        <User className="text-primary-600" size={20} />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h5 className="font-semibold text-gray-900">
                          {affectation.salarie.prenom} {affectation.salarie.nom}
                        </h5>
                        <BadgeCheck className="text-primary-600" size={16} />
                      </div>
                      <span className="badge badge-primary text-xs mb-2">
                        {rolesLabels[affectation.role] || affectation.role}
                      </span>
                      {affectation.salarie.email && (
                        <p className="text-xs text-gray-500 truncate">{affectation.salarie.email}</p>
                      )}
                      {affectation.salarie.telephone && (
                        <p className="text-xs text-gray-500">{affectation.salarie.telephone}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Ouvriers */}
        {ouvriers.length > 0 && (
          <div>
            <h4 className="text-base font-semibold text-gray-900 mb-3">Ouvriers ({ouvriers.length})</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ouvriers.map((affectation) => (
                <div key={affectation.id} className="card">
                  <div className="flex items-start gap-3">
                    {affectation.salarie.photoUrl ? (
                      <img
                        src={affectation.salarie.photoUrl}
                        alt={`${affectation.salarie.prenom} ${affectation.salarie.nom}`}
                        className="w-12 h-12 rounded-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none'
                        }}
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <User className="text-gray-400" size={20} />
                      </div>
                    )}
                    <div className="flex-1">
                      <h5 className="font-semibold text-gray-900 mb-1">
                        {affectation.salarie.prenom} {affectation.salarie.nom}
                      </h5>
                      <span className="badge badge-secondary text-xs mb-2">
                        {rolesLabels[affectation.role] || affectation.role}
                      </span>
                      {affectation.salarie.email && (
                        <p className="text-xs text-gray-500 truncate">{affectation.salarie.email}</p>
                      )}
                      {affectation.salarie.telephone && (
                        <p className="text-xs text-gray-500">{affectation.salarie.telephone}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {intervention.affectationsIntervention.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">Aucune personne affectée</p>
            {canManageAffectations && (
              <button
                onClick={() => setShowModal(true)}
                className="btn btn-primary flex items-center gap-2 mx-auto"
              >
                <UserPlus size={16} />
                Ajouter des personnes
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modal de gestion des affectations */}
      {showModal && (
        <ModalGestionAffectations
          interventionId={intervention.id}
          affectations={intervention.affectationsIntervention}
          onClose={() => setShowModal(false)}
          onSave={handleRefresh}
        />
      )}
    </div>
  )
}
