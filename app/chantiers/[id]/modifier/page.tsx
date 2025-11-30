import SidebarWrapper from '@/components/SidebarWrapper'
import Header from '@/components/Header'
import { requireAuth } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import FormModifierChantier from '@/components/chantiers/FormModifierChantier'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function ModifierChantierPage(props: PageProps) {
  const user = await requireAuth()
  const params = await props.params
  
  // Récupérer le chantier à modifier
  const chantier = await prisma.chantier.findUnique({
    where: { id: params.id },
    include: {
      client: true,
    },
  })

  if (!chantier) {
    notFound()
  }

  // Récupérer les données nécessaires pour les menus déroulants
  const usines = await prisma.usine.findMany({
    orderBy: { nom: 'asc' },
    select: {
      id: true,
      nom: true
    }
  })

  // Vérifier les permissions : seuls PREPA, CE, RDC, CAFF peuvent modifier
  const canEdit = user && !['OUVRIER'].includes(user.role)

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
                <p className="text-gray-500 mb-4">Vous n'avez pas les permissions pour modifier ce chantier</p>
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
        <Header 
          title={`Modifier le chantier: ${chantier.nom}`} 
          perimetres={perimetres}
        />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto">
            <FormModifierChantier 
              chantier={{
                ...chantier,
                client: chantier.client ? {
                  id: chantier.client.id,
                  nom: chantier.client.nom,
                  actif: chantier.client.actif
                } : null
              } as any} 
              usines={usines}
            />
          </div>
        </main>
      </div>
    </div>
  )
}

