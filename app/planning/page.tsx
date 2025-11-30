import SidebarWrapper from '@/components/SidebarWrapper'
import Header from '@/components/Header'
import { requireAuth } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'
import CalendrierPlanning from '@/components/espace-staff/tabs/CalendrierPlanning'

export default async function PlanningPage() {
  const user = await requireAuth()

  return (
    <div className="flex h-screen overflow-hidden">
      <SidebarWrapper />
      
      <div className="flex-1 flex flex-col lg:ml-52">
        <Header 
          title="Planning des ressources" 
          perimetres={await prisma.perimetre.findMany({
            where: { actif: true },
            orderBy: { nom: 'asc' }
          })}
        />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Planning</h2>
          </div>

          <CalendrierPlanning user={user} />
        </main>
      </div>
    </div>
  )
}
