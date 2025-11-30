import { prisma } from '@/lib/prisma'
import { Users, Wrench, TrendingUp, Building2 } from 'lucide-react'
import StatPersonnel from './StatPersonnel'
import StatInterventions from './StatInterventions'
import StatSpecifiques from './StatSpecifiques'

interface TableauBordAccueilProps {
  userId: string
}

export default async function TableauBordAccueil({ userId }: TableauBordAccueilProps) {
  // Récupérer l'utilisateur pour connaître son périmètre/RDC
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      salarie: true
    }
  })

  // Récupérer le périmètre si disponible
  const perimetre = await prisma.perimetre.findFirst({
    where: { actif: true }
  })

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Tableau de bord</h2>
          <p className="text-sm text-gray-500 mt-1">Vue d'ensemble du périmètre</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Statistiques du personnel */}
        <StatPersonnel perimetreId={perimetre?.id} />

        {/* Interventions en cours */}
        <StatInterventions perimetreId={perimetre?.id} />
      </div>

      {/* Statistiques spécifiques */}
      <StatSpecifiques />
    </div>
  )
}
