'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Briefcase, FileText, Users, Package, Calendar, TrendingUp, MessageCircle, DollarSign, MapPin, Navigation, Building2, Edit, Trash2, CheckSquare, Play } from 'lucide-react'
import TabInformationsGenerales from './tabs/TabInformationsGenerales'
import TabDocumentsIntervention from './tabs/TabDocumentsIntervention'
import TabEquipeResponsabilites from './tabs/TabEquipeResponsabilites'
import TabRessourcesMaterielles from './tabs/TabRessourcesMaterielles'
import TabPlanificationSuivi from './tabs/TabPlanificationSuivi'
import TabCommunication from './tabs/TabCommunication'
import TabAspectsFinanciers from './tabs/TabAspectsFinanciers'
import TabChecklist from './tabs/TabChecklist'

interface Intervention {
  id: string
  titre: string
  description: string | null
  type: string | null
  nature: string | null
  secteur: string | null
  usine: string | null
  latitude: number | null
  longitude: number | null
  statut: string
  dateDebut: Date | null
  dateFin: Date | null
  dateDebutReelle: Date | null
  dateFinReelle: Date | null
  tempsPrevu: number | null
  dureeReelle: number | null
  avancement: number
  montantTotal: number | null
  montantResteAFaire: number | null
  retexPositifs: string | null
  retexNegatifs: string | null
  responsableId: string | null
  rdcId: string | null
  donneurOrdreNom: string | null
  donneurOrdreTelephone: string | null
  donneurOrdreEmail: string | null
  chantier: {
    id: string
    nom: string
    adresse: string | null
  }
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
  affectationsIntervention: any[]
  documentsIntervention: any[]
  ressourcesIntervention: any[]
  photosIntervention: any[]
  autoControles: any[]
  messagesIntervention: any[]
  checklistSecurite: any | null
}

interface DetailInterventionProps {
  intervention: Intervention
  user: any
  canViewFinancial: boolean
}

type TabType = 'informations' | 'documents' | 'equipe' | 'ressources' | 'planification' | 'communication' | 'checklist' | 'financiers'

export default function DetailIntervention({ intervention, user, canViewFinancial }: DetailInterventionProps) {
  const [activeTab, setActiveTab] = useState<TabType>('informations')
  const [deleting, setDeleting] = useState(false)
  const [starting, setStarting] = useState(false)
  const router = useRouter()

  // Vérifier si l'utilisateur peut modifier l'intervention
  const canEdit = ['PREPA', 'CE', 'RDC', 'CAFF', 'ADMIN'].includes(user.role) || 
                  user.salarieId === intervention.responsableId
  
  // Vérifier si l'utilisateur peut supprimer l'intervention
  const canDelete = ['PREPA', 'CE', 'CAFF', 'ADMIN'].includes(user.role)

  // Vérifier si l'utilisateur peut démarrer l'intervention
  const canStart = ['PREPA', 'CE', 'RDC', 'CAFF', 'ADMIN'].includes(user.role) ||
                   user.salarieId === intervention.responsableId ||
                   user.salarieId === intervention.rdcId

  const handleDelete = async () => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer l'intervention "${intervention.titre}" ?\n\nCette action est irréversible.`)) {
      return
    }

    setDeleting(true)

    try {
      const response = await fetch(`/api/interventions/${intervention.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        router.push('/interventions')
        router.refresh()
      } else {
        const data = await response.json()
        alert(data.error || 'Erreur lors de la suppression de l\'intervention')
        setDeleting(false)
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      alert('Erreur lors de la suppression de l\'intervention')
      setDeleting(false)
    }
  }

  const handleStart = async () => {
    if (!confirm('Voulez-vous démarrer cette intervention ?\n\nLe statut passera à "En cours" et la date de début réelle sera enregistrée.')) {
      return
    }

    setStarting(true)

    try {
      const response = await fetch(`/api/interventions/${intervention.id}/demarrer`, {
        method: 'POST'
      })

      if (response.ok) {
        router.refresh()
        alert('Intervention démarrée avec succès')
      } else {
        const data = await response.json()
        alert(data.error || 'Erreur lors du démarrage de l\'intervention')
        setStarting(false)
      }
    } catch (error) {
      console.error('Erreur lors du démarrage:', error)
      alert('Erreur lors du démarrage de l\'intervention')
      setStarting(false)
    }
  }

  const tabs = [
    { id: 'informations' as TabType, label: 'Informations générales', icon: Briefcase },
    { id: 'documents' as TabType, label: 'Documents', icon: FileText },
    { id: 'equipe' as TabType, label: 'Équipe & Responsabilités', icon: Users },
    { id: 'ressources' as TabType, label: 'Ressources matérielles', icon: Package },
    { id: 'planification' as TabType, label: 'Planification & Suivi', icon: Calendar },
    { id: 'communication' as TabType, label: 'Communication', icon: MessageCircle },
    { id: 'checklist' as TabType, label: 'Check-list', icon: CheckSquare },
    ...(canViewFinancial ? [{ id: 'financiers' as TabType, label: 'Aspects financiers', icon: DollarSign }] : []),
  ]

  // Fonction pour formater le type d'intervention
  const formatType = (type: string | null | undefined): string => {
    if (!type) return ''
    if (type === 'echafaudage') return 'Échafaudage'
    if (type === 'calorifuge') return 'Calorifuge'
    return type
  }

  // Fonction pour formater la nature d'intervention
  const formatNature = (nature: string | null | undefined): string => {
    if (!nature) return ''
    const natureMap: Record<string, string> = {
      'pose': 'Pose',
      'depose': 'Dépose',
      'preparations': 'Préparations',
      'evacuation': 'Évacuation',
      'manutentions': 'Manutentions',
      'transport': 'Transport',
      'chargements': 'Chargements',
      'dechargements': 'Déchargements',
      'repli_chantier': 'Repli de chantier'
    }
    return natureMap[nature] || nature
  }

  // Fonction pour formater le statut
  const formatStatut = (statut: string): string => {
    const statuts: Record<string, string> = {
      'planifiee': 'Planifiée',
      'en_attente': 'En attente',
      'en_cours': 'En cours',
      'diagnostique': 'Diagnostiquée',
      'terminee': 'Terminée',
      'annulee': 'Annulée'
    }
    return statuts[statut] || statut.replace('_', ' ')
  }

  const statutColors: Record<string, string> = {
    planifiee: 'bg-blue-50 border-blue-200 text-blue-800',
    en_attente: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    en_cours: 'bg-green-50 border-green-200 text-green-800',
    diagnostique: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    terminee: 'bg-gray-50 border-gray-200 text-gray-800',
    annulee: 'bg-red-50 border-red-200 text-red-800',
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="card">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{intervention.titre}</h2>
            {intervention.description && (
              <p className="text-gray-600 mb-2">{intervention.description}</p>
            )}
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Building2 size={16} />
                <span>{intervention.chantier.nom}</span>
              </div>
              {intervention.type && (
                <span className="badge badge-info">{formatType(intervention.type)}</span>
              )}
              {intervention.nature && (
                <span className="badge badge-success">{formatNature(intervention.nature)}</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {canStart && intervention.statut === 'planifiee' && (
                <button
                  onClick={handleStart}
                  disabled={starting}
                  className="btn btn-success flex items-center gap-2"
                  title="Démarrer l'intervention"
                >
                  <Play size={18} />
                  <span className="hidden sm:inline">{starting ? 'Démarrage...' : 'Démarrer l\'intervention'}</span>
                </button>
              )}
              {canEdit && (
                <button
                  onClick={() => router.push(`/interventions/${intervention.id}/modifier`)}
                  className="btn btn-primary flex items-center gap-2"
                  title="Modifier l'intervention"
                >
                  <Edit size={18} />
                  <span className="hidden sm:inline">Modifier</span>
                </button>
              )}
              {canDelete && (
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="btn btn-danger flex items-center gap-2"
                  title="Supprimer l'intervention"
                >
                  <Trash2 size={18} />
                  <span className="hidden sm:inline">{deleting ? 'Suppression...' : 'Supprimer'}</span>
                </button>
              )}
            </div>
            <div className={`px-4 py-2 rounded-lg border ${statutColors[intervention.statut] || statutColors.planifiee}`}>
              <span className="font-semibold">{formatStatut(intervention.statut)}</span>
            </div>
          </div>
        </div>

        {/* Barre de progression */}
        {intervention.avancement > 0 && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Avancement</span>
              <span className="text-sm font-bold text-primary-600">{intervention.avancement}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-primary-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${intervention.avancement}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Onglets */}
      <div className="card">
        <div className="border-b border-gray-200 mb-6">
          <nav className="grid grid-cols-2 md:grid-cols-4 gap-1 pb-2">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-3 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary-600 text-primary-600 bg-primary-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2 justify-center">
                    <Icon size={18} />
                    <span className="text-center">{tab.label}</span>
                  </div>
                </button>
              )
            })}
          </nav>
        </div>

        {/* Contenu des onglets */}
        <div>
          {activeTab === 'informations' && (
            <TabInformationsGenerales intervention={intervention} />
          )}
          {activeTab === 'documents' && (
            <TabDocumentsIntervention intervention={intervention} user={user} />
          )}
          {activeTab === 'equipe' && (
            <TabEquipeResponsabilites intervention={intervention} user={user} />
          )}
          {activeTab === 'ressources' && (
            <TabRessourcesMaterielles intervention={intervention} user={user} />
          )}
          {activeTab === 'planification' && (
            <TabPlanificationSuivi intervention={intervention} user={user} />
          )}
          {activeTab === 'communication' && (
            <TabCommunication intervention={intervention} user={user} />
          )}
          {activeTab === 'checklist' && (
            <TabChecklist intervention={intervention} user={user} />
          )}
          {activeTab === 'financiers' && canViewFinancial && (
            <TabAspectsFinanciers intervention={intervention} />
          )}
        </div>
      </div>
    </div>
  )
}
