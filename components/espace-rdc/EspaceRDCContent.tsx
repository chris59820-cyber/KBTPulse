'use client'

import { useState } from 'react'
import { Users, Calendar, TrendingUp, FileText, CheckCircle, Download } from 'lucide-react'
import TabGestionPersonnel from './tabs/TabGestionPersonnel'
import TabGestionConges from './tabs/TabGestionConges'
import TabTableauBord from './tabs/TabTableauBord'

interface EspaceRDCContentProps {
  user: any
  salarieRDC: any
  personnelAffecte: any[]
  interventionsEnCours: number
  affectationsAujourdhui: number
  congesRTTEnAttente: number
}

type TabType = 'personnel' | 'conges' | 'tableau-bord'

export default function EspaceRDCContent({
  user,
  salarieRDC,
  personnelAffecte,
  interventionsEnCours,
  affectationsAujourdhui,
  congesRTTEnAttente
}: EspaceRDCContentProps) {
  const [activeTab, setActiveTab] = useState<TabType>('tableau-bord')

  const tabs = [
    { id: 'tableau-bord' as TabType, label: 'Tableau de bord', icon: TrendingUp, color: 'blue' },
    { id: 'personnel' as TabType, label: 'Gestion du personnel', icon: Users, color: 'indigo' },
    { id: 'conges' as TabType, label: 'Gestion des congés', icon: Calendar, color: 'orange' },
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
    }

    const colorClasses = colorMap[color] || colorMap.blue
    return isActive ? colorClasses.active : colorClasses.inactive
  }

  const getIconColorClass = (color: string, isActive: boolean) => {
    const colorMap: Record<string, string> = {
      blue: 'text-blue-600',
      indigo: 'text-indigo-600',
      orange: 'text-orange-600',
    }
    return colorMap[color] || 'text-blue-600'
  }

  return (
    <div>
      {/* En-tête avec statistiques */}
      <div className="card mb-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Espace RDC</h2>
            <p className="text-gray-600">
              Responsable de chantier - Accès RDC et CAFF
            </p>
            {salarieRDC && (
              <p className="text-sm text-gray-500 mt-1">
                {salarieRDC.prenom} {salarieRDC.nom}
              </p>
            )}
          </div>
          {user.role && (
            <span className={`badge ${
              user.role === 'RDC' ? 'badge-warning' :
              user.role === 'CAFF' ? 'badge-info' :
              'badge-secondary'
            }`}>
              {user.role}
            </span>
          )}
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-primary-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Personnel affecté</p>
                <p className="text-2xl font-bold text-gray-900">{personnelAffecte.length}</p>
              </div>
              <Users className="text-primary-600" size={32} />
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Interventions en cours</p>
                <p className="text-2xl font-bold text-gray-900">{interventionsEnCours}</p>
              </div>
              <FileText className="text-green-600" size={32} />
            </div>
          </div>

          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">RTT en attente</p>
                <p className="text-2xl font-bold text-gray-900">{congesRTTEnAttente}</p>
              </div>
              <Calendar className="text-yellow-600" size={32} />
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
              const isActive = activeTab === tab.id
              const colorClasses = getColorClasses(tab.color || 'blue', isActive)
              const iconColorClass = getIconColorClass(tab.color || 'blue', isActive)
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition-all rounded-t-lg ${colorClasses}`}
                >
                  <div className="flex items-center gap-2">
                    <Icon size={18} className={iconColorClass} />
                    <span>{tab.label}</span>
                  </div>
                </button>
              )
            })}
          </nav>
        </div>

        {/* Contenu des onglets */}
        <div>
          {activeTab === 'tableau-bord' && (
            <TabTableauBord
              user={user}
              salarieRDC={salarieRDC}
              personnelAffecte={personnelAffecte}
              interventionsEnCours={interventionsEnCours}
              affectationsAujourdhui={affectationsAujourdhui}
            />
          )}
          {activeTab === 'personnel' && (
            <TabGestionPersonnel
              user={user}
              salarieRDC={salarieRDC}
              personnelAffecte={personnelAffecte}
            />
          )}
          {activeTab === 'conges' && (
            <TabGestionConges
              user={user}
              salarieRDC={salarieRDC}
              congesRTTEnAttente={congesRTTEnAttente}
            />
          )}
        </div>
      </div>
    </div>
  )
}
