import { prisma } from '@/lib/prisma'
import { Building2, Wrench, TrendingUp } from 'lucide-react'

export default async function StatSpecifiques() {
  // Récupérer les interventions spécifiques
  const interventionsEchafaudage = await prisma.intervention.count({
    where: {
      type: 'echafaudage'
    }
  })

  const interventionsCalorifuge = await prisma.intervention.count({
    where: {
      type: 'calorifuge'
    }
  })

  // Interventions échafaudage par statut
  const echafaudageParStatut = {
    en_cours: await prisma.intervention.count({
      where: { type: 'echafaudage', statut: 'en_cours' }
    }),
    diagnostique: await prisma.intervention.count({
      where: { type: 'echafaudage', statut: 'diagnostique' }
    }),
    terminee: await prisma.intervention.count({
      where: { type: 'echafaudage', statut: 'terminee' }
    }),
  }

  // Interventions calorifuge par statut
  const calorifugeParStatut = {
    en_cours: await prisma.intervention.count({
      where: { type: 'calorifuge', statut: 'en_cours' }
    }),
    diagnostique: await prisma.intervention.count({
      where: { type: 'calorifuge', statut: 'diagnostique' }
    }),
    terminee: await prisma.intervention.count({
      where: { type: 'calorifuge', statut: 'terminee' }
    }),
  }

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistiques spécifiques</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Statistiques échafaudage */}
        <div className="border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="text-primary-600" size={24} />
            <h4 className="text-base font-semibold text-gray-900">Échafaudage</h4>
          </div>

          <div className="mb-4 p-3 bg-primary-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Total interventions</p>
            <p className="text-2xl font-bold text-primary-600">{interventionsEchafaudage}</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">En cours</span>
              <span className="text-sm font-semibold text-blue-600">{echafaudageParStatut.en_cours}</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Diagnostiqué</span>
              <span className="text-sm font-semibold text-yellow-600">{echafaudageParStatut.diagnostique}</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Terminé</span>
              <span className="text-sm font-semibold text-green-600">{echafaudageParStatut.terminee}</span>
            </div>
          </div>
        </div>

        {/* Statistiques calorifuge */}
        <div className="border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Wrench className="text-primary-600" size={24} />
            <h4 className="text-base font-semibold text-gray-900">Calorifuge</h4>
          </div>

          <div className="mb-4 p-3 bg-primary-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Total interventions</p>
            <p className="text-2xl font-bold text-primary-600">{interventionsCalorifuge}</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">En cours</span>
              <span className="text-sm font-semibold text-blue-600">{calorifugeParStatut.en_cours}</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Diagnostiqué</span>
              <span className="text-sm font-semibold text-yellow-600">{calorifugeParStatut.diagnostique}</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Terminé</span>
              <span className="text-sm font-semibold text-green-600">{calorifugeParStatut.terminee}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
