import SidebarWrapper from '@/components/SidebarWrapper'
import Header from '@/components/Header'
import { requireSpace } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'
import { MapPin, Save } from 'lucide-react'
import FormConfigurationPerimetre from '@/components/configuration/FormConfigurationPerimetre'

export default async function ConfigurationPerimetrePage() {
  await requireSpace('CONFIGURATION')

  const perimetres = await prisma.perimetre.findMany({
    where: { actif: true },
    orderBy: { nom: 'asc' }
  })

  return (
    <div className="flex h-screen overflow-hidden">
      <SidebarWrapper />
      
      <div className="flex-1 flex flex-col lg:ml-52">
        <Header title="Configuration du périmètre" perimetres={perimetres} />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <MapPin className="text-primary-600" size={32} />
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Configuration du périmètre</h2>
                  <p className="text-gray-600">Saisissez l'adresse et les coordonnées GPS du périmètre</p>
                </div>
              </div>
            </div>

            <div className="card mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Nouveau périmètre</h3>
              <FormConfigurationPerimetre />
            </div>

            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Périmètres existants</h3>
              <div className="space-y-4">
                {perimetres.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Aucun périmètre configuré</p>
                ) : (
                  perimetres.map((perimetre) => (
                    <div
                      key={perimetre.id}
                      className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-gray-900 mb-2">
                            {perimetre.nom}
                          </h4>
                          <p className="text-sm text-gray-600 mb-1">
                            <MapPin size={16} className="inline mr-1" />
                            {perimetre.adresse}
                          </p>
                          {perimetre.ville && (
                            <p className="text-sm text-gray-600">
                              {perimetre.ville} {perimetre.codePostal}
                            </p>
                          )}
                          {perimetre.latitude && perimetre.longitude && (
                            <p className="text-xs text-gray-500 mt-2">
                              GPS: {perimetre.latitude.toFixed(6)}, {perimetre.longitude.toFixed(6)}
                            </p>
                          )}
                        </div>
                        <FormConfigurationPerimetre perimetre={perimetre} />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
