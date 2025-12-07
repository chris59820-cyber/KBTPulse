import SidebarWrapper from '@/components/SidebarWrapper'
import Header from '@/components/Header'
import { requireSpace } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'
import { Database, Plus, Edit, Trash2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import GestionTableauDB from '@/components/configuration/base-de-donnees/GestionTableauDB'

interface PageProps {
  params: Promise<{
    model: string
  }>
}

export default async function GestionTableauPage(props: PageProps) {
  await requireSpace('CONFIGURATION')
  const params = await props.params
  const modelName = params.model

  // Convertir le nom du modèle en format Prisma (première lettre en majuscule)
  const modelNameFormatted = modelName.charAt(0).toUpperCase() + modelName.slice(1)

  const perimetres = await prisma.perimetre.findMany({
    where: { actif: true },
    orderBy: { nom: 'asc' }
  })

  return (
    <div className="flex h-screen overflow-hidden">
      <SidebarWrapper />
      
      <div className="flex-1 flex flex-col lg:ml-52">
        <Header title={`Gestion: ${modelNameFormatted}`} perimetres={perimetres} />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Link
                  href="/configuration/base-de-donnees"
                  className="text-primary-600 hover:text-primary-700"
                >
                  <ArrowLeft size={20} />
                </Link>
                <Database className="text-primary-600" size={32} />
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{modelNameFormatted}</h2>
                  <p className="text-gray-600">Gestion des données de la table {modelNameFormatted}</p>
                </div>
              </div>
            </div>

            <GestionTableauDB modelName={modelNameFormatted} />
          </div>
        </main>
      </div>
    </div>
  )
}



