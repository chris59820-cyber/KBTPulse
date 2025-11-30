import SidebarWrapper from '@/components/SidebarWrapper'
import Header from '@/components/Header'
import { requireAuth } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'
import FormNouveauVehicule from '@/components/vehicules/FormNouveauVehicule'

export default async function NouveauVehiculePage() {
  await requireAuth()
  
  const [perimetres, rdcList] = await Promise.all([
    prisma.perimetre.findMany({
      where: { actif: true },
      orderBy: { nom: 'asc' }
    }),
    prisma.salarie.findMany({
      where: {
        statut: 'actif',
        niveauAcces: 'RDC'
      },
      select: {
        id: true,
        nom: true,
        prenom: true,
        photoUrl: true
      },
      orderBy: { nom: 'asc' }
    })
  ])

  return (
    <div className="flex h-screen overflow-hidden">
      <SidebarWrapper />
      
      <div className="flex-1 flex flex-col lg:ml-52">
        <Header 
          title="Nouveau véhicule" 
          perimetres={perimetres}
        />
        
        <main className="flex-1 overflow-y-auto p-6">
          <FormNouveauVehicule rdcList={rdcList} />
        </main>
      </div>
    </div>
  )
}

