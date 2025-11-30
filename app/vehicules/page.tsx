import SidebarWrapper from '@/components/SidebarWrapper'
import Header from '@/components/Header'
import { requireAuth } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'
import { formatDate } from '@/lib/utils'
import { Plus, Truck, Car, Wrench, Calendar, MapPin, CheckCircle, AlertCircle, XCircle } from 'lucide-react'
import Link from 'next/link'

const vehiculeIcons: Record<string, any> = {
  Voiture: Car,
  Camion: Truck,
  Engin: Wrench
}

const statutBadges: Record<string, { label: string; class: string }> = {
  disponible: { label: 'Disponible', class: 'badge-success' },
  en_utilisation: { label: 'En utilisation', class: 'badge-info' },
  maintenance: { label: 'Maintenance', class: 'badge-warning' },
  hors_service: { label: 'Hors service', class: 'badge-danger' }
}

export default async function VehiculesPage() {
  const user = await requireAuth()
  
  const vehicules = await prisma.vehicule.findMany({
    include: {
      affectations: {
        where: {
          dateRestitution: null // Affectations actives uniquement
        },
        include: {
          salarie: {
            select: {
              id: true,
              nom: true,
              prenom: true,
              photoUrl: true
            }
          },
          intervention: {
            select: {
              id: true,
              titre: true
            }
          }
        },
        take: 1
      },
      _count: {
        select: {
          historiques: true,
          documents: true
        }
      }
    },
    orderBy: { immatriculation: 'asc' }
  })

  const perimetres = await prisma.perimetre.findMany({
    where: { actif: true },
    orderBy: { nom: 'asc' }
  })

  return (
    <div className="flex h-screen overflow-hidden">
      <SidebarWrapper />
      
      <div className="flex-1 flex flex-col lg:ml-52">
        <Header 
          title="Gestion des véhicules" 
          perimetres={perimetres}
        />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Liste des véhicules</h2>
            {user && user.role !== 'OUVRIER' && (
              <Link href="/vehicules/nouveau" className="btn btn-primary flex items-center gap-2">
                <Plus size={20} />
                Nouveau véhicule
              </Link>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicules.map((vehicule) => {
              const Icon = vehiculeIcons[vehicule.type] || Truck
              const affectationActive = vehicule.affectations[0]
              
              return (
                <Link
                  key={vehicule.id}
                  href={`/vehicules/${vehicule.id}`}
                  className="card hover:shadow-lg transition-shadow cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-primary-100 rounded-lg">
                        <Icon className="text-primary-600" size={24} />
                      </div>
                      <div>
                        <h3 className="card-title">{vehicule.immatriculation}</h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {vehicule.type}
                          {vehicule.marque && vehicule.modele && (
                            <> - {vehicule.marque} {vehicule.modele}</>
                          )}
                        </p>
                      </div>
                    </div>
                    <span className={statutBadges[vehicule.statut]?.class || 'badge-warning'}>
                      {statutBadges[vehicule.statut]?.label || vehicule.statut}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600">
                    {vehicule.kilometrage !== null && vehicule.kilometrage !== undefined && (
                      <div className="flex items-center gap-2">
                        <MapPin size={14} />
                        <span>{vehicule.kilometrage.toLocaleString('fr-FR')} km</span>
                      </div>
                    )}
                    
                    {affectationActive && (
                      <div className="flex items-center gap-2 text-primary-600">
                        {affectationActive.salarie ? (
                          <>
                            <Calendar size={14} />
                            <span>
                              Affecté à {affectationActive.salarie.prenom} {affectationActive.salarie.nom}
                            </span>
                          </>
                        ) : affectationActive.intervention ? (
                          <>
                            <Calendar size={14} />
                            <span>Affecté à l'intervention: {affectationActive.intervention.titre}</span>
                          </>
                        ) : null}
                      </div>
                    )}

                    <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-200">
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <CheckCircle size={12} />
                        <span>{vehicule._count.historiques} historique(s)</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <AlertCircle size={12} />
                        <span>{vehicule._count.documents} document(s)</span>
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>

          {vehicules.length === 0 && (
            <div className="card text-center py-12">
              <Truck className="mx-auto text-gray-400 mb-4" size={48} />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Aucun véhicule
              </h3>
              {user && user.role !== 'OUVRIER' ? (
                <>
                  <p className="text-gray-500 mb-6">
                    Commencez par ajouter votre premier véhicule
                  </p>
                  <Link href="/vehicules/nouveau" className="btn btn-primary inline-flex items-center gap-2">
                    <Plus size={20} />
                    Ajouter un véhicule
                  </Link>
                </>
              ) : (
                <p className="text-gray-500">
                  Aucun véhicule disponible pour le moment
                </p>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

