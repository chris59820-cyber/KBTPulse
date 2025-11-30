'use client'

import { useState } from 'react'
import { GraduationCap, Clock, Users, Briefcase, FileText, Package, Truck, Calendar, MessageCircle, Newspaper, MapPin, Image, History, Download, Building2 } from 'lucide-react'
import TabGestionFormations from './tabs/TabGestionFormations'
import TabGestionPointages from './tabs/TabGestionPointages'
import TabGestionPersonnel from './tabs/TabGestionPersonnel'
import TabGestionInterventions from './tabs/TabGestionInterventions'
import TabDocumentsIntervention from './tabs/TabDocumentsIntervention'
import TabGestionMateriel from './tabs/TabGestionMateriel'
import TabGestionVehicules from './tabs/TabGestionVehicules'
import TabPlanning from './tabs/TabPlanning'
import TabCommunication from './tabs/TabCommunication'
import TabGestionActualites from './tabs/TabGestionActualites'
import TabOutilsComplementaires from './tabs/TabOutilsComplementaires'
import TabGestionClientsDonneursOrdre from './tabs/TabGestionClientsDonneursOrdre'

interface EspaceStaffContentProps {
  user: any
}

type TabType = 'formations' | 'pointages' | 'personnel' | 'interventions' | 'documents' | 
               'materiel' | 'vehicules' | 'planning' | 'communication' | 'actualites' | 'outils' | 'clients-donneurs-ordre'

export default function EspaceStaffContent({ user }: EspaceStaffContentProps) {
  const [activeTab, setActiveTab] = useState<TabType>('formations')

  const tabs = [
    { id: 'formations' as TabType, label: 'Gestion des formations', icon: GraduationCap, color: 'purple' },
    { id: 'pointages' as TabType, label: 'Gestion des pointages', icon: Clock, color: 'blue' },
    { id: 'personnel' as TabType, label: 'Gestion du personnel', icon: Users, color: 'indigo' },
    { id: 'interventions' as TabType, label: 'Gestion des interventions', icon: Briefcase, color: 'orange' },
    { id: 'documents' as TabType, label: 'Documents d\'intervention', icon: FileText, color: 'gray' },
    { id: 'materiel' as TabType, label: 'Gestion du matériel', icon: Package, color: 'amber' },
    { id: 'vehicules' as TabType, label: 'Gestion des véhicules', icon: Truck, color: 'red' },
    { id: 'planning' as TabType, label: 'Planning', icon: Calendar, color: 'green' },
    { id: 'communication' as TabType, label: 'Communication', icon: MessageCircle, color: 'cyan' },
    { id: 'actualites' as TabType, label: 'Gestion des actualités', icon: Newspaper, color: 'pink' },
    { id: 'outils' as TabType, label: 'Outils complémentaires', icon: MapPin, color: 'teal' },
    { id: 'clients-donneurs-ordre' as TabType, label: 'Clients & Donneurs d\'ordre', icon: Building2, color: 'cyan' },
  ]

  const getColorClasses = (color: string, isActive: boolean) => {
    const colorMap: Record<string, { active: string; inactive: string; icon: string }> = {
      purple: {
        active: 'bg-purple-100 border-purple-600 text-purple-700',
        inactive: 'bg-purple-50 border-transparent text-purple-600 hover:bg-purple-100 hover:border-purple-300',
        icon: 'text-purple-600'
      },
      blue: {
        active: 'bg-blue-100 border-blue-600 text-blue-700',
        inactive: 'bg-blue-50 border-transparent text-blue-600 hover:bg-blue-100 hover:border-blue-300',
        icon: 'text-blue-600'
      },
      indigo: {
        active: 'bg-indigo-100 border-indigo-600 text-indigo-700',
        inactive: 'bg-indigo-50 border-transparent text-indigo-600 hover:bg-indigo-100 hover:border-indigo-300',
        icon: 'text-indigo-600'
      },
      orange: {
        active: 'bg-orange-100 border-orange-600 text-orange-700',
        inactive: 'bg-orange-50 border-transparent text-orange-600 hover:bg-orange-100 hover:border-orange-300',
        icon: 'text-orange-600'
      },
      gray: {
        active: 'bg-gray-100 border-gray-600 text-gray-700',
        inactive: 'bg-gray-50 border-transparent text-gray-600 hover:bg-gray-100 hover:border-gray-300',
        icon: 'text-gray-600'
      },
      amber: {
        active: 'bg-amber-100 border-amber-600 text-amber-700',
        inactive: 'bg-amber-50 border-transparent text-amber-600 hover:bg-amber-100 hover:border-amber-300',
        icon: 'text-amber-600'
      },
      red: {
        active: 'bg-red-100 border-red-600 text-red-700',
        inactive: 'bg-red-50 border-transparent text-red-600 hover:bg-red-100 hover:border-red-300',
        icon: 'text-red-600'
      },
      green: {
        active: 'bg-green-100 border-green-600 text-green-700',
        inactive: 'bg-green-50 border-transparent text-green-600 hover:bg-green-100 hover:border-green-300',
        icon: 'text-green-600'
      },
      cyan: {
        active: 'bg-cyan-100 border-cyan-600 text-cyan-700',
        inactive: 'bg-cyan-50 border-transparent text-cyan-600 hover:bg-cyan-100 hover:border-cyan-300',
        icon: 'text-cyan-600'
      },
      pink: {
        active: 'bg-pink-100 border-pink-600 text-pink-700',
        inactive: 'bg-pink-50 border-transparent text-pink-600 hover:bg-pink-100 hover:border-pink-300',
        icon: 'text-pink-600'
      },
      teal: {
        active: 'bg-teal-100 border-teal-600 text-teal-700',
        inactive: 'bg-teal-50 border-transparent text-teal-600 hover:bg-teal-100 hover:border-teal-300',
        icon: 'text-teal-600'
      },
    }

    const colorClasses = colorMap[color] || colorMap.gray
    return isActive ? colorClasses.active : colorClasses.inactive
  }

  const getIconColorClass = (color: string, isActive: boolean) => {
    const colorMap: Record<string, string> = {
      purple: 'text-purple-600',
      blue: 'text-blue-600',
      indigo: 'text-indigo-600',
      orange: 'text-orange-600',
      gray: 'text-gray-600',
      amber: 'text-amber-600',
      red: 'text-red-600',
      green: 'text-green-600',
      cyan: 'text-cyan-600',
      pink: 'text-pink-600',
      teal: 'text-teal-600',
    }
    return colorMap[color] || 'text-gray-600'
  }

  return (
    <div>
      {/* En-tête */}
      <div className="card mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Espace Staff</h2>
            <p className="text-gray-600">
              Accès réservé aux profils PREPA, CE, RDC, CAFF
            </p>
          </div>
          {user.role && (
            <span className={`badge ${
              user.role === 'ADMIN' ? 'badge-danger' :
              user.role === 'CAFF' ? 'badge-info' :
              user.role === 'RDC' ? 'badge-warning' :
              user.role === 'PREPA' ? 'badge-success' :
              'badge-secondary'
            }`}>
              {user.role}
            </span>
          )}
        </div>
      </div>

      {/* Onglets */}
      <div className="card">
        <div className="border-b border-gray-200 mb-6">
          <nav className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-1 pb-2">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              const colorClasses = getColorClasses(tab.color || 'gray', isActive)
              const iconColorClass = getIconColorClass(tab.color || 'gray', isActive)
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-3 text-sm font-medium border-b-2 transition-all rounded-t-lg ${colorClasses}`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Icon size={18} className={iconColorClass} />
                    <span className="text-center">{tab.label}</span>
                  </div>
                </button>
              )
            })}
          </nav>
        </div>

        {/* Contenu des onglets */}
        <div>
          {activeTab === 'formations' && (
            <TabGestionFormations user={user} />
          )}
          {activeTab === 'pointages' && (
            <TabGestionPointages user={user} />
          )}
          {activeTab === 'personnel' && (
            <TabGestionPersonnel user={user} />
          )}
          {activeTab === 'interventions' && (
            <TabGestionInterventions user={user} />
          )}
          {activeTab === 'documents' && (
            <TabDocumentsIntervention user={user} />
          )}
          {activeTab === 'materiel' && (
            <TabGestionMateriel user={user} />
          )}
          {activeTab === 'vehicules' && (
            <TabGestionVehicules user={user} />
          )}
          {activeTab === 'planning' && (
            <TabPlanning user={user} />
          )}
          {activeTab === 'communication' && (
            <TabCommunication user={user} />
          )}
          {activeTab === 'actualites' && (
            <TabGestionActualites user={user} />
          )}
          {activeTab === 'outils' && (
            <TabOutilsComplementaires user={user} />
          )}
          {activeTab === 'clients-donneurs-ordre' && (
            <TabGestionClientsDonneursOrdre user={user} />
          )}
        </div>
      </div>
    </div>
  )
}
