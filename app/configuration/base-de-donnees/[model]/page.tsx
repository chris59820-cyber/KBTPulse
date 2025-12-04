export const dynamic = 'force-dynamic'

import SidebarWrapper from '@/components/SidebarWrapper'
import Header from '@/components/Header'
import { requireSpace } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'
import { Database, ArrowLeft, Columns } from 'lucide-react'
import Link from 'next/link'
import GestionTableauDB from '@/components/configuration/base-de-donnees/GestionTableauDB'

interface PageProps {
  params: {
    model: string
  }
}

// Mapping des noms de modèles vers les noms Prisma
const MODEL_MAP: Record<string, string> = {
  'user': 'user',
  'salarie': 'salarie',
  'client': 'client',
  'chantier': 'chantier',
  'intervention': 'intervention',
  'codeaffaire': 'codeAffaire',
  'donneurordre': 'donneurOrdre',
  'perimetre': 'perimetre',
  'usine': 'usine',
  'vehicule': 'vehicule',
  'materiel': 'materiel',
  'actualite': 'actualite',
  'messagesecurite': 'messageSecurite',
  'conge': 'conge',
  'competence': 'competence',
  'habilitation': 'habilitation',
  'autorisation': 'autorisation',
  'visitemedicale': 'visiteMedicale',
  'contacturgence': 'contactUrgence',
  'materielattribue': 'materielAttribue',
  'pointage': 'pointage',
  'horaire': 'horaire',
  'affectationplanning': 'affectationPlanning',
  'affectationintervention': 'affectationIntervention',
  'structureorganisationnelle': 'structureOrganisationnelle',
}

// Labels des modèles
const MODEL_LABELS: Record<string, string> = {
  'user': 'Utilisateurs',
  'salarie': 'Salariés',
  'client': 'Clients',
  'chantier': 'Chantiers',
  'intervention': 'Interventions',
  'codeAffaire': 'Codes Affaire',
  'donneurOrdre': 'Donneurs d\'ordre',
  'perimetre': 'Périmètres',
  'usine': 'Usines',
  'vehicule': 'Véhicules',
  'materiel': 'Matériel',
  'actualite': 'Actualités',
  'messageSecurite': 'Messages Sécurité',
  'conge': 'Congés',
  'competence': 'Compétences',
  'habilitation': 'Habilitations',
  'autorisation': 'Autorisations',
  'visiteMedicale': 'Visites Médicales',
  'contactUrgence': 'Contacts Urgence',
  'materielAttribue': 'Matériel Attribué',
  'pointage': 'Pointages',
  'horaire': 'Horaires',
  'affectationPlanning': 'Affectations Planning',
  'affectationIntervention': 'Affectations Interventions',
  'structureOrganisationnelle': 'Structures Organisationnelles',
}

export default async function ModelPage({ params }: PageProps) {
  const user = await requireSpace('CONFIGURATION')

  const modelName = params.model.toLowerCase()
  const prismaModelName = MODEL_MAP[modelName]

  if (!prismaModelName) {
    return (
      <div className="flex h-screen overflow-hidden">
        <SidebarWrapper />
        <div className="flex-1 flex flex-col lg:ml-52">
          <main className="flex-1 overflow-y-auto p-6">
            <div className="max-w-4xl mx-auto">
              <div className="card">
                <h2 className="text-xl font-bold text-red-600 mb-4">Modèle non trouvé</h2>
                <p className="text-gray-600 mb-4">Le modèle "{params.model}" n'existe pas dans la base de données.</p>
                <Link href="/configuration/base-de-donnees" className="btn btn-primary">
                  <ArrowLeft size={16} className="mr-2" />
                  Retour à la liste
                </Link>
              </div>
            </div>
          </main>
        </div>
      </div>
    )
  }

  const perimetres = await prisma.perimetre.findMany({
    where: { actif: true },
    orderBy: { nom: 'asc' }
  })

  // Récupérer un exemple de données pour déterminer les colonnes
  const model = (prisma as any)[prismaModelName]
  let sampleData: any = null
  let columns: string[] = []

  try {
    const firstRecord = await model.findFirst({
      take: 1,
    })
    
    if (firstRecord) {
      sampleData = firstRecord
      columns = Object.keys(firstRecord).filter(key => {
        // Exclure les relations complexes (objets avec trop de propriétés)
        const value = firstRecord[key]
        if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
          return Object.keys(value).length < 5
        }
        return true
      })
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des colonnes:', error)
  }

  const modelLabel = MODEL_LABELS[prismaModelName] || prismaModelName

  return (
    <div className="flex h-screen overflow-hidden">
      <SidebarWrapper />
      
      <div className="flex-1 flex flex-col lg:ml-52">
        <Header title={`Gestion : ${modelLabel}`} perimetres={perimetres} />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <Link 
                href="/configuration/base-de-donnees" 
                className="text-primary-600 hover:text-primary-700 flex items-center gap-2 mb-4"
              >
                <ArrowLeft size={18} />
                <span>Retour à la liste des tableaux</span>
              </Link>
              <div className="flex items-center gap-3 mb-4">
                <Database className="text-primary-600" size={28} />
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{modelLabel}</h2>
                  <p className="text-gray-600 text-sm font-mono">{prismaModelName}</p>
                </div>
              </div>
              
              {columns.length > 0 && (
                <div className="card bg-blue-50 border-blue-200 mt-4">
                  <div className="flex items-start gap-3">
                    <Columns className="text-blue-600 mt-0.5" size={18} />
                    <div>
                      <h3 className="font-semibold text-blue-900 mb-2">Colonnes du tableau ({columns.length})</h3>
                      <div className="flex flex-wrap gap-2">
                        {columns.map((col) => (
                          <span
                            key={col}
                            className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-mono rounded"
                          >
                            {col}
                          </span>
                        ))}
                      </div>
                      <p className="text-xs text-blue-700 mt-2">
                        Ces colonnes correspondent aux champs des modules de saisie de l'application
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <GestionTableauDB modelName={prismaModelName} />
          </div>
        </main>
      </div>
    </div>
  )
}

