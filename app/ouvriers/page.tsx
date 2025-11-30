import SidebarWrapper from '@/components/SidebarWrapper'
import Header from '@/components/Header'
import { requireSpace } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'
import { Users, Plus } from 'lucide-react'
import ListeOuvriers from '@/components/ouvriers/ListeOuvriers'

export default async function OuvriersPage() {
  const user = await requireSpace('OUVRIERS')
  const canViewSensitive = !!(user && (user.role === 'RDC' || user.role === 'CAFF' || user.role === 'ADMIN'))

  const ouvriers = await prisma.salarie.findMany({
    where: {
      statut: 'actif'
    },
    orderBy: { nom: 'asc' },
    include: {
      user: true,
      habilitations: {
        where: { actif: true },
        orderBy: { dateExpiration: 'asc' }
      },
      autorisations: {
        where: { actif: true },
        orderBy: { dateExpiration: 'asc' }
      },
      visitesMedicales: {
        orderBy: { dateVisite: 'desc' },
        take: 1
      },
      restrictionsMedicales: {
        where: { actif: true },
        orderBy: { dateDebut: 'desc' }
      },
      competences: true
    }
  })

  return (
    <div className="flex h-screen overflow-hidden">
      <SidebarWrapper />
      
      <div className="flex-1 flex flex-col lg:ml-52">
        <Header 
          title="Gestion des ouvriers" 
          perimetres={await prisma.perimetre.findMany({
            where: { actif: true },
            orderBy: { nom: 'asc' }
          })}
        />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Users className="text-primary-600" size={32} />
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Gestion des ouvriers</h2>
                  <p className="text-gray-600">Gestion complète des informations ouvriers</p>
                </div>
              </div>
            </div>

            <div className="card">
              <ListeOuvriers ouvriers={ouvriers} canViewSensitive={canViewSensitive} />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
