'use client'

import { useState } from 'react'
import { FileText, Calendar, AlertTriangle, CheckCircle, Eye, User, GraduationCap, Building2 } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface Salarie {
  habilitations: {
    id: string
    nom: string
    dateExpiration: Date | null
    fichierUrl: string | null
  }[]
  autorisations: {
    id: string
    nom: string
    dateExpiration: Date | null
    fichierUrl: string | null
  }[]
  visitesMedicales: {
    id: string
    dateVisite: Date
    dateProchaine: Date | null
    fichierUrl: string | null
  }[]
  documentsPersonnels: {
    id: string
    type: string
    numero: string | null
    dateExpiration: Date | null
    fichierUrl: string | null
  }[]
  formationsSalarie: {
    id: string
    nom: string
    dateFormation: Date
    dateExpiration: Date | null
    fichierUrl: string | null
  }[]
  accesSitesClients: {
    id: string
    nomSite: string
    dateExpiration: Date | null
    fichierUrl: string | null
  }[]
}

interface TabDocumentsHabilitationsProps {
  salarie: Salarie
}

const typeDocuments: Record<string, string> = {
  carte_identite: 'Carte d\'identité',
  passeport: 'Passeport',
  permis_conduire: 'Permis de conduire',
  carte_grise: 'Carte grise'
}

export default function TabDocumentsHabilitations({ salarie }: TabDocumentsHabilitationsProps) {
  const [activeSection, setActiveSection] = useState<'visites' | 'habilitations' | 'documents' | 'formations' | 'acces'>('visites')

  const isExpired = (dateExpiration: Date | null) => {
    return dateExpiration ? new Date(dateExpiration) < new Date() : false
  }

  const isExpiringSoon = (dateExpiration: Date | null, days: number = 30) => {
    if (!dateExpiration) return false
    const expirationDate = new Date(dateExpiration)
    const today = new Date()
    const diffTime = expirationDate.getTime() - today.getTime()
    const diffDays = diffTime / (1000 * 60 * 60 * 24)
    return diffDays > 0 && diffDays <= days
  }

  return (
    <div className="space-y-6">
      {/* Navigation des sections */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-1 overflow-x-auto">
          {[
            { id: 'visites' as const, label: 'Visites médicales', count: salarie.visitesMedicales.length },
            { id: 'habilitations' as const, label: 'Habilitations', count: salarie.habilitations.length },
            { id: 'documents' as const, label: 'Documents personnels', count: salarie.documentsPersonnels.length },
            { id: 'formations' as const, label: 'Formations', count: salarie.formationsSalarie.length },
            { id: 'acces' as const, label: 'Accès sites clients', count: salarie.accesSitesClients.length },
          ].map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeSection === section.id
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {section.label} ({section.count})
            </button>
          ))}
        </nav>
      </div>

      {/* Visites médicales */}
      {activeSection === 'visites' && (
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Visites médicales</h4>
          <div className="space-y-3">
            {salarie.visitesMedicales.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Aucune visite médicale</p>
            ) : (
              salarie.visitesMedicales.map((visite) => {
                const expired = visite.dateProchaine ? isExpired(visite.dateProchaine) : false
                const expiringSoon = visite.dateProchaine ? isExpiringSoon(visite.dateProchaine) : false
                
                return (
                  <div
                    key={visite.id}
                    className={`p-4 border rounded-lg ${
                      expired ? 'border-red-200 bg-red-50' :
                      expiringSoon ? 'border-yellow-200 bg-yellow-50' :
                      'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar className="text-gray-400" size={18} />
                          <h5 className="font-semibold text-gray-900">
                            Visite médicale du {formatDate(visite.dateVisite)}
                          </h5>
                          {expired && (
                            <span className="badge badge-danger text-xs">À renouveler</span>
                          )}
                          {expiringSoon && !expired && (
                            <span className="badge badge-warning text-xs">À renouveler bientôt</span>
                          )}
                        </div>
                        {visite.dateProchaine && (
                          <p className="text-sm text-gray-600 mb-2">
                            Prochaine visite: {formatDate(visite.dateProchaine)}
                          </p>
                        )}
                      </div>
                      {visite.fichierUrl && (
                        <a
                          href={visite.fichierUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-secondary text-sm flex items-center gap-2"
                        >
                          <Eye size={14} />
                          Voir le document
                        </a>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}

      {/* Habilitations */}
      {activeSection === 'habilitations' && (
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Habilitations</h4>
          <div className="space-y-3">
            {salarie.habilitations.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Aucune habilitation</p>
            ) : (
              salarie.habilitations.map((habilitation) => {
                const expired = isExpired(habilitation.dateExpiration)
                const expiringSoon = isExpiringSoon(habilitation.dateExpiration)
                
                return (
                  <div
                    key={habilitation.id}
                    className={`p-4 border rounded-lg ${
                      expired ? 'border-red-200 bg-red-50' :
                      expiringSoon ? 'border-yellow-200 bg-yellow-50' :
                      'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="text-gray-400" size={18} />
                          <h5 className="font-semibold text-gray-900">{habilitation.nom}</h5>
                          {expired && (
                            <span className="badge badge-danger text-xs">Expiré</span>
                          )}
                          {expiringSoon && !expired && (
                            <span className="badge badge-warning text-xs">Expire bientôt</span>
                          )}
                          {!expired && !expiringSoon && habilitation.dateExpiration && (
                            <span className="badge badge-success text-xs">Valide</span>
                          )}
                        </div>
                        {habilitation.dateExpiration && (
                          <p className="text-sm text-gray-600">
                            Date de fin de validité: {formatDate(habilitation.dateExpiration)}
                          </p>
                        )}
                      </div>
                      {habilitation.fichierUrl && (
                        <a
                          href={habilitation.fichierUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-secondary text-sm flex items-center gap-2"
                        >
                          <Eye size={14} />
                          Voir le document
                        </a>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}

      {/* Documents personnels */}
      {activeSection === 'documents' && (
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Documents personnels</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {salarie.documentsPersonnels.length === 0 ? (
              <p className="text-gray-500 text-center py-8 col-span-full">Aucun document personnel</p>
            ) : (
              salarie.documentsPersonnels.map((document) => {
                const expired = isExpired(document.dateExpiration)
                const expiringSoon = isExpiringSoon(document.dateExpiration)
                
                return (
                  <div
                    key={document.id}
                    className={`p-4 border rounded-lg ${
                      expired ? 'border-red-200 bg-red-50' :
                      expiringSoon ? 'border-yellow-200 bg-yellow-50' :
                      'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="text-gray-400" size={18} />
                          <h5 className="font-semibold text-gray-900">
                            {typeDocuments[document.type] || document.type}
                          </h5>
                          {expired && document.dateExpiration && (
                            <span className="badge badge-danger text-xs">Expiré</span>
                          )}
                          {expiringSoon && !expired && (
                            <span className="badge badge-warning text-xs">Expire bientôt</span>
                          )}
                        </div>
                        {document.numero && (
                          <p className="text-sm text-gray-600 mb-1">N° {document.numero}</p>
                        )}
                        {document.dateExpiration && (
                          <p className="text-sm text-gray-600">
                            Expire le: {formatDate(document.dateExpiration)}
                          </p>
                        )}
                      </div>
                      {document.fichierUrl && (
                        <a
                          href={document.fichierUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-secondary text-sm flex items-center gap-2"
                        >
                          <Eye size={14} />
                          Voir
                        </a>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}

      {/* Formations */}
      {activeSection === 'formations' && (
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Formations</h4>
          <div className="space-y-3">
            {salarie.formationsSalarie.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Aucune formation</p>
            ) : (
              salarie.formationsSalarie.map((formation) => {
                const expired = isExpired(formation.dateExpiration)
                const expiringSoon = isExpiringSoon(formation.dateExpiration)
                
                return (
                  <div
                    key={formation.id}
                    className={`p-4 border rounded-lg ${
                      expired ? 'border-red-200 bg-red-50' :
                      expiringSoon ? 'border-yellow-200 bg-yellow-50' :
                      'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <GraduationCap className="text-gray-400" size={18} />
                          <h5 className="font-semibold text-gray-900">{formation.nom}</h5>
                          {expired && (
                            <span className="badge badge-danger text-xs">Expiré</span>
                          )}
                          {expiringSoon && !expired && (
                            <span className="badge badge-warning text-xs">Expire bientôt</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-1">
                          Formation le: {formatDate(formation.dateFormation)}
                        </p>
                        {formation.dateExpiration && (
                          <p className="text-sm text-gray-600">
                            Date de fin de validité: {formatDate(formation.dateExpiration)}
                          </p>
                        )}
                      </div>
                      {formation.fichierUrl && (
                        <a
                          href={formation.fichierUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-secondary text-sm flex items-center gap-2"
                        >
                          <Eye size={14} />
                          Voir le document
                        </a>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}

      {/* Accès sites clients */}
      {activeSection === 'acces' && (
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Accès sites clients</h4>
          <div className="space-y-3">
            {salarie.accesSitesClients.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Aucun accès site client</p>
            ) : (
              salarie.accesSitesClients.map((acces) => {
                const expired = isExpired(acces.dateExpiration)
                const expiringSoon = isExpiringSoon(acces.dateExpiration)
                
                return (
                  <div
                    key={acces.id}
                    className={`p-4 border rounded-lg ${
                      expired ? 'border-red-200 bg-red-50' :
                      expiringSoon ? 'border-yellow-200 bg-yellow-50' :
                      'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Building2 className="text-gray-400" size={18} />
                          <h5 className="font-semibold text-gray-900">{acces.nomSite}</h5>
                          {expired && (
                            <span className="badge badge-danger text-xs">Expiré</span>
                          )}
                          {expiringSoon && !expired && (
                            <span className="badge badge-warning text-xs">Expire bientôt</span>
                          )}
                        </div>
                        {acces.dateExpiration && (
                          <p className="text-sm text-gray-600">
                            Date de fin de validité: {formatDate(acces.dateExpiration)}
                          </p>
                        )}
                      </div>
                      {acces.fichierUrl && (
                        <a
                          href={acces.fichierUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-secondary text-sm flex items-center gap-2"
                        >
                          <Eye size={14} />
                          Voir le document
                        </a>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
