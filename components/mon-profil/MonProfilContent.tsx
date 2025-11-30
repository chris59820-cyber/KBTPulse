'use client'

import { useState } from 'react'
import { User, Calendar, Phone, Mail, MapPin, Briefcase, Hash, Camera } from 'lucide-react'
import { formatDate, formatCurrency } from '@/lib/utils'
import TabInformationsPersonnellesPro from './tabs/TabInformationsPersonnellesPro'
import TabGestionConges from './tabs/TabGestionConges'
import TabContactUrgence from './tabs/TabContactUrgence'
import TabHorairesTempsTravail from './tabs/TabHorairesTempsTravail'
import TabAffectations from './tabs/TabAffectations'
import TabMaterielFourni from './tabs/TabMaterielFourni'
import TabEnginsConfies from './tabs/TabEnginsConfies'
import TabMaterielAttribue from './tabs/TabMaterielAttribue'
import TabDocumentsHabilitations from './tabs/TabDocumentsHabilitations'
import TabMessagerie from './tabs/TabMessagerie'

interface Salarie {
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
  coefficient: number | null
  matricule: string | null
  dateEmbauche: Date
  typeContrat: string | null
  tauxHoraire: number | null
  deplacement: number | null
  horaires: any[]
  affectations: any[]
  conges: any[]
  contactsUrgence: any[]
  materielFourni: any[]
  enginsConfies: any[]
  materielAttribue: any[]
  habilitations: any[]
  autorisations: any[]
  visitesMedicales: any[]
  documentsPersonnels: any[]
  formationsSalarie: any[]
  accesSitesClients: any[]
  pointages: any[]
  user: {
    role: string
  } | null
}

interface MonProfilContentProps {
  salarie: Salarie
  user: any
  deplacementKM: number | null
}

type TabType = 'informations' | 'conges' | 'contacts' | 'horaires' | 'affectations' | 
               'materiel_fourni' | 'engins' | 'materiel_attribue' | 'documents' | 'messagerie'

export default function MonProfilContent({ salarie, user, deplacementKM }: MonProfilContentProps) {
  const [activeTab, setActiveTab] = useState<TabType>('informations')

  const tabs = [
    { id: 'informations' as TabType, label: 'Informations', icon: User },
    { id: 'conges' as TabType, label: 'Gestion des congés', icon: Calendar },
    { id: 'contacts' as TabType, label: 'Contact d\'urgence', icon: Phone },
    { id: 'horaires' as TabType, label: 'Horaires & Temps de travail', icon: Calendar },
    { id: 'affectations' as TabType, label: 'Affectations', icon: Briefcase },
    { id: 'materiel_fourni' as TabType, label: 'Matériel fourni', icon: Briefcase },
    { id: 'engins' as TabType, label: 'Engins confiés', icon: Briefcase },
    { id: 'materiel_attribue' as TabType, label: 'Matériel attribué', icon: Briefcase },
    { id: 'documents' as TabType, label: 'Documents & Habilitations', icon: User },
    { id: 'messagerie' as TabType, label: 'Messagerie', icon: Mail },
  ]

  return (
    <div>
      {/* En-tête */}
      <div className="card mb-6">
        <div className="flex items-start gap-6">
          {salarie.photoUrl ? (
            <img
              src={salarie.photoUrl}
              alt={`${salarie.prenom} ${salarie.nom}`}
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
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {salarie.prenom} {salarie.nom}
            </h2>
            <p className="text-lg text-gray-600 mb-1">{salarie.poste}</p>
            {salarie.fonction && (
              <p className="text-sm text-gray-500">{salarie.fonction}</p>
            )}
            {salarie.matricule && (
              <p className="text-sm text-gray-500 mt-1">Matricule: {salarie.matricule}</p>
            )}
          </div>

          <div className="text-right">
            {user.role && (
              <span className={`badge ${
                user.role === 'ADMIN' ? 'badge-danger' :
                user.role === 'CAFF' ? 'badge-info' :
                user.role === 'RDC' ? 'badge-warning' :
                'badge-success'
              }`}>
                {user.role}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Onglets */}
      <div className="card">
        <div className="border-b border-gray-200 mb-6 pb-2">
          <nav className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors rounded-t-lg ${
                    isActive
                      ? 'border-primary-600 text-primary-600 bg-primary-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2 justify-center">
                    <Icon size={18} />
                    <span className="truncate">{tab.label}</span>
                  </div>
                </button>
              )
            })}
          </nav>
        </div>

        {/* Contenu des onglets */}
        <div>
          {activeTab === 'informations' && (
            <TabInformationsPersonnellesPro salarie={salarie} deplacementKM={deplacementKM} />
          )}
          {activeTab === 'conges' && (
            <TabGestionConges salarie={salarie} />
          )}
          {activeTab === 'contacts' && (
            <TabContactUrgence salarie={salarie} />
          )}
          {activeTab === 'horaires' && (
            <TabHorairesTempsTravail salarie={salarie} />
          )}
          {activeTab === 'affectations' && (
            <TabAffectations salarie={salarie} />
          )}
          {activeTab === 'materiel_fourni' && (
            <TabMaterielFourni salarie={salarie} />
          )}
          {activeTab === 'engins' && (
            <TabEnginsConfies salarie={salarie} />
          )}
          {activeTab === 'materiel_attribue' && (
            <TabMaterielAttribue salarie={salarie} />
          )}
          {activeTab === 'documents' && (
            <TabDocumentsHabilitations salarie={salarie} />
          )}
          {activeTab === 'messagerie' && (
            <TabMessagerie salarie={salarie} userId={user.id} />
          )}
        </div>
      </div>
    </div>
  )
}
