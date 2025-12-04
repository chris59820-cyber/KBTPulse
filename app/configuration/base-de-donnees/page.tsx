export const dynamic = 'force-dynamic'

import SidebarWrapper from '@/components/SidebarWrapper'
import Header from '@/components/Header'
import { requireSpace } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'
import { Database, Table } from 'lucide-react'
import Link from 'next/link'

// Liste de tous les modèles disponibles dans la base de données
const MODELS = [
  { name: 'User', label: 'Utilisateurs', icon: '👤', description: 'Gestion des comptes utilisateurs' },
  { name: 'Salarie', label: 'Salariés', icon: '👷', description: 'Informations des salariés' },
  { name: 'Client', label: 'Clients', icon: '🏢', description: 'Gestion des clients' },
  { name: 'Chantier', label: 'Chantiers', icon: '🏗️', description: 'Gestion des chantiers' },
  { name: 'Intervention', label: 'Interventions', icon: '🔧', description: 'Gestion des interventions' },
  { name: 'CodeAffaire', label: 'Codes Affaire', icon: '📋', description: 'Codes d\'affaires' },
  { name: 'DonneurOrdre', label: 'Donneurs d\'ordre', icon: '📝', description: 'Donneurs d\'ordre' },
  { name: 'Perimetre', label: 'Périmètres', icon: '📍', description: 'Gestion des périmètres' },
  { name: 'Usine', label: 'Usines', icon: '🏭', description: 'Gestion des usines' },
  { name: 'Vehicule', label: 'Véhicules', icon: '🚗', description: 'Gestion des véhicules' },
  { name: 'Materiel', label: 'Matériel', icon: '🛠️', description: 'Inventaire du matériel' },
  { name: 'Actualite', label: 'Actualités', icon: '📰', description: 'Actualités et publications' },
  { name: 'MessageSecurite', label: 'Messages Sécurité', icon: '⚠️', description: 'Messages de sécurité' },
  { name: 'Conversation', label: 'Conversations', icon: '💬', description: 'Conversations de chat' },
  { name: 'Message', label: 'Messages', icon: '✉️', description: 'Messages de chat' },
  { name: 'Conge', label: 'Congés', icon: '🏖️', description: 'Gestion des congés' },
  { name: 'Competence', label: 'Compétences', icon: '🎯', description: 'Compétences des salariés' },
  { name: 'Habilitation', label: 'Habilitations', icon: '✅', description: 'Habilitations' },
  { name: 'Autorisation', label: 'Autorisations', icon: '🔐', description: 'Autorisations' },
  { name: 'VisiteMedicale', label: 'Visites Médicales', icon: '🏥', description: 'Visites médicales' },
  { name: 'RestrictionMedicale', label: 'Restrictions Médicales', icon: '🚫', description: 'Restrictions médicales' },
  { name: 'ContactUrgence', label: 'Contacts Urgence', icon: '📞', description: 'Contacts d\'urgence' },
  { name: 'MaterielFourni', label: 'Matériel Fourni', icon: '📦', description: 'Matériel fourni aux salariés' },
  { name: 'EnginConfie', label: 'Engins Confiés', icon: '🚜', description: 'Engins confiés' },
  { name: 'MaterielAttribue', label: 'Matériel Attribué', icon: '🎒', description: 'Matériel attribué' },
  { name: 'DocumentPersonnel', label: 'Documents Personnels', icon: '📄', description: 'Documents personnels' },
  { name: 'FormationSalarie', label: 'Formations', icon: '📚', description: 'Formations des salariés' },
  { name: 'AccesSiteClient', label: 'Accès Sites Clients', icon: '🚪', description: 'Accès aux sites clients' },
  { name: 'Pointage', label: 'Pointages', icon: '⏰', description: 'Pointages des salariés' },
  { name: 'Horaire', label: 'Horaires', icon: '🕐', description: 'Horaires des salariés' },
  { name: 'Evaluation', label: 'Évaluations', icon: '⭐', description: 'Évaluations des salariés' },
  { name: 'EvenementRH', label: 'Événements RH', icon: '📅', description: 'Événements RH' },
  { name: 'AffectationPlanning', label: 'Affectations Planning', icon: '📊', description: 'Affectations au planning' },
  { name: 'AffectationIntervention', label: 'Affectations Interventions', icon: '👥', description: 'Affectations aux interventions' },
  { name: 'AffectationVehicule', label: 'Affectations Véhicules', icon: '🚙', description: 'Affectations de véhicules' },
  { name: 'AffectationPersonnel', label: 'Affectations Personnel', icon: '👔', description: 'Affectations du personnel' },
  { name: 'StructureOrganisationnelle', label: 'Structures Organisationnelles', icon: '🏛️', description: 'Structures organisationnelles' },
  { name: 'SalariePerimetre', label: 'Salariés-Périmètres', icon: '🔗', description: 'Relations salariés-périmètres' },
  { name: 'MaterielUtilise', label: 'Matériel Utilisé', icon: '🔨', description: 'Matériel utilisé dans les interventions' },
  { name: 'DocumentIntervention', label: 'Documents Interventions', icon: '📑', description: 'Documents des interventions' },
  { name: 'RessourceIntervention', label: 'Ressources Interventions', icon: '📦', description: 'Ressources des interventions' },
  { name: 'PhotoIntervention', label: 'Photos Interventions', icon: '📷', description: 'Photos des interventions' },
  { name: 'AutoControle', label: 'Auto-contrôles', icon: '✔️', description: 'Auto-contrôles' },
  { name: 'MessageIntervention', label: 'Messages Interventions', icon: '💬', description: 'Messages des interventions' },
  { name: 'ChecklistSecurite', label: 'Checklists Sécurité', icon: '✅', description: 'Checklists de sécurité' },
  { name: 'ParticipantConversation', label: 'Participants Conversations', icon: '👥', description: 'Participants aux conversations' },
  { name: 'Publication', label: 'Publications', icon: '📢', description: 'Publications' },
]

export default async function BaseDeDonneesPage() {
  const user = await requireSpace('CONFIGURATION')

  const perimetres = await prisma.perimetre.findMany({
    where: { actif: true },
    orderBy: { nom: 'asc' }
  })

  return (
    <div className="flex h-screen overflow-hidden">
      <SidebarWrapper />
      
      <div className="flex-1 flex flex-col lg:ml-52">
        <Header title="Gestion de la base de données" perimetres={perimetres} />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <Database className="text-primary-600" size={32} />
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Administration de la base de données</h2>
                  <p className="text-gray-600">Accédez et modifiez tous les tableaux de la base de données</p>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <div className="card bg-yellow-50 border-yellow-200">
                <div className="flex items-start gap-3">
                  <span className="text-yellow-600 text-xl">⚠️</span>
                  <div>
                    <h3 className="font-semibold text-yellow-900 mb-1">Attention</h3>
                    <p className="text-sm text-yellow-800">
                      Cette section permet d'accéder directement aux données de la base de données. 
                      Les modifications sont irréversibles. Veuillez être prudent lors de l'édition ou de la suppression de données.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {MODELS.map((model) => (
                <Link
                  key={model.name}
                  href={`/configuration/base-de-donnees/${model.name.toLowerCase()}`}
                  className="card hover:shadow-lg transition-shadow cursor-pointer"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="text-2xl">{model.icon}</div>
                    <div className="flex-1">
                      <h3 className="text-base font-semibold text-gray-900">{model.label}</h3>
                      <p className="text-xs text-gray-500 font-mono">{model.name}</p>
                    </div>
                    <Table className="text-gray-400" size={18} />
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {model.description}
                  </p>
                  <span className="text-xs text-primary-600 hover:text-primary-700 mt-2 inline-block">
                    Gérer →
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

