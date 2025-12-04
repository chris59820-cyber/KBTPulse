export const dynamic = 'force-dynamic'

import SidebarWrapper from '@/components/SidebarWrapper'
import Header from '@/components/Header'
import { requireSpace } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'
import { Database, Table, ArrowRight } from 'lucide-react'
import Link from 'next/link'

// Liste de tous les modèles avec leurs informations
const MODELS = [
  { 
    name: 'User', 
    label: 'Utilisateurs', 
    icon: '👤', 
    description: 'Comptes utilisateurs et authentification',
    module: 'Gestion des utilisateurs'
  },
  { 
    name: 'Salarie', 
    label: 'Salariés', 
    icon: '👷', 
    description: 'Informations personnelles et professionnelles',
    module: 'Gestion des profils salariés'
  },
  { 
    name: 'Client', 
    label: 'Clients', 
    icon: '🏢', 
    description: 'Informations des clients',
    module: 'Gestion des clients'
  },
  { 
    name: 'Chantier', 
    label: 'Chantiers', 
    icon: '🏗️', 
    description: 'Gestion des chantiers',
    module: 'Gestion des chantiers'
  },
  { 
    name: 'Intervention', 
    label: 'Interventions', 
    icon: '🔧', 
    description: 'Gestion des interventions',
    module: 'Gestion des interventions'
  },
  { 
    name: 'CodeAffaire', 
    label: 'Codes Affaire', 
    icon: '📋', 
    description: 'Codes d\'affaires',
    module: 'Espace CAFF - Gestion administrative'
  },
  { 
    name: 'DonneurOrdre', 
    label: 'Donneurs d\'ordre', 
    icon: '📝', 
    description: 'Donneurs d\'ordre',
    module: 'Gestion des donneurs d\'ordre'
  },
  { 
    name: 'Perimetre', 
    label: 'Périmètres', 
    icon: '📍', 
    description: 'Gestion des périmètres',
    module: 'Configuration du périmètre'
  },
  { 
    name: 'Usine', 
    label: 'Usines', 
    icon: '🏭', 
    description: 'Gestion des usines',
    module: 'Création et gestion des sites'
  },
  { 
    name: 'Vehicule', 
    label: 'Véhicules', 
    icon: '🚗', 
    description: 'Gestion des véhicules',
    module: 'Gestion des véhicules'
  },
  { 
    name: 'Materiel', 
    label: 'Matériel', 
    icon: '🛠️', 
    description: 'Inventaire du matériel',
    module: 'Gestion du matériel'
  },
  { 
    name: 'Actualite', 
    label: 'Actualités', 
    icon: '📰', 
    description: 'Actualités et publications',
    module: 'Gestion des actualités'
  },
  { 
    name: 'MessageSecurite', 
    label: 'Messages Sécurité', 
    icon: '⚠️', 
    description: 'Messages de sécurité',
    module: 'Messages de sécurité'
  },
  { 
    name: 'Conge', 
    label: 'Congés', 
    icon: '🏖️', 
    description: 'Gestion des congés',
    module: 'Mon profil - Demandes de congés'
  },
  { 
    name: 'Competence', 
    label: 'Compétences', 
    icon: '🎯', 
    description: 'Compétences des salariés',
    module: 'Mon profil - Compétences'
  },
  { 
    name: 'Habilitation', 
    label: 'Habilitations', 
    icon: '✅', 
    description: 'Habilitations',
    module: 'Mon profil - Habilitations'
  },
  { 
    name: 'Autorisation', 
    label: 'Autorisations', 
    icon: '🔐', 
    description: 'Autorisations',
    module: 'Mon profil - Autorisations'
  },
  { 
    name: 'VisiteMedicale', 
    label: 'Visites Médicales', 
    icon: '🏥', 
    description: 'Visites médicales',
    module: 'Mon profil - Visites médicales'
  },
  { 
    name: 'ContactUrgence', 
    label: 'Contacts Urgence', 
    icon: '📞', 
    description: 'Contacts d\'urgence',
    module: 'Mon profil - Contacts d\'urgence'
  },
  { 
    name: 'MaterielAttribue', 
    label: 'Matériel Attribué', 
    icon: '🎒', 
    description: 'Matériel attribué aux salariés',
    module: 'Mon profil - Matériel attribué'
  },
  { 
    name: 'Pointage', 
    label: 'Pointages', 
    icon: '⏰', 
    description: 'Pointages des salariés',
    module: 'Espace Staff - Pointages'
  },
  { 
    name: 'Horaire', 
    label: 'Horaires', 
    icon: '🕐', 
    description: 'Horaires des salariés',
    module: 'Espace Staff - Horaires'
  },
  { 
    name: 'AffectationPlanning', 
    label: 'Affectations Planning', 
    icon: '📊', 
    description: 'Affectations au planning',
    module: 'Espace Staff - Planning'
  },
  { 
    name: 'AffectationIntervention', 
    label: 'Affectations Interventions', 
    icon: '👥', 
    description: 'Affectations aux interventions',
    module: 'Gestion des interventions'
  },
  { 
    name: 'StructureOrganisationnelle', 
    label: 'Structures Organisationnelles', 
    icon: '🏛️', 
    description: 'Structures organisationnelles',
    module: 'Structure organisationnelle'
  },
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
        <Header title="Administration de la base de données" perimetres={perimetres} />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <Database className="text-primary-600" size={32} />
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Gestion des tableaux de la base de données</h2>
                  <p className="text-gray-600">Accédez et modifiez tous les tableaux avec leurs colonnes correspondant aux modules de saisie</p>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <div className="card bg-yellow-50 border-yellow-200">
                <div className="flex items-start gap-3">
                  <span className="text-yellow-600 text-xl">⚠️</span>
                  <div>
                    <h3 className="font-semibold text-yellow-900 mb-1">Attention - Zone d'administration</h3>
                    <p className="text-sm text-yellow-800">
                      Cette section permet d'accéder directement aux données de la base de données. 
                      Chaque tableau affiche toutes ses colonnes correspondant aux différents modules de saisie de l'application.
                      Les modifications sont irréversibles. Veuillez être prudent lors de l'édition ou de la suppression de données.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {MODELS.map((model) => (
                <Link
                  key={model.name}
                  href={`/configuration/base-de-donnees/${model.name.toLowerCase()}`}
                  className="card hover:shadow-lg transition-shadow cursor-pointer group"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="text-2xl">{model.icon}</div>
                    <div className="flex-1">
                      <h3 className="text-base font-semibold text-gray-900 mb-1">{model.label}</h3>
                      <p className="text-xs text-gray-500 font-mono mb-2">{model.name}</p>
                      <p className="text-xs text-primary-600 font-medium">{model.module}</p>
                    </div>
                    <ArrowRight className="text-gray-400 group-hover:text-primary-600 transition-colors" size={18} />
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {model.description}
                  </p>
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <span className="text-xs text-primary-600 hover:text-primary-700 font-medium">
                      Voir les colonnes et données →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

