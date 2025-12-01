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
      perimetre: true
    },
    orderBy: { nom: 'asc' }
  })

  // Pour l'instant, les structures organisationnelles ne sont pas disponibles
  // TODO: Ajouter les modèles et relations nécessaires dans le schéma Prisma
  const usinesAvecStructures = usines.map((usine) => ({
    ...usine,
    structures: [] // Structures temporairement désactivées
  }))

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

