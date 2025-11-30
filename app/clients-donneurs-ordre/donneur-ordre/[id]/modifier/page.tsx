import SidebarWrapper from '@/components/SidebarWrapper'
import Header from '@/components/Header'
import FormDonneurOrdre from '@/components/donneurs-ordre/FormDonneurOrdre'
import { requireAuth } from '@/lib/middleware'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'

export default async function ModifierDonneurOrdrePage({ params }: { params: { id: string } }) {
  const user = await requireAuth()
  
  if (!user) {
    redirect('/connexion')
  }

  // Vérifier les permissions
  if (!['PREPA', 'CE', 'RDC', 'CAFF', 'ADMIN'].includes(user.role)) {
    redirect('/acces-refuse')
  }

  // Récupérer le donneur d'ordre
  const donneurOrdre = await prisma.donneurOrdre.findUnique({
    where: { id: params.id }
  })

  if (!donneurOrdre) {
    redirect('/clients-donneurs-ordre')
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <SidebarWrapper />
      
      <div className="flex-1 flex flex-col lg:ml-52">
        <Header title="Modifier le donneur d'ordre" />
        
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <FormDonneurOrdre donneurOrdre={donneurOrdre} />
        </main>
      </div>
    </div>
  )
}




