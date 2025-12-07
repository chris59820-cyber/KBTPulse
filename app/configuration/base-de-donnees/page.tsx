import SidebarWrapper from '@/components/SidebarWrapper'
import Header from '@/components/Header'
import { requireSpace } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'
import { Database, User, HardHat, Building2, Wrench, FileText, MapPin, Factory, ClipboardList, AlertTriangle, ArrowRight, Calendar, Package } from 'lucide-react'
import Link from 'next/link'

// Configuration des modèles avec leurs icônes et descriptions détaillées
const MODELS_CONFIG = [
  {
    name: 'User',
    label: 'Utilisateurs',
    description: 'Gestion des utilisateurs',
    additionalInfo: 'Comptes utilisateurs et authentification',
    icon: User,
    iconColor: 'text-purple-600',
    bgColor: 'bg-purple-100'
  },
  {
    name: 'Salarie',
    label: 'Salariés',
    description: 'Gestion des profils salariés',
    additionalInfo: 'Informations personnelles et professionnelles',
    icon: HardHat,
    iconColor: 'text-orange-600',
    bgColor: 'bg-orange-100'
  },
  {
    name: 'Client',
    label: 'Clients',
    description: 'Gestion des clients',
    additionalInfo: 'Informations des clients',
    icon: Building2,
    iconColor: 'text-blue-600',
    bgColor: 'bg-blue-100'
  },
  {
    name: 'Chantier',
    label: 'Chantiers',
    description: 'Gestion des chantiers',
    additionalInfo: 'Gestion des chantiers',
    icon: Building2,
    iconColor: 'text-amber-700',
    bgColor: 'bg-amber-100'
  },
  {
    name: 'Intervention',
    label: 'Interventions',
    description: 'Gestion des interventions',
    additionalInfo: 'Gestion des interventions',
    icon: Wrench,
    iconColor: 'text-gray-600',
    bgColor: 'bg-gray-100'
  },
  {
    name: 'CodeAffaire',
    label: 'Codes Affaire',
    description: 'Espace CAFF - Gestion administrative',
    additionalInfo: 'Codes d\'affaires',
    icon: ClipboardList,
    iconColor: 'text-amber-600',
    bgColor: 'bg-amber-100'
  },
  {
    name: 'DonneurOrdre',
    label: 'Donneurs d\'ordre',
    description: 'Gestion des donneurs d\'ordre',
    additionalInfo: 'Donneurs d\'ordre',
    icon: FileText,
    iconColor: 'text-red-600',
    bgColor: 'bg-red-100'
  },
  {
    name: 'Perimetre',
    label: 'Périmètres',
    description: 'Configuration du périmètre',
    additionalInfo: 'Gestion des périmètres',
    icon: MapPin,
    iconColor: 'text-pink-600',
    bgColor: 'bg-pink-100'
  },
  {
    name: 'Usine',
    label: 'Usines',
    description: 'Création et gestion des sites',
    additionalInfo: 'Gestion des usines',
    icon: Factory,
    iconColor: 'text-gray-600',
    bgColor: 'bg-gray-100'
  },
  {
    name: 'Competence',
    label: 'Compétences',
    description: 'Compétences des salariés',
    additionalInfo: 'Gestion des compétences',
    icon: ClipboardList,
    iconColor: 'text-blue-600',
    bgColor: 'bg-blue-100'
  },
  {
    name: 'Habilitation',
    label: 'Habilitations',
    description: 'Habilitations des salariés',
    additionalInfo: 'Gestion des habilitations',
    icon: FileText,
    iconColor: 'text-green-600',
    bgColor: 'bg-green-100'
  },
  {
    name: 'Autorisation',
    label: 'Autorisations',
    description: 'Autorisations des salariés',
    additionalInfo: 'Gestion des autorisations',
    icon: FileText,
    iconColor: 'text-indigo-600',
    bgColor: 'bg-indigo-100'
  },
  {
    name: 'VisiteMedicale',
    label: 'Visites médicales',
    description: 'Visites médicales des salariés',
    additionalInfo: 'Gestion des visites médicales',
    icon: ClipboardList,
    iconColor: 'text-red-600',
    bgColor: 'bg-red-100'
  },
  {
    name: 'RestrictionMedicale',
    label: 'Restrictions médicales',
    description: 'Restrictions médicales',
    additionalInfo: 'Gestion des restrictions',
    icon: FileText,
    iconColor: 'text-red-600',
    bgColor: 'bg-red-100'
  },
  {
    name: 'Publication',
    label: 'Publications',
    description: 'Publications internes',
    additionalInfo: 'Gestion des publications',
    icon: FileText,
    iconColor: 'text-blue-600',
    bgColor: 'bg-blue-100'
  },
  {
    name: 'Actualite',
    label: 'Actualités',
    description: 'Actualités et news',
    additionalInfo: 'Gestion des actualités',
    icon: FileText,
    iconColor: 'text-green-600',
    bgColor: 'bg-green-100'
  },
  {
    name: 'MessageSecurite',
    label: 'Messages de sécurité',
    description: 'Messages de sécurité',
    additionalInfo: 'Gestion des messages',
    icon: FileText,
    iconColor: 'text-yellow-600',
    bgColor: 'bg-yellow-100'
  },
  {
    name: 'Conversation',
    label: 'Conversations',
    description: 'Conversations de chat',
    additionalInfo: 'Gestion des conversations',
    icon: FileText,
    iconColor: 'text-purple-600',
    bgColor: 'bg-purple-100'
  },
  {
    name: 'ParticipantConversation',
    label: 'Participants conversations',
    description: 'Participants aux conversations',
    additionalInfo: 'Gestion des participants',
    icon: User,
    iconColor: 'text-purple-600',
    bgColor: 'bg-purple-100'
  },
  {
    name: 'Message',
    label: 'Messages',
    description: 'Messages de chat',
    additionalInfo: 'Gestion des messages',
    icon: FileText,
    iconColor: 'text-blue-600',
    bgColor: 'bg-blue-100'
  },
  {
    name: 'Conge',
    label: 'Congés',
    description: 'Gestion des congés',
    additionalInfo: 'Gestion des congés',
    icon: Calendar,
    iconColor: 'text-green-600',
    bgColor: 'bg-green-100'
  },
  {
    name: 'ContactUrgence',
    label: 'Contacts d\'urgence',
    description: 'Contacts d\'urgence des salariés',
    additionalInfo: 'Gestion des contacts',
    icon: User,
    iconColor: 'text-red-600',
    bgColor: 'bg-red-100'
  },
  {
    name: 'MaterielFourni',
    label: 'Matériel fourni',
    description: 'Matériel fourni aux salariés',
    additionalInfo: 'Gestion du matériel fourni',
    icon: Package,
    iconColor: 'text-blue-600',
    bgColor: 'bg-blue-100'
  },
  {
    name: 'EnginConfie',
    label: 'Engins confiés',
    description: 'Engins confiés aux salariés',
    additionalInfo: 'Gestion des engins',
    icon: Package,
    iconColor: 'text-orange-600',
    bgColor: 'bg-orange-100'
  },
  {
    name: 'MaterielAttribue',
    label: 'Matériel attribué',
    description: 'Matériel attribué aux salariés',
    additionalInfo: 'Gestion du matériel',
    icon: Package,
    iconColor: 'text-indigo-600',
    bgColor: 'bg-indigo-100'
  },
  {
    name: 'DocumentPersonnel',
    label: 'Documents personnels',
    description: 'Documents personnels des salariés',
    additionalInfo: 'Gestion des documents',
    icon: FileText,
    iconColor: 'text-gray-600',
    bgColor: 'bg-gray-100'
  },
  {
    name: 'FormationSalarie',
    label: 'Formations salariés',
    description: 'Formations suivies par les salariés',
    additionalInfo: 'Gestion des formations',
    icon: ClipboardList,
    iconColor: 'text-blue-600',
    bgColor: 'bg-blue-100'
  },
  {
    name: 'AccesSiteClient',
    label: 'Accès sites clients',
    description: 'Accès aux sites clients',
    additionalInfo: 'Gestion des accès',
    icon: MapPin,
    iconColor: 'text-green-600',
    bgColor: 'bg-green-100'
  },
  {
    name: 'Materiel',
    label: 'Matériel',
    description: 'Inventaire du matériel',
    additionalInfo: 'Gestion du matériel',
    icon: Package,
    iconColor: 'text-blue-600',
    bgColor: 'bg-blue-100'
  },
  {
    name: 'MaterielUtilise',
    label: 'Matériel utilisé',
    description: 'Matériel utilisé dans les interventions',
    additionalInfo: 'Gestion de l\'utilisation',
    icon: Package,
    iconColor: 'text-gray-600',
    bgColor: 'bg-gray-100'
  },
  {
    name: 'DocumentIntervention',
    label: 'Documents interventions',
    description: 'Documents des interventions',
    additionalInfo: 'Gestion des documents',
    icon: FileText,
    iconColor: 'text-blue-600',
    bgColor: 'bg-blue-100'
  },
  {
    name: 'AffectationIntervention',
    label: 'Affectations interventions',
    description: 'Affectations aux interventions',
    additionalInfo: 'Gestion des affectations',
    icon: User,
    iconColor: 'text-purple-600',
    bgColor: 'bg-purple-100'
  },
  {
    name: 'RessourceIntervention',
    label: 'Ressources interventions',
    description: 'Ressources des interventions',
    additionalInfo: 'Gestion des ressources',
    icon: Package,
    iconColor: 'text-green-600',
    bgColor: 'bg-green-100'
  },
  {
    name: 'PhotoIntervention',
    label: 'Photos interventions',
    description: 'Photos des interventions',
    additionalInfo: 'Gestion des photos',
    icon: FileText,
    iconColor: 'text-blue-600',
    bgColor: 'bg-blue-100'
  },
  {
    name: 'AutoControle',
    label: 'Auto-contrôles',
    description: 'Auto-contrôles des interventions',
    additionalInfo: 'Gestion des auto-contrôles',
    icon: ClipboardList,
    iconColor: 'text-yellow-600',
    bgColor: 'bg-yellow-100'
  },
  {
    name: 'MessageIntervention',
    label: 'Messages interventions',
    description: 'Messages des interventions',
    additionalInfo: 'Gestion des messages',
    icon: FileText,
    iconColor: 'text-blue-600',
    bgColor: 'bg-blue-100'
  },
  {
    name: 'ChecklistSecurite',
    label: 'Checklists sécurité',
    description: 'Checklists de sécurité',
    additionalInfo: 'Gestion des checklists',
    icon: ClipboardList,
    iconColor: 'text-red-600',
    bgColor: 'bg-red-100'
  },
  {
    name: 'AffectationPlanning',
    label: 'Affectations planning',
    description: 'Affectations au planning',
    additionalInfo: 'Gestion du planning',
    icon: Calendar,
    iconColor: 'text-blue-600',
    bgColor: 'bg-blue-100'
  },
  {
    name: 'SalariePerimetre',
    label: 'Salariés périmètres',
    description: 'Affectation salariés aux périmètres',
    additionalInfo: 'Gestion des affectations',
    icon: User,
    iconColor: 'text-purple-600',
    bgColor: 'bg-purple-100'
  },
  {
    name: 'Vehicule',
    label: 'Véhicules',
    description: 'Gestion des véhicules',
    additionalInfo: 'Gestion des véhicules',
    icon: Package,
    iconColor: 'text-blue-600',
    bgColor: 'bg-blue-100'
  },
  {
    name: 'AffectationVehicule',
    label: 'Affectations véhicules',
    description: 'Affectations des véhicules',
    additionalInfo: 'Gestion des affectations',
    icon: Package,
    iconColor: 'text-indigo-600',
    bgColor: 'bg-indigo-100'
  },
  {
    name: 'Pointage',
    label: 'Pointages',
    description: 'Gestion des pointages',
    additionalInfo: 'Gestion des pointages',
    icon: Calendar,
    iconColor: 'text-green-600',
    bgColor: 'bg-green-100'
  },
  {
    name: 'Horaire',
    label: 'Horaires',
    description: 'Gestion des horaires',
    additionalInfo: 'Gestion des horaires',
    icon: Calendar,
    iconColor: 'text-blue-600',
    bgColor: 'bg-blue-100'
  },
  {
    name: 'Evaluation',
    label: 'Évaluations',
    description: 'Évaluations des salariés',
    additionalInfo: 'Gestion des évaluations',
    icon: ClipboardList,
    iconColor: 'text-purple-600',
    bgColor: 'bg-purple-100'
  },
  {
    name: 'EvenementRH',
    label: 'Événements RH',
    description: 'Événements ressources humaines',
    additionalInfo: 'Gestion des événements',
    icon: Calendar,
    iconColor: 'text-pink-600',
    bgColor: 'bg-pink-100'
  },
  {
    name: 'AffectationPersonnel',
    label: 'Affectations personnel',
    description: 'Affectations du personnel',
    additionalInfo: 'Gestion des affectations',
    icon: User,
    iconColor: 'text-blue-600',
    bgColor: 'bg-blue-100'
  },
  {
    name: 'StructureOrganisationnelle',
    label: 'Structures organisationnelles',
    description: 'Structures organisationnelles',
    additionalInfo: 'Gestion des structures',
    icon: Building2,
    iconColor: 'text-gray-600',
    bgColor: 'bg-gray-100'
  }
]

export default async function BaseDeDonneesPage() {
  await requireSpace('CONFIGURATION')

  const perimetres = await prisma.perimetre.findMany({
    where: { actif: true },
    orderBy: { nom: 'asc' }
  })

  return (
    <div className="flex h-screen overflow-hidden">
      <SidebarWrapper />
      
      <div className="flex-1 flex flex-col lg:ml-52">
        <Header title="Gestion des tableaux de la base de données" perimetres={perimetres} />
        
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            {/* Header avec titre et description */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Database className="text-blue-600" size={32} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Gestion des tableaux de la base de données</h2>
                  <p className="text-gray-600 mt-1">
                    Accédez et modifiez tous les tableaux avec leurs colonnes correspondant aux modules de saisie
                  </p>
                </div>
              </div>
            </div>

            {/* Bandeau d'avertissement */}
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-r-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <h3 className="font-semibold text-yellow-800 mb-1">Attention - Zone d'administration</h3>
                  <p className="text-sm text-yellow-700">
                    Cette section permet d'accéder directement aux données de la base de données. Chaque tableau affiche toutes ses colonnes correspondant aux différents modules de saisie de l'application. Les modifications sont irréversibles. Veuillez être prudent lors de l'édition ou de la suppression de données.
                  </p>
                </div>
              </div>
            </div>

            {/* Grille des tableaux */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {MODELS_CONFIG.map((model) => {
                const IconComponent = model.icon
                return (
                  <Link
                    key={model.name}
                    href={`/configuration/base-de-donnees/${model.name.toLowerCase()}`}
                    className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg hover:border-primary-300 transition-all group"
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div className={`p-3 ${model.bgColor} rounded-lg flex-shrink-0`}>
                        <IconComponent className={model.iconColor} size={24} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-primary-600 transition-colors">
                          {model.label}
                        </h3>
                        <p className="text-xs text-gray-500 font-mono mb-2">{model.name}</p>
                        <p className="text-sm text-gray-700 mb-2">{model.description}</p>
                        <p className="text-xs text-gray-500">{model.additionalInfo}</p>
                      </div>
                    </div>
                    <div className="flex items-center text-sm text-primary-600 group-hover:text-primary-700 font-medium mt-4 pt-4 border-t border-gray-100">
                      <span>Voir les colonnes et données</span>
                      <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={16} />
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
