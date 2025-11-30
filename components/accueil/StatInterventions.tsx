import { prisma } from '@/lib/prisma'
import { Wrench, ChevronRight, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import * as DashboardCharts from '@/components/DashboardCharts'

interface StatInterventionsProps {
  perimetreId: string | undefined
}

export default async function StatInterventions({ perimetreId }: StatInterventionsProps) {
  // Récupérer les interventions
  const interventions = await prisma.intervention.findMany({
    where: {
      ...(perimetreId ? {
        chantier: {
          // Si on a un lien entre chantier et périmètre, l'ajouter ici
        }
      } : {})
    },
    include: {
      chantier: true,
      salarie: true
    }
  })

  // Compter par statut
  const parStatut = {
    en_cours: interventions.filter(i => i.statut === 'en_cours').length,
    diagnostique: interventions.filter(i => i.statut === 'diagnostique').length,
    terminee: interventions.filter(i => i.statut === 'terminee').length,
  }

  // Compter par métier
  const parMetier = interventions.reduce((acc, intervention) => {
    const metier = intervention.metier || 'Non défini'
    acc[metier] = (acc[metier] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Compter par RDC
  const parRDC = interventions.reduce((acc, intervention) => {
    const rdc = intervention.rdcId || 'Non affecté'
    acc[rdc] = (acc[rdc] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Vue hebdomadaire des interventions actives
  const maintenant = new Date()
  const debutSemaine = new Date(maintenant)
  debutSemaine.setDate(maintenant.getDate() - maintenant.getDay())
  debutSemaine.setHours(0, 0, 0, 0)

  const jours = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']
  const interventionsHebdo = []
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(debutSemaine)
    date.setDate(debutSemaine.getDate() + i)
    const dateFin = new Date(date)
    dateFin.setHours(23, 59, 59, 999)

    const count = interventions.filter(intervention => {
      if (!intervention.dateDebut) return false
      const dateDebut = new Date(intervention.dateDebut)
      return dateDebut >= date && dateDebut <= dateFin && 
             (intervention.statut === 'en_cours' || intervention.statut === 'diagnostique')
    }).length

    interventionsHebdo.push({
      name: jours[date.getDay()],
      interventions: count
    })
  }

  return (
    <div className="border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Wrench className="text-primary-600" size={24} />
          <h3 className="text-lg font-semibold text-gray-900">Interventions en cours</h3>
        </div>
        <Link
          href="/interventions"
          className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
        >
          Voir tout
          <ChevronRight size={16} />
        </Link>
      </div>

      {/* Statistiques par statut */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-3 bg-blue-50 rounded-lg text-center">
          <p className="text-xs text-gray-600 mb-1">En cours</p>
          <p className="text-2xl font-bold text-blue-600">{parStatut.en_cours}</p>
        </div>
        <div className="p-3 bg-yellow-50 rounded-lg text-center">
          <p className="text-xs text-gray-600 mb-1">Diagnostiqué</p>
          <p className="text-2xl font-bold text-yellow-600">{parStatut.diagnostique}</p>
        </div>
        <div className="p-3 bg-green-50 rounded-lg text-center">
          <p className="text-xs text-gray-600 mb-1">Terminé</p>
          <p className="text-2xl font-bold text-green-600">{parStatut.terminee}</p>
        </div>
      </div>

      {/* Vue hebdomadaire */}
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Vue hebdomadaire des interventions actives</h4>
        <div className="h-48">
          <DashboardCharts.InterventionsHebdo data={interventionsHebdo} />
        </div>
      </div>

      {/* Par métier et RDC */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Par métier</h4>
          <div className="space-y-1">
            {Object.entries(parMetier).slice(0, 3).map(([metier, count]) => (
              <div key={metier} className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{metier}</span>
                <span className="font-semibold text-gray-900">{count}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Par RDC</h4>
          <div className="space-y-1">
            {Object.entries(parRDC).slice(0, 3).map(([rdc, count]) => (
              <div key={rdc} className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{rdc}</span>
                <span className="font-semibold text-gray-900">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
