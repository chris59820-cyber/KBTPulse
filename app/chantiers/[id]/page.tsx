import SidebarWrapper from '@/components/SidebarWrapper'
import Header from '@/components/Header'
import { requireAuth } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'
import { formatDate } from '@/lib/utils'
import { Building2, MapPin, Calendar, Wrench, Plus, ArrowLeft, Edit } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import BoutonSupprimerChantier from '@/components/chantiers/BoutonSupprimerChantier'
import InterventionsListChantier from '@/components/chantiers/InterventionsListChantier'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

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

export default async function ChantierDetailPage(props: PageProps) {
  const user = await requireAuth()
  const params = await props.params

  // Récupérer le chantier avec ses interventions
  const chantier = await prisma.chantier.findUnique({
    where: { id: params.id },
    include: {
      client: true,
      interventions: {
        include: {
          responsable: {
            select: {
              id: true,
              nom: true,
              prenom: true
            }
          },
          rdc: {
            select: {
              id: true,
              nom: true,
              prenom: true
            }
          },
          affectationsIntervention: {
            where: { actif: true },
            include: {
              salarie: {
                select: {
                  id: true,
                  nom: true,
                  prenom: true,
                  photoUrl: true
                }
              }
            }
          }
        },
        orderBy: [
          { ordre: 'asc' },
          { createdAt: 'desc' }
        ]
      },
      _count: {
        select: {
          interventions: true
        }
      }
    }
  })

  if (!chantier) {
    notFound()
  }

  const perimetres = await prisma.perimetre.findMany({
    where: { actif: true },
    orderBy: { nom: 'asc' }
  })

  // Masquer le bouton "Nouvelle intervention" pour les ouvriers
  const canCreateIntervention = user && user.role !== 'OUVRIER'
  
  // Masquer le bouton "Modifier" pour les ouvriers
  const canEditChantier = user && user.role !== 'OUVRIER'
  
  // Masquer le bouton "Supprimer" pour les ouvriers et les RDC
  const canDeleteChantier = !!(user && ['PREPA', 'CE', 'CAFF', 'ADMIN'].includes(user.role))

  // Statistiques des interventions
  const statsInterventions = {
    total: chantier._count.interventions,
    planifiee: chantier.interventions.filter(i => i.statut === 'planifiee').length,
    en_cours: chantier.interventions.filter(i => i.statut === 'en_cours').length,
    terminee: chantier.interventions.filter(i => i.statut === 'terminee').length,
    annulee: chantier.interventions.filter(i => i.statut === 'annulee').length
  }

  const statutColors: Record<string, string> = {
    planifiee: 'bg-blue-100 text-blue-800',
    en_cours: 'bg-green-100 text-green-800',
    terminee: 'bg-gray-100 text-gray-800',
    annulee: 'bg-red-100 text-red-800',
    diagnostique: 'bg-yellow-100 text-yellow-800'
  }

  const statutLabels: Record<string, string> = {
    planifiee: 'Planifiée',
    en_cours: 'En cours',
    terminee: 'Terminée',
    annulee: 'Annulée',
    diagnostique: 'Diagnostique'
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <SidebarWrapper />
      
      <div className="flex-1 flex flex-col lg:ml-52">
        <Header 
          title={chantier.nom}
          perimetres={perimetres}
        />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Bouton retour */}
            <Link 
              href="/chantiers" 
              className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft size={16} />
              Retour à la liste des chantiers
            </Link>

            {/* Informations du chantier */}
            <div className="card">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-primary-100 rounded-lg">
                    <Building2 className="text-primary-600" size={32} />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">{chantier.nom}</h1>
                    {chantier.client && (
                      <p className="text-gray-600 mt-1">Client: {chantier.client.nom}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`badge ${
                    chantier.statut === 'en_attente' ? 'badge-warning' :
                    chantier.statut === 'en_cours' ? 'badge-info' :
                    chantier.statut === 'termine' ? 'badge-success' :
                    chantier.statut === 'annule' ? 'badge-danger' :
                    'badge-warning'
                  }`}>
                    {formatStatut(chantier.statut)}
                  </span>
                  <div className="flex items-center gap-2">
                    {canEditChantier && (
                      <Link
                        href={`/chantiers/${chantier.id}/modifier`}
                        className="btn btn-secondary flex items-center gap-2"
                      >
                        <Edit size={18} />
                        Modifier
                      </Link>
                    )}
                    <BoutonSupprimerChantier
                      chantierId={chantier.id}
                      chantierNom={chantier.nom}
                      canDelete={canDeleteChantier}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {chantier.adresse && (
                  <div className="flex items-start gap-3">
                    <MapPin className="text-gray-400 mt-1" size={20} />
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Adresse</p>
                      <p className="text-gray-900">{chantier.adresse}</p>
                    </div>
                  </div>
                )}

                {chantier.dateDebut && (
                  <div className="flex items-start gap-3">
                    <Calendar className="text-gray-400 mt-1" size={20} />
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Date de début</p>
                      <p className="text-gray-900">{formatDate(chantier.dateDebut)}</p>
                    </div>
                  </div>
                )}

                {chantier.budget && (
                  <div className="flex items-start gap-3">
                    <Building2 className="text-gray-400 mt-1" size={20} />
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Budget</p>
                      <p className="text-gray-900 font-semibold">
                        {new Intl.NumberFormat('fr-FR', {
                          style: 'currency',
                          currency: 'EUR'
                        }).format(chantier.budget)}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {chantier.description && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <p className="text-sm text-gray-500 mb-2">Description</p>
                  <p className="text-gray-900">{chantier.description}</p>
                </div>
              )}
            </div>

            {/* Statistiques des interventions */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="card text-center">
                <p className="text-2xl font-bold text-gray-900">{statsInterventions.total}</p>
                <p className="text-sm text-gray-600 mt-1">Total</p>
              </div>
              <div className="card text-center">
                <p className="text-2xl font-bold text-blue-600">{statsInterventions.planifiee}</p>
                <p className="text-sm text-gray-600 mt-1">Planifiées</p>
              </div>
              <div className="card text-center">
                <p className="text-2xl font-bold text-green-600">{statsInterventions.en_cours}</p>
                <p className="text-sm text-gray-600 mt-1">En cours</p>
              </div>
              <div className="card text-center">
                <p className="text-2xl font-bold text-gray-600">{statsInterventions.terminee}</p>
                <p className="text-sm text-gray-600 mt-1">Terminées</p>
              </div>
              <div className="card text-center">
                <p className="text-2xl font-bold text-red-600">{statsInterventions.annulee}</p>
                <p className="text-sm text-gray-600 mt-1">Annulées</p>
              </div>
            </div>

            {/* Liste des interventions */}
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Wrench size={24} />
                  Interventions ({statsInterventions.total})
                </h2>
                {canCreateIntervention && (
                  <Link 
                    href={`/interventions/nouvelle?chantierId=${chantier.id}`}
                    className="btn btn-primary flex items-center gap-2"
                  >
                    <Plus size={18} />
                    Nouvelle intervention
                  </Link>
                )}
              </div>

              {chantier.interventions.length === 0 ? (
                <div className="text-center py-12">
                  <Wrench className="mx-auto text-gray-400 mb-4" size={48} />
                  <p className="text-gray-500 mb-4">Aucune intervention pour ce chantier</p>
                  {canCreateIntervention && (
                    <Link 
                      href={`/interventions/nouvelle?chantierId=${chantier.id}`}
                      className="btn btn-primary inline-flex items-center gap-2"
                    >
                      <Plus size={18} />
                      Créer la première intervention
                    </Link>
                  )}
                </div>
              ) : (
                <InterventionsListChantier
                  interventions={chantier.interventions}
                  canReorder={user?.role !== 'OUVRIER'}
                  statutColors={statutColors}
                  statutLabels={statutLabels}
                />
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

