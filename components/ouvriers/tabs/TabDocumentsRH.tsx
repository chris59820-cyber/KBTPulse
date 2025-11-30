'use client'

import { useState } from 'react'
import { FileText, Calendar, AlertTriangle, CheckCircle, Shield, Plus } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface Ouvrier {
  id: string
  habilitations: {
    id: string
    nom: string
    numero: string | null
    dateObtention: Date
    dateExpiration: Date | null
    organisme: string | null
    fichierUrl: string | null
    actif: boolean
  }[]
  autorisations: {
    id: string
    nom: string
    numero: string | null
    dateObtention: Date
    dateExpiration: Date | null
    organisme: string | null
    fichierUrl: string | null
    actif: boolean
  }[]
  visitesMedicales: {
    id: string
    dateVisite: Date
    dateProchaine: Date | null
    medecin: string | null
    resultat: string | null
    commentaire: string | null
    fichierUrl: string | null
  }[]
  restrictionsMedicales: {
    id: string
    type: string
    description: string
    dateDebut: Date
    dateFin: Date | null
    medecin: string | null
    actif: boolean
  }[]
  photoUrl: string | null
  dateEmbauche: Date
}

interface TabDocumentsRHProps {
  ouvrier: Ouvrier
}

export default function TabDocumentsRH({ ouvrier }: TabDocumentsRHProps) {
  const [activeSection, setActiveSection] = useState<'habilitations' | 'autorisations' | 'visites' | 'restrictions'>('habilitations')

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
        <nav className="flex space-x-1">
          {[
            { id: 'habilitations' as const, label: 'Habilitations', count: ouvrier.habilitations.length },
            { id: 'autorisations' as const, label: 'Autorisations', count: ouvrier.autorisations.length },
            { id: 'visites' as const, label: 'Visites médicales', count: ouvrier.visitesMedicales.length },
            { id: 'restrictions' as const, label: 'Restrictions médicales', count: ouvrier.restrictionsMedicales.length },
          ].map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
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

      {/* Habilitations */}
      {activeSection === 'habilitations' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-gray-900">Habilitations</h4>
            <button className="btn btn-primary text-sm flex items-center gap-2">
              <Plus size={16} />
              Ajouter
            </button>
          </div>
          <div className="space-y-3">
            {ouvrier.habilitations.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Aucune habilitation</p>
            ) : (
              ouvrier.habilitations.map((habilitation) => {
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
                          {!expired && !expiringSoon && (
                            <span className="badge badge-success text-xs">Valide</span>
                          )}
                        </div>
                        {habilitation.numero && (
                          <p className="text-sm text-gray-600 mb-1">N° {habilitation.numero}</p>
                        )}
                        {habilitation.organisme && (
                          <p className="text-sm text-gray-600 mb-1">Organisme: {habilitation.organisme}</p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                          <div className="flex items-center gap-1">
                            <Calendar size={14} />
                            <span>Obtenu le: {formatDate(habilitation.dateObtention)}</span>
                          </div>
                          {habilitation.dateExpiration && (
                            <div className="flex items-center gap-1">
                              <Calendar size={14} />
                              <span>Expire le: {formatDate(habilitation.dateExpiration)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      {habilitation.fichierUrl && (
                        <a
                          href={habilitation.fichierUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-secondary text-sm"
                        >
                          Voir document
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

      {/* Autorisations */}
      {activeSection === 'autorisations' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-gray-900">Autorisations</h4>
            <button className="btn btn-primary text-sm flex items-center gap-2">
              <Plus size={16} />
              Ajouter
            </button>
          </div>
          <div className="space-y-3">
            {ouvrier.autorisations.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Aucune autorisation</p>
            ) : (
              ouvrier.autorisations.map((autorisation) => {
                const expired = isExpired(autorisation.dateExpiration)
                const expiringSoon = isExpiringSoon(autorisation.dateExpiration)
                
                return (
                  <div
                    key={autorisation.id}
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
                          <h5 className="font-semibold text-gray-900">{autorisation.nom}</h5>
                          {expired && (
                            <span className="badge badge-danger text-xs">Expiré</span>
                          )}
                          {expiringSoon && !expired && (
                            <span className="badge badge-warning text-xs">Expire bientôt</span>
                          )}
                          {!expired && !expiringSoon && (
                            <span className="badge badge-success text-xs">Valide</span>
                          )}
                        </div>
                        {autorisation.numero && (
                          <p className="text-sm text-gray-600 mb-1">N° {autorisation.numero}</p>
                        )}
                        {autorisation.organisme && (
                          <p className="text-sm text-gray-600 mb-1">Organisme: {autorisation.organisme}</p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                          <div className="flex items-center gap-1">
                            <Calendar size={14} />
                            <span>Obtenu le: {formatDate(autorisation.dateObtention)}</span>
                          </div>
                          {autorisation.dateExpiration && (
                            <div className="flex items-center gap-1">
                              <Calendar size={14} />
                              <span>Expire le: {formatDate(autorisation.dateExpiration)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      {autorisation.fichierUrl && (
                        <a
                          href={autorisation.fichierUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-secondary text-sm"
                        >
                          Voir document
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

      {/* Visites médicales */}
      {activeSection === 'visites' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-gray-900">Visites médicales</h4>
            <button className="btn btn-primary text-sm flex items-center gap-2">
              <Plus size={16} />
              Ajouter
            </button>
          </div>
          <div className="space-y-3">
            {ouvrier.visitesMedicales.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Aucune visite médicale</p>
            ) : (
              ouvrier.visitesMedicales.map((visite) => {
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
                          {!expired && !expiringSoon && visite.dateProchaine && (
                            <span className="badge badge-success text-xs">À jour</span>
                          )}
                        </div>
                        {visite.medecin && (
                          <p className="text-sm text-gray-600 mb-1">Médecine: {visite.medecin}</p>
                        )}
                        {visite.resultat && (
                          <p className="text-sm text-gray-600 mb-1">
                            Résultat: <span className={`font-medium ${
                              visite.resultat === 'apte' ? 'text-green-600' :
                              visite.resultat === 'inapte' ? 'text-red-600' :
                              'text-yellow-600'
                            }`}>
                              {visite.resultat}
                            </span>
                          </p>
                        )}
                        {visite.commentaire && (
                          <p className="text-sm text-gray-600 mb-1">{visite.commentaire}</p>
                        )}
                        {visite.dateProchaine && (
                          <div className="flex items-center gap-1 text-sm text-gray-600 mt-2">
                            <Calendar size={14} />
                            <span>Prochaine visite: {formatDate(visite.dateProchaine)}</span>
                          </div>
                        )}
                      </div>
                      {visite.fichierUrl && (
                        <a
                          href={visite.fichierUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-secondary text-sm"
                        >
                          Voir certificat
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

      {/* Restrictions médicales */}
      {activeSection === 'restrictions' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-gray-900">Restrictions médicales</h4>
            <button className="btn btn-primary text-sm flex items-center gap-2">
              <Plus size={16} />
              Ajouter
            </button>
          </div>
          <div className="space-y-3">
            {ouvrier.restrictionsMedicales.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Aucune restriction médicale</p>
            ) : (
              ouvrier.restrictionsMedicales.map((restriction) => (
                <div
                  key={restriction.id}
                  className={`p-4 border rounded-lg ${
                    restriction.actif
                      ? 'border-red-200 bg-red-50'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-start gap-2 mb-2">
                    <Shield className="text-gray-400 mt-0.5" size={18} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h5 className="font-semibold text-gray-900">{restriction.type}</h5>
                        {restriction.actif && (
                          <span className="badge badge-danger text-xs">Active</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{restriction.description}</p>
                      {restriction.medecin && (
                        <p className="text-sm text-gray-600 mb-1">Médecin: {restriction.medecin}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                        <div className="flex items-center gap-1">
                          <Calendar size={14} />
                          <span>Début: {formatDate(restriction.dateDebut)}</span>
                        </div>
                        {restriction.dateFin && (
                          <div className="flex items-center gap-1">
                            <Calendar size={14} />
                            <span>Fin: {formatDate(restriction.dateFin)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
