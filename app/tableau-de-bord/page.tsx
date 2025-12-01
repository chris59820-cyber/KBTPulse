export const dynamic = 'force-dynamic'

import SidebarWrapper from '@/components/SidebarWrapper'
import Header from '@/components/Header'
import MetricCard from '@/components/MetricCard'
import ChartCard from '@/components/ChartCard'
import { 
  Users, 
  Building2, 
  Wrench, 
  Package,
  TrendingUp,
  Clock
} from 'lucide-react'
import { prisma } from '@/lib/prisma'
import * as DashboardCharts from '@/components/DashboardCharts'
import { requireAuth } from '@/lib/middleware'
import { redirect } from 'next/navigation'

export default async function TableauDeBordPage() {
  const user = await requireAuth()
  
  if (!user) {
    redirect('/connexion')
  }

  // Récupération des données pour les métriques
  const [stats, perimetres] = await Promise.all([
    getDashboardStats(),
    prisma.perimetre.findMany({
      where: { actif: true },
      orderBy: { nom: 'asc' }
    })
  ])

  return (
    <div className="flex h-screen overflow-hidden">
      <SidebarWrapper />
      
      <div className="flex-1 flex flex-col lg:ml-52">
        <Header 
          title={`Tableau de bord - ${user.prenom || user.identifiant}`} 
          perimetres={perimetres}
        />
        
        <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6">
          {/* Filtre de temps */}
          <div className="mb-4 sm:mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select className="w-full sm:w-auto px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
                <option>Dernières 24 heures</option>
                <option>Dernière semaine</option>
                <option>Dernier mois</option>
                <option>Dernier trimestre</option>
              </select>
            </div>
          </div>

          {/* Cartes de métriques principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <MetricCard
              title="Chantiers actifs"
              value={stats.chantiersActifs}
              subtitle={`${stats.chantiersTotal} au total`}
              icon={<Building2 className="text-primary-600" size={24} />}
            />
            <MetricCard
              title="Salariés"
              value={stats.salariesActifs}
              subtitle={`${stats.salariesTotal} au total`}
              icon={<Users className="text-primary-600" size={24} />}
            />
            <MetricCard
              title="Interventions"
              value={stats.interventionsEnCours}
              subtitle={`${stats.interventionsTotal} au total`}
              icon={<Wrench className="text-primary-600" size={24} />}
            />
            <MetricCard
              title="Matériel disponible"
              value={stats.materielDisponible}
              subtitle={`${stats.materielTotal} au total`}
              icon={<Package className="text-primary-600" size={24} />}
            />
          </div>

          {/* Graphiques principaux */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <ChartCard title="Activité des chantiers" subtitle="Répartition par statut">
              <DashboardCharts.ActiviteChantiers data={stats.chantiersParStatut} />
            </ChartCard>

            <ChartCard title="Interventions en cours" subtitle="Suivi hebdomadaire">
              <DashboardCharts.InterventionsHebdo data={stats.interventionsHebdo} />
            </ChartCard>
          </div>

          {/* Autres métriques */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <ChartCard title="Performance" subtitle="Taux de disponibilité moyen">
              <div className="flex items-center justify-center h-48">
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary-600 mb-2">
                    {stats.tauxDisponibilite}%
                  </div>
                  <div className="flex items-center gap-2 text-green-600">
                    <TrendingUp size={16} />
                    <span className="text-sm">+2.5% vs mois dernier</span>
                  </div>
                </div>
              </div>
            </ChartCard>

            <ChartCard title="Utilisation des ressources" subtitle="Salariés et matériel">
              <DashboardCharts.UtilisationRessources 
                salariesUtilisation={stats.salariesUtilisation}
                materielUtilisation={stats.materielUtilisation}
              />
            </ChartCard>

            <ChartCard title="Temps moyen d'intervention" subtitle="Durée moyenne">
              <div className="flex items-center justify-center h-48">
                <div className="text-center">
                  <div className="text-4xl font-bold text-gray-900 mb-2">
                    {stats.tempsMoyenIntervention}h
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock size={16} />
                    <span className="text-sm">Par intervention</span>
                  </div>
                </div>
              </div>
            </ChartCard>
          </div>
        </main>
      </div>
    </div>
  )
}

async function getDashboardStats() {
  try {
    const [
      chantiersTotal,
      chantiersActifs,
      salariesTotal,
      salariesActifs,
      interventionsTotal,
      interventionsEnCours,
      materielTotal,
      materielDisponible,
      chantiersParStatut,
    ] = await Promise.all([
      prisma.chantier.count(),
      prisma.chantier.count({ where: { statut: 'en_cours' } }),
      prisma.salarie.count(),
      prisma.salarie.count({ where: { statut: 'actif' } }),
      prisma.intervention.count(),
      prisma.intervention.count({ where: { statut: 'en_cours' } }),
      prisma.materiel.count(),
      prisma.materiel.count({ where: { statut: 'disponible' } }),
      prisma.chantier.groupBy({
        by: ['statut'],
        _count: true
      }),
    ])

    return {
      chantiersTotal,
      chantiersActifs,
      salariesTotal,
      salariesActifs,
      interventionsTotal,
      interventionsEnCours,
      materielTotal,
      materielDisponible,
      chantiersParStatut: chantiersParStatut.map(c => ({
        statut: c.statut,
        count: c._count
      })),
      interventionsHebdo: [],
      tauxDisponibilite: 87.5,
      salariesUtilisation: 75,
      materielUtilisation: 62,
      tempsMoyenIntervention: 4.5
    }
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return {
      chantiersTotal: 0,
      chantiersActifs: 0,
      salariesTotal: 0,
      salariesActifs: 0,
      interventionsTotal: 0,
      interventionsEnCours: 0,
      materielTotal: 0,
      materielDisponible: 0,
      chantiersParStatut: [],
      interventionsHebdo: [],
      tauxDisponibilite: 0,
      salariesUtilisation: 0,
      materielUtilisation: 0,
      tempsMoyenIntervention: 0
    }
  }
}
