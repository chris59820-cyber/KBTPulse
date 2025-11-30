import SidebarWrapper from '@/components/SidebarWrapper'
import Header from '@/components/Header'
import { requireSpace } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'
import { Users, Plus } from 'lucide-react'
import Link from 'next/link'
import ListeSalariesWrapper from '@/components/configuration/ListeSalariesWrapper'

export default async function ConfigurationSalariesPage() {
  await requireSpace('CONFIGURATION')

  const salaries = await prisma.salarie.findMany({
    orderBy: { nom: 'asc' },
    include: {
      user: true
    }
  })

  const perimetres = await prisma.perimetre.findMany({
    where: { actif: true },
    orderBy: { nom: 'asc' }
  })

  return (
    <div className="flex h-screen overflow-hidden">
      <SidebarWrapper />
      
      <div className="flex-1 flex flex-col lg:ml-52">
        <Header title="Gestion des profils salariés" perimetres={perimetres} />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Users className="text-primary-600" size={32} />
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Gestion des profils salariés</h2>
                  <p className="text-gray-600">Gérer les informations personnelles et professionnelles</p>
                </div>
              </div>
            </div>

            <ListeSalariesWrapper salaries={salaries} perimetres={perimetres} />
          </div>
        </main>
      </div>
    </div>
  )
}
