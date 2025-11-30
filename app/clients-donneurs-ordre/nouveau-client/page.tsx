import SidebarWrapper from '@/components/SidebarWrapper'
import Header from '@/components/Header'
import FormClient from '@/components/clients/FormClient'
import { requireAuth } from '@/lib/middleware'
import { redirect } from 'next/navigation'

export default async function NouveauClientPage() {
  const user = await requireAuth()
  
  if (!user) {
    redirect('/connexion')
  }

  // Vérifier les permissions
  if (!['PREPA', 'CE', 'RDC', 'CAFF', 'ADMIN'].includes(user.role)) {
    redirect('/acces-refuse')
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <SidebarWrapper />
      
      <div className="flex-1 flex flex-col lg:ml-52">
        <Header title="Nouveau client" />
        
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <FormClient />
        </main>
      </div>
    </div>
  )
}




