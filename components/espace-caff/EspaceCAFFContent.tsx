'use client'

import { useState } from 'react'
import { Users, Calendar, Shield, TrendingUp, FileText, Settings, Building2, CheckCircle } from 'lucide-react'
import TabGestionPersonnel from './tabs/TabGestionPersonnel'
import TabGestionAdministrative from './tabs/TabGestionAdministrative'
import TabGestionAcces from './tabs/TabGestionAcces'
import TabTableauBord from './tabs/TabTableauBord'

interface EspaceCAFFContentProps {
  user: any
  congesEnAttente: number
  totalSalaries: number
  codesAffaireActifs: number
}

type TabType = 'personnel' | 'administratif' | 'acces' | 'tableau-bord'

export default function EspaceCAFFContent({
  user,
  congesEnAttente,
  totalSalaries,
  codesAffaireActifs
}: EspaceCAFFContentProps) {
  const [activeTab, setActiveTab] = useState<TabType>('tableau-bord')

  const tabs = [
    { id: 'tableau-bord' as TabType, label: 'Tableau de bord', icon: TrendingUp, color: 'blue' },
    { id: 'personnel' as TabType, label: 'Gestion du personnel', icon: Users, color: 'indigo' },
    { id: 'administratif' as TabType, label: 'Gestion administrative', icon: FileText, color: 'orange' },
    { id: 'acces' as TabType, label: 'Gestion des accès', icon: Shield, color: 'red' },
  ]

  const getColorClasses = (color: string, isActive: boolean) => {
    const colorMap: Record<string, { active: string; inactive: string; icon: string }> = {
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
      red: {
        active: 'bg-red-100 border-red-600 text-red-700',
        inactive: 'bg-red-50 border-transparent text-red-600 hover:bg-red-100 hover:border-red-300',
        icon: 'text-red-600'
      },
    }

    const colorClasses = colorMap[color] || colorMap.blue
    return isActive ? colorClasses.active : colorClasses.inactive
  }

  const getIconColorClass = (color: string, isActive: boolean) => {
    const colorMap: Record<string, string> = {
      blue: 'text-blue-600',
      indigo: 'text-indigo-600',
      orange: 'text-orange-600',
      red: 'text-red-600',
    }
    return colorMap[color] || 'text-blue-600'
  }

  return (
    <div>
      {/* En-tête avec statistiques */}
      <div className="card mb-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Espace CAFF</h2>
            <p className="text-gray-600">
              Chargé d'affaires - Accès CAFF uniquement
            </p>
          </div>
          {user.role && (
            <span className={`badge ${
              user.role === 'CAFF' ? 'badge-info' :
              user.role === 'ADMIN' ? 'badge-danger' :
              'badge-secondary'
            }`}>
              {user.role}
            </span>
          )}
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-primary-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total salariés</p>
                <p className="text-2xl font-bold text-gray-900">{totalSalaries}</p>
              </div>
              <Users className="text-primary-600" size={32} />
            </div>
          </div>

          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Congés en attente</p>
                <p className="text-2xl font-bold text-gray-900">{congesEnAttente}</p>
              </div>
              <Calendar className="text-yellow-600" size={32} />
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Codes affaire actifs</p>
                <p className="text-2xl font-bold text-gray-900">{codesAffaireActifs}</p>
              </div>
              <Building2 className="text-green-600" size={32} />
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Actions rapides</p>
                <p className="text-sm font-semibold text-gray-900">Voir les onglets</p>
              </div>
              <Settings className="text-blue-600" size={32} />
            </div>
          </div>
        </div>
      </div>

      {/* Onglets */}
      <div className="card">
        <div className="border-b border-gray-200 mb-6">
          <nav className="grid grid-cols-2 md:grid-cols-4 gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              const colorClasses = getColorClasses(tab.color || 'blue', isActive)
              const iconColorClass = getIconColorClass(tab.color || 'blue', isActive)
              
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
          {activeTab === 'tableau-bord' && (
            <TabTableauBord user={user} />
          )}
          {activeTab === 'personnel' && (
            <TabGestionPersonnel user={user} />
          )}
          {activeTab === 'administratif' && (
            <TabGestionAdministrative user={user} />
          )}
          {activeTab === 'acces' && (
            <TabGestionAcces user={user} />
          )}
        </div>
      </div>
    </div>
  )
}
