'use client'

import { useState } from 'react'
import { User, Phone, Mail, MapPin, Calendar, Briefcase, FileText, Shield, AlertTriangle, CalendarCheck } from 'lucide-react'
import { formatDate, formatDateTime } from '@/lib/utils'
import TabInformationsPersonnelles from './tabs/TabInformationsPersonnelles'
import TabInformationsProfessionnelles from './tabs/TabInformationsProfessionnelles'
import TabDocumentsRH from './tabs/TabDocumentsRH'
import TabCommunication from './tabs/TabCommunication'
import TabCongesFormations from './tabs/TabCongesFormations'

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
  habilitations: any[]
  autorisations: any[]
  visitesMedicales: any[]
  restrictionsMedicales: any[]
  competences: any[]
  user: {
    role: string
  } | null
}

interface DetailOuvrierProps {
  ouvrier: Ouvrier
  canViewSensitive: boolean
}

type TabType = 'personnelles' | 'professionnelles' | 'documents' | 'communication' | 'conges-formations'

export default function DetailOuvrier({ ouvrier, canViewSensitive }: DetailOuvrierProps) {
  const [activeTab, setActiveTab] = useState<TabType>('personnelles')

  const tabs = [
    { id: 'personnelles' as TabType, label: 'Informations personnelles', icon: User },
    { id: 'professionnelles' as TabType, label: 'Informations professionnelles', icon: Briefcase },
    { id: 'documents' as TabType, label: 'Documents RH', icon: FileText },
    { id: 'communication' as TabType, label: 'Communication', icon: Mail },
    { id: 'conges-formations' as TabType, label: 'Congés & Formations', icon: CalendarCheck },
  ]

  return (
    <div>
      {/* En-tête */}
      <div className="card mb-6">
        <div className="flex items-start gap-6">
          {ouvrier.photoUrl ? (
            <img
              src={ouvrier.photoUrl}
              alt={`${ouvrier.prenom} ${ouvrier.nom}`}
              className="w-24 h-24 rounded-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none'
              }}
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-primary-100 flex items-center justify-center">
              <User className="text-primary-600" size={32} />
            </div>
          )}

          <div className="flex-1">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {ouvrier.prenom} {ouvrier.nom}
            </h3>
            <p className="text-lg text-gray-600 mb-1">{ouvrier.poste}</p>
            {ouvrier.fonction && (
              <p className="text-sm text-gray-500">{ouvrier.fonction}</p>
            )}
            {ouvrier.matricule && (
              <p className="text-sm text-gray-500 mt-1">Matricule: {ouvrier.matricule}</p>
            )}

            {/* Alertes */}
            <div className="mt-4 flex flex-wrap gap-2">
              {ouvrier.habilitations.some(h => h.dateExpiration && new Date(h.dateExpiration) < new Date()) && (
                <span className="badge badge-warning text-xs flex items-center gap-1">
                  <AlertTriangle size={12} />
                  Habilitations expirées
                </span>
              )}
              {ouvrier.autorisations.some(a => a.dateExpiration && new Date(a.dateExpiration) < new Date()) && (
                <span className="badge badge-warning text-xs flex items-center gap-1">
                  <AlertTriangle size={12} />
                  Autorisations expirées
                </span>
              )}
              {ouvrier.visitesMedicales[0]?.dateProchaine && new Date(ouvrier.visitesMedicales[0].dateProchaine) < new Date() && (
                <span className="badge badge-danger text-xs flex items-center gap-1">
                  <AlertTriangle size={12} />
                  Visite médicale à renouveler
                </span>
              )}
              {ouvrier.restrictionsMedicales.some(r => r.actif) && (
                <span className="badge badge-warning text-xs flex items-center gap-1">
                  <Shield size={12} />
                  Restrictions médicales
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Onglets */}
      <div className="card">
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-1">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary-600 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon size={18} />
                    <span>{tab.label}</span>
                  </div>
                </button>
              )
            })}
          </nav>
        </div>

        {/* Contenu des onglets */}
        <div>
          {activeTab === 'personnelles' && (
            <TabInformationsPersonnelles ouvrier={ouvrier} />
          )}
          {activeTab === 'professionnelles' && (
            <TabInformationsProfessionnelles ouvrier={ouvrier} canViewSensitive={canViewSensitive} />
          )}
          {activeTab === 'documents' && (
            <TabDocumentsRH ouvrier={ouvrier} />
          )}
          {activeTab === 'communication' && (
            <TabCommunication ouvrier={ouvrier} />
          )}
          {activeTab === 'conges-formations' && (
            <TabCongesFormations salarieId={ouvrier.id} />
          )}
        </div>
      </div>
    </div>
  )
}
