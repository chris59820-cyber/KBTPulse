export const dynamic = 'force-dynamic'

import SidebarWrapper from '@/components/SidebarWrapper'
import Header from '@/components/Header'
import { requireSpace } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'
import { Database, Plus, Search, Edit, Trash2, ArrowLeft } from 'lucide-react'
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
  'conversation': 'conversation',
  'message': 'message',
  'conge': 'conge',
  'competence': 'competence',
  'habilitation': 'habilitation',
  'autorisation': 'autorisation',
  'visitemedicale': 'visiteMedicale',
  'restrictionmedicale': 'restrictionMedicale',
  'contacturgence': 'contactUrgence',
  'materielfourni': 'materielFourni',
  'enginconfie': 'enginConfie',
  'materielattribue': 'materielAttribue',
  'documentpersonnel': 'documentPersonnel',
  'formationsalarie': 'formationSalarie',
  'acessiteclient': 'accesSiteClient',
  'pointage': 'pointage',
  'horaire': 'horaire',
  'evaluation': 'evaluation',
  'evenementrh': 'evenementRH',
  'affectationplanning': 'affectationPlanning',
  'affectationintervention': 'affectationIntervention',
  'affectationvehicule': 'affectationVehicule',
  'affectationpersonnel': 'affectationPersonnel',
  'structureorganisationnelle': 'structureOrganisationnelle',
  'salarieperimetre': 'salariePerimetre',
  'materielutilise': 'materielUtilise',
  'documentintervention': 'documentIntervention',
  'ressourceintervention': 'ressourceIntervention',
  'photointervention': 'photoIntervention',
  'autocontrole': 'autoControle',
  'messageintervention': 'messageIntervention',
  'checklistsecurite': 'checklistSecurite',
  'participantconversation': 'participantConversation',
  'publication': 'publication',
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

  return (
    <div className="flex h-screen overflow-hidden">
      <SidebarWrapper />
      
      <div className="flex-1 flex flex-col lg:ml-52">
        <Header title={`Gestion : ${prismaModelName}`} perimetres={perimetres} />
        
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
              <div className="flex items-center gap-3">
                <Database className="text-primary-600" size={28} />
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 capitalize">
                    {prismaModelName.replace(/([A-Z])/g, ' $1').trim()}
                  </h2>
                  <p className="text-gray-600 text-sm font-mono">{prismaModelName}</p>
                </div>
              </div>
            </div>

            <GestionTableauDB modelName={prismaModelName} />
          </div>
        </main>
      </div>
    </div>
  )
}

