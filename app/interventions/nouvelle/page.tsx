import SidebarWrapper from '@/components/SidebarWrapper'
import Header from '@/components/Header'
import { requireAuth } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'
import FormNouvelleIntervention from '@/components/interventions/FormNouvelleIntervention'

interface PageProps {
  searchParams: {
    chantierId?: string
  }
}

export default async function NouvelleInterventionPage(props: PageProps) {
  await requireAuth()
  
  const searchParams = await props.searchParams
  const chantierIdPreSelectionne = searchParams?.chantierId || ''
  
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
      where: { statut: 'disponible' },
      orderBy: { nom: 'asc' }
    }),
    prisma.vehicule.findMany({
      where: { statut: 'disponible' },
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
        description: true,
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
          title="Nouvelle intervention" 
          perimetres={perimetres}
        />
        
        <main className="flex-1 overflow-y-auto p-6">
          <FormNouvelleIntervention 
            chantiers={chantiers}
            salaries={salaries}
            materiels={materiels}
            vehicules={vehicules}
            usines={usines}
            codesAffaire={codesAffaire}
            chantierIdPreSelectionne={chantierIdPreSelectionne}
          />
        </main>
      </div>
    </div>
  )
}

