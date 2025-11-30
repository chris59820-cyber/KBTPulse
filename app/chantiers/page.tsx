import SidebarWrapper from '@/components/SidebarWrapper'
import Header from '@/components/Header'
import { requireAuth } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'
import { formatDate } from '@/lib/utils'
import { Plus, Building2, Calendar, User, MapPin, Wrench } from 'lucide-react'
import Link from 'next/link'

// Fonction pour formater le statut avec les accents et majuscules corrects
function formatStatut(statut: string): string {
  const statuts: Record<string, string> = {
    'planifie': 'Planifié',
    'en_attente': 'En attente',
    'en_cours': 'En cours',
    'termine': 'Terminé',
    'annule': 'Annulé'
  }
  return statuts[statut] || statut.replace('_', ' ')
}

export default async function ChantiersPage() {
  const user = await requireAuth()
  
  const chantiers = await prisma.chantier.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: {
      _count: {
        select: {
          interventions: true
        }
      }
    }
  })

  // Masquer le bouton "Nouveau chantier" pour les ouvriers
  const canCreateChantier = user && user.role !== 'OUVRIER'

  return (
    <div className="flex h-screen overflow-hidden">
      <SidebarWrapper />
      
      <div className="flex-1 flex flex-col lg:ml-52">
        <Header 
          title="Gestion des chantiers" 
          perimetres={await prisma.perimetre.findMany({
            where: { actif: true },
            orderBy: { nom: 'asc' }
          })}
        />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Liste des chantiers</h2>
            {canCreateChantier && (
              <Link href="/chantiers/nouveau" className="btn btn-primary flex items-center gap-2">
                <Plus size={20} />
                Nouveau chantier
              </Link>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {chantiers.map((chantier) => (
              <Link
                key={chantier.id}
                href={`/chantiers/${chantier.id}`}
                className="card hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-primary-100 rounded-lg">
                      <Building2 className="text-primary-600" size={24} />
                    </div>
                    <div>
                      <h3 className="card-title">{chantier.nom}</h3>
                      {chantier.client && (
                        <p className="text-sm text-gray-500 mt-1">{chantier.client}</p>
                      )}
                    </div>
                  </div>
                  <span className={`badge ${
                    chantier.statut === 'en_attente' ? 'badge-warning' :
                    chantier.statut === 'en_cours' ? 'badge-info' :
                    chantier.statut === 'termine' ? 'badge-success' :
                    chantier.statut === 'annule' ? 'badge-danger' :
                    'badge-warning'
                  }`}>
                    {formatStatut(chantier.statut)}
                  </span>
                </div>

                {chantier.adresse && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <MapPin size={16} />
                    <span>{chantier.adresse}</span>
                  </div>
                )}

                {chantier.dateDebut && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <Calendar size={16} />
                    <span>Début: {formatDate(chantier.dateDebut)}</span>
                  </div>
                )}

                <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
                  {chantier.budget && (
                    <div>
                      <p className="text-sm text-gray-500">Budget</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {new Intl.NumberFormat('fr-FR', {
                          style: 'currency',
                          currency: 'EUR'
                        }).format(chantier.budget)}
                      </p>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Wrench size={16} />
                    <span>{chantier._count?.interventions || 0} intervention{(chantier._count?.interventions || 0) > 1 ? 's' : ''}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {chantiers.length === 0 && (
            <div className="card text-center py-12">
              <Building2 className="mx-auto text-gray-400 mb-4" size={48} />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Aucun chantier
              </h3>
              {canCreateChantier ? (
                <>
                  <p className="text-gray-500 mb-6">
                    Commencez par créer votre premier chantier
                  </p>
                  <Link href="/chantiers/nouveau" className="btn btn-primary inline-flex items-center gap-2">
                    <Plus size={20} />
                    Créer un chantier
                  </Link>
                </>
              ) : (
                <p className="text-gray-500">
                  Aucun chantier disponible pour le moment
                </p>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
