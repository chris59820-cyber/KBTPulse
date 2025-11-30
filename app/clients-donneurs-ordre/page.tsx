import SidebarWrapper from '@/components/SidebarWrapper'
import Header from '@/components/Header'
import { requireAuth } from '@/lib/middleware'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import ClientsDonneursOrdreContent from '@/components/clients-donneurs-ordre/ClientsDonneursOrdreContent'

export default async function ClientsDonneursOrdrePage() {
  const user = await requireAuth()
  
  if (!user) {
    redirect('/connexion')
  }

  // Vérifier les permissions
  if (!['PREPA', 'CE', 'RDC', 'CAFF', 'ADMIN'].includes(user.role)) {
    redirect('/acces-refuse')
  }

  // Récupérer les données initiales côté serveur
  const [clients, donneursOrdre] = await Promise.all([
    prisma.client.findMany({
      where: { actif: true },
      orderBy: { nom: 'asc' },
      include: {
        _count: {
          select: {
            chantiers: true,
            donneursOrdre: true
          }
        }
      }
    }),
    prisma.donneurOrdre.findMany({
      where: { actif: true },
      orderBy: { nom: 'asc' },
      include: {
        client: {
          select: {
            id: true,
            nom: true
          }
        },
        _count: {
          select: {
            chantiers: true,
            interventions: true
          }
        }
      }
    })
  ])

  return (
    <div className="flex h-screen overflow-hidden">
      <SidebarWrapper />
      
      <div className="flex-1 flex flex-col lg:ml-52">
        <Header title="Gestion des clients et donneurs d'ordre" />
        
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <ClientsDonneursOrdreContent 
            initialClients={clients}
            initialDonneursOrdre={donneursOrdre}
          />
        </main>
      </div>
    </div>
  )
}
