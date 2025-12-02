import SidebarWrapper from '@/components/SidebarWrapper'
import Header from '@/components/Header'
import { requireSpace } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'
import { Building2 } from 'lucide-react'
import ListeUsines from '@/components/configuration/ListeUsines'

export default async function ConfigurationUsinesPage() {
  await requireSpace('CONFIGURATION')

  const usines = await prisma.usine.findMany({
    include: {
      perimetre: true,
      structures: true
    },
    orderBy: { nom: 'asc' }
  })

  // Récupérer les structures organisationnelles pour chaque usine
  // Les structures sont maintenant liées directement à l'usine via usineId
  const usinesAvecStructures = await Promise.all(
    usines.map(async (usine) => {
      // Récupérer les structures liées à cette usine (au niveau racine)
      const structures = await prisma.structureOrganisationnelle.findMany({
        where: {
          usineId: usine.id,
          parentId: null,
          actif: true
        },
        include: {
          enfants: {
            where: { 
              actif: true,
              usineId: usine.id // Filtrer les enfants pour le même site
            },
            include: {
              enfants: {
                where: { 
                  actif: true,
                  usineId: usine.id // Filtrer les petits-enfants pour le même site
                }
              }
            }
          }
        },
        orderBy: { ordre: 'asc' }
      })

      return {
        ...usine,
        structures
      }
    })
  )

  const perimetres = await prisma.perimetre.findMany({
    where: { actif: true },
    orderBy: { nom: 'asc' }
  })

  return (
    <div className="flex h-screen overflow-hidden">
      <SidebarWrapper />
      
      <div className="flex-1 flex flex-col lg:ml-52">
        <Header title="Création et gestion des sites" perimetres={perimetres} />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Building2 className="text-primary-600" size={32} />
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Gestion des sites</h2>
                  <p className="text-gray-600">Gérer les sites avec leur structure organisationnelle</p>
                </div>
              </div>
            </div>

            <ListeUsines usines={usinesAvecStructures} perimetres={perimetres} />
          </div>
        </main>
      </div>
    </div>
  )
}

