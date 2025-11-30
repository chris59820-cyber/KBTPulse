import SidebarWrapper from '@/components/SidebarWrapper'
import Header from '@/components/Header'
import { requireSpace } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'
import EspaceStaffContent from '@/components/espace-staff/EspaceStaffContent'

export default async function EspaceStaffPage() {
  const user = await requireSpace('STAFF')

  // Récupérer les périmètres actifs
  const perimetres = await prisma.perimetre.findMany({
    where: { actif: true },
    orderBy: { nom: 'asc' }
  })

  return (
    <div className="flex h-screen overflow-hidden">
      <SidebarWrapper />
      
      <div className="flex-1 flex flex-col lg:ml-52">
        <Header title="Espace Staff" perimetres={perimetres} />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            <EspaceStaffContent user={user} />
          </div>
        </main>
      </div>
    </div>
  )
}
