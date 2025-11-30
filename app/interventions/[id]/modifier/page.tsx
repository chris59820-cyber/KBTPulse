import SidebarWrapper from '@/components/SidebarWrapper'
import Header from '@/components/Header'
import { requireAuth } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import FormNouvelleIntervention from '@/components/interventions/FormNouvelleIntervention'

interface PageProps {
  params: {
    id: string
  }
}

export default async function ModifierInterventionPage({ params }: PageProps) {
  const user = await requireAuth()
  
  // Récupérer l'intervention à modifier
  const intervention = await prisma.intervention.findUnique({
    where: { id: params.id },
    include: {
      chantier: true,
      responsable: true,
      affectationsIntervention: {
        where: { actif: true },
        include: {
          salarie: true
        }
      },
      ressourcesIntervention: true,
      documentsIntervention: true,
      checklistSecurite: true
    }
  })

  // Récupérer le RDC si défini
  let rdc = null
  if (intervention?.rdcId) {
    rdc = await prisma.salarie.findUnique({
      where: { id: intervention.rdcId },
      select: {
        id: true,
        nom: true,
        prenom: true,
        poste: true
      }
    })
  }

  if (!intervention) {
    notFound()
  }

  // Récupérer le code affaire si défini
  let codeAffaire = null
  if ((intervention as any).codeAffaireId) {
    codeAffaire = await prisma.codeAffaire.findUnique({
      where: { id: (intervention as any).codeAffaireId },
      select: {
        id: true,
        code: true,
        libelle: true
      }
    })
  }

  // Vérifier les permissions : PREPA, CE, RDC, CAFF peuvent modifier
  const canEdit = ['PREPA', 'CE', 'RDC', 'CAFF', 'ADMIN'].includes(user.role) || 
                  user.salarieId === intervention.responsableId

  if (!canEdit) {
    return (
      <div className="flex h-screen overflow-hidden">
        <SidebarWrapper />
        <div className="flex-1 flex flex-col lg:ml-52">
          <Header 
            title="Accès refusé" 
            perimetres={await prisma.perimetre.findMany({
              where: { actif: true },
              orderBy: { nom: 'asc' }
            })}
          />
          <main className="flex-1 overflow-y-auto p-6">
            <div className="max-w-7xl mx-auto">
              <div className="card text-center py-12">
                <p className="text-gray-500 mb-4">Vous n'avez pas les permissions pour modifier cette intervention</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    )
  }

  // Récupérer les données nécessaires pour le formulaire
  const [chantiers, salaries, materiels, vehicules, usines, codesAffaire] = await Promise.all([
    prisma.chantier.findMany({
      orderBy: { nom: 'asc' },
      where: { statut: { not: 'annule' } }
    }),
    prisma.salarie.findMany({
      where: { statut: 'actif' },
      orderBy: { nom: 'asc' },
      select: {
        id: true,
        nom: true,
        prenom: true,
        photoUrl: true,
        poste: true,
        niveauAcces: true
      }
    }),
    prisma.materiel.findMany({
      orderBy: { nom: 'asc' }
    }),
    prisma.vehicule.findMany({
      orderBy: { immatriculation: 'asc' }
    }),
    prisma.usine.findMany({
      orderBy: { nom: 'asc' },
      select: {
        id: true,
        nom: true
      }
    }),
    prisma.codeAffaire.findMany({
      where: { actif: true },
      orderBy: { code: 'asc' },
      select: {
        id: true,
        code: true,
        libelle: true,
        chantierId: true,
        actif: true
      }
    })
  ])

  const perimetres = await prisma.perimetre.findMany({
    where: { actif: true },
    orderBy: { nom: 'asc' }
  })

  return (
    <div className="flex h-screen overflow-hidden">
      <SidebarWrapper />
      
      <div className="flex-1 flex flex-col lg:ml-52">
        <Header 
          title={`Modifier l'intervention: ${intervention.titre}`} 
          perimetres={perimetres}
        />
        
        <main className="flex-1 overflow-y-auto p-6">
          <FormNouvelleIntervention 
            intervention={intervention ? { ...intervention, rdc, codeAffaireId: intervention.codeAffaireId || undefined } : undefined}
            chantiers={chantiers}
            salaries={salaries}
            materiels={materiels}
            vehicules={vehicules}
            usines={usines}
            codesAffaire={codesAffaire}
          />
        </main>
      </div>
    </div>
  )
}

