'use client'

import { useState } from 'react'
import { User, ChevronRight, Phone, Mail, MapPin, Calendar, Briefcase, FileText } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import DetailOuvrier from './DetailOuvrier'

interface Habilitation {
  id: string
  nom: string
  dateExpiration: Date | null
  actif: boolean
}

interface Autorisation {
  id: string
  nom: string
  dateExpiration: Date | null
  actif: boolean
}

interface VisiteMedicale {
  id: string
  dateVisite: Date
  dateProchaine: Date | null
  resultat: string | null
}

interface RestrictionMedicale {
  id: string
  type: string
  description: string
  actif: boolean
}

interface Competence {
  id: string
  nom: string
  niveau: string | null
}

interface Ouvrier {
  id: string
  nom: string
  prenom: string
  email: string | null
  telephone: string | null
  adresse: string | null
  dateNaissance: Date | null
  photoUrl: string | null
  poste: string
  fonction: string | null
  metier: string | null
  coefficient: number | null
  tauxHoraire: number | null
  matricule: string | null
  dateEmbauche: Date
  habilitations: Habilitation[]
  autorisations: Autorisation[]
  visitesMedicales: VisiteMedicale[]
  restrictionsMedicales: RestrictionMedicale[]
  competences: Competence[]
  user: {
    role: string
  } | null
}

interface ListeOuvriersProps {
  ouvriers: Ouvrier[]
  canViewSensitive: boolean
}

export default function ListeOuvriers({ ouvriers, canViewSensitive }: ListeOuvriersProps) {
  const [selectedOuvrier, setSelectedOuvrier] = useState<Ouvrier | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredOuvriers = ouvriers.filter(ouvrier =>
    `${ouvrier.prenom} ${ouvrier.nom}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ouvrier.matricule?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ouvrier.poste?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (selectedOuvrier) {
    return (
      <div>
        <button
          onClick={() => setSelectedOuvrier(null)}
          className="mb-4 text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
        >
          ← Retour à la liste
        </button>
        <DetailOuvrier ouvrier={selectedOuvrier} canViewSensitive={canViewSensitive} />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Liste des ouvriers ({filteredOuvriers.length})
        </h3>
        <input
          type="text"
          placeholder="Rechercher un ouvrier..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input w-64"
        />
      </div>

      <div className="space-y-3">
        {filteredOuvriers.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Aucun ouvrier trouvé</p>
        ) : (
          filteredOuvriers.map((ouvrier) => {
            const habilitationsExpirees = ouvrier.habilitations.filter(h =>
              h.dateExpiration && new Date(h.dateExpiration) < new Date()
            ).length

            const autorisationsExpirees = ouvrier.autorisations.filter(a =>
              a.dateExpiration && new Date(a.dateExpiration) < new Date()
            ).length

            const derniereVisite = ouvrier.visitesMedicales[0]
            const visiteExpiree = derniereVisite?.dateProchaine && new Date(derniereVisite.dateProchaine) < new Date()

            return (
              <div
                key={ouvrier.id}
                onClick={() => setSelectedOuvrier(ouvrier)}
                className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-start gap-4">
                  {ouvrier.photoUrl ? (
                    <img
                      src={ouvrier.photoUrl}
                      alt={`${ouvrier.prenom} ${ouvrier.nom}`}
                      className="w-16 h-16 rounded-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none'
                      }}
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                      <User className="text-primary-600" size={24} />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {ouvrier.prenom} {ouvrier.nom}
                        </h4>
                        {ouvrier.matricule && (
                          <p className="text-sm text-gray-500">Matricule: {ouvrier.matricule}</p>
                        )}
                      </div>
                      {(habilitationsExpirees > 0 || autorisationsExpirees > 0 || visiteExpiree) && (
                        <span className="badge badge-danger text-xs flex-shrink-0">
                          Alertes
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Briefcase size={14} />
                        <span>{ouvrier.poste}</span>
                        {ouvrier.fonction && <span className="text-gray-400">• {ouvrier.fonction}</span>}
                      </div>
                      
                      {ouvrier.email && (
                        <div className="flex items-center gap-1">
                          <Mail size={14} />
                          <span className="truncate">{ouvrier.email}</span>
                        </div>
                      )}
                      
                      {ouvrier.telephone && (
                        <div className="flex items-center gap-1">
                          <Phone size={14} />
                          <span>{ouvrier.telephone}</span>
                        </div>
                      )}
                      
                      {ouvrier.adresse && (
                        <div className="flex items-center gap-1">
                          <MapPin size={14} />
                          <span className="truncate">{ouvrier.adresse}</span>
                        </div>
                      )}
                      
                      {ouvrier.dateNaissance && (
                        <div className="flex items-center gap-1">
                          <Calendar size={14} />
                          <span>Né(e) le {formatDate(ouvrier.dateNaissance)}</span>
                        </div>
                      )}

                      {ouvrier.competences.length > 0 && (
                        <div className="flex items-center gap-1">
                          <FileText size={14} />
                          <span>{ouvrier.competences.length} compétence(s)</span>
                        </div>
                      )}
                    </div>

                    {/* Alertes */}
                    {(habilitationsExpirees > 0 || autorisationsExpirees > 0 || visiteExpiree) && (
                      <div className="mt-2 flex flex-wrap gap-2 text-xs">
                        {habilitationsExpirees > 0 && (
                          <span className="badge badge-warning">
                            {habilitationsExpirees} habilitation(s) expirée(s)
                          </span>
                        )}
                        {autorisationsExpirees > 0 && (
                          <span className="badge badge-warning">
                            {autorisationsExpirees} autorisation(s) expirée(s)
                          </span>
                        )}
                        {visiteExpiree && (
                          <span className="badge badge-danger">
                            Visite médicale à renouveler
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <ChevronRight className="text-gray-400 flex-shrink-0" size={20} />
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
