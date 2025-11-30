import SidebarWrapper from '@/components/SidebarWrapper'
import Header from '@/components/Header'
import { requireAuth } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'
import FormNouveauChantier from '@/components/chantiers/FormNouveauChantier'

export default async function NouveauChantierPage() {
  const user = await requireAuth()
  
  // Vérifier les permissions : seuls PREPA, CE, RDC, CAFF peuvent créer
  const canCreate = user && !['OUVRIER'].includes(user.role)

  if (!canCreate) {
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
                <p className="text-gray-500 mb-4">Vous n'avez pas les permissions pour créer un chantier</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    )
  }

  // Récupérer les données nécessaires pour les menus déroulants
  const usines = await prisma.usine.findMany({
    orderBy: { nom: 'asc' },
    select: {
      id: true,
      nom: true
    }
  })

  const perimetres = await prisma.perimetre.findMany({
    where: { actif: true },
    orderBy: { nom: 'asc' }
  })

  return (
    <div className="flex h-screen overflow-hidden">
      <SidebarWrapper />
      
      <div className="flex-1 flex flex-col lg:ml-52">
        <Header 
          title="Créer un nouveau chantier" 
          perimetres={perimetres}
        />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto">
            <FormNouveauChantier 
              usines={usines}
            />
          </div>
        </main>
      </div>
    </div>
  )
}

