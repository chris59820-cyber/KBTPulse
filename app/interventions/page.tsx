import SidebarWrapper from '@/components/SidebarWrapper'
import Header from '@/components/Header'
import { requireAuth } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'
import { formatDateTime } from '@/lib/utils'
import { Plus, Wrench, Calendar, Building2, User, FileText, Briefcase } from 'lucide-react'
import Link from 'next/link'
import FiltresInterventions from '@/components/interventions/FiltresInterventions'

interface PageProps {
  searchParams: Promise<{
    rdcId?: string
    site?: string
    secteur?: string
    statut?: string
    client?: string
    activite?: string
    numeroCommande?: string
    numeroDevis?: string
    codeAffaire?: string
  }>
}

export default async function InterventionsPage(props: PageProps) {
  const user = await requireAuth()
  const searchParams = await props.searchParams
  
  // Construire les conditions de filtrage
  const where: any = {}
  
  if (searchParams.rdcId) {
    where.rdcId = searchParams.rdcId
  }
  
  if (searchParams.statut) {
    where.statut = searchParams.statut
  }
  
  if (searchParams.site) {
    // Trouver le nom du site à partir de l'ID
    const usine = await prisma.usine.findUnique({
      where: { id: searchParams.site },
      select: { nom: true }
    })
    if (usine) {
      where.usine = usine.nom
    }
  }
  
  if (searchParams.secteur) {
    // Trouver le nom du secteur à partir de l'ID
    const secteur = await prisma.structureOrganisationnelle.findUnique({
      where: { id: searchParams.secteur },
      select: { nom: true }
    })
    if (secteur) {
      where.secteur = secteur.nom
    }
  }
  
  if (searchParams.client || searchParams.numeroCommande) {
    where.chantier = {}
    if (searchParams.client) {
      where.chantier.client = { contains: searchParams.client }
    }
    if (searchParams.numeroCommande) {
      where.chantier.numeroCommande = { contains: searchParams.numeroCommande }
    }
  }
  
  if (searchParams.codeAffaire) {
    // Filtrer par code affaire via le chantier
    where.chantier = {
      ...where.chantier,
      codeAffaireId: searchParams.codeAffaire
    }
  }
  
  // Récupérer les données pour les filtres
  const [rdcs, usines, allChantiers] = await Promise.all([
    prisma.salarie.findMany({
      where: {
        statut: 'actif',
        OR: [
          { niveauAcces: 'RDC' },
          { poste: { contains: 'responsable de chantier' } }
        ]
      },
      orderBy: { nom: 'asc' },
      select: {
        id: true,
        nom: true,
        prenom: true,
        poste: true
      }
    }),
    prisma.usine.findMany({
      orderBy: { nom: 'asc' },
      select: {
        id: true,
        nom: true
      }
    }),
    prisma.chantier.findMany({
      select: {
        id: true,
        client: true,
        codeAffaire: {
          select: {
            id: true,
            code: true,
            description: true
          }
        }
      }
    })
  ])
  
  // Récupérer les secteurs en fonction du site sélectionné
  let secteurs: Array<{id: string, nom: string}> = []
  if (searchParams.site) {
    const structures = await prisma.structureOrganisationnelle.findMany({
      where: {
        usineId: searchParams.site,
        type: 'secteur',
        actif: true,
        parentId: null
      },
      select: {
        id: true,
        nom: true
      },
      orderBy: { nom: 'asc' }
    })
    secteurs = structures
  }
  
  // Extraire les clients uniques
  const clients = Array.from(new Set(
    allChantiers
      .map(c => c.client?.nom)
      .filter((c): c is string => !!c)
  )).sort()
  
  // Extraire les activités uniques (utiliser la description du code affaire)
  const activites = Array.from(new Set(
    allChantiers
      .map(c => c.codeAffaire?.description)
      .filter((a): a is string => !!a)
  )).sort()
  
  // Extraire les codes affaire uniques
  const codesAffaire = Array.from(
    new Map(
      allChantiers
        .map(c => c.codeAffaire)
        .filter((ca): ca is NonNullable<typeof ca> => !!ca)
        .map(ca => [ca.id, ca])
    ).values()
  ).sort((a, b) => a.code.localeCompare(b.code))
  
  // Pour les ouvriers, afficher uniquement les interventions où ils sont affectés
  // Pour les autres rôles, afficher toutes les interventions
  let interventions: any[] = []

  try {
    if (user && user.role === 'OUVRIER' && user.salarieId) {
    // Récupérer uniquement les interventions où le salarié est affecté et actif
    const affectations = await prisma.affectationIntervention.findMany({
      where: {
        salarieId: user.salarieId,
        actif: true,
        OR: [
          { dateFin: null }, // Pas de date de fin
          { dateFin: { gte: new Date() } } // Date de fin dans le futur
        ],
        intervention: where // Appliquer les filtres
      },
      include: {
            intervention: {
              include: {
                chantier: {
                  include: {
                    codeAffaire: true
                  }
                },
                salarie: true,
                rdc: {
                  select: {
                    id: true,
                    nom: true,
                    prenom: true
                  }
                },
                codeAffaire: {
                  select: {
                    id: true,
                    code: true,
                    description: true
                  }
                },
                affectationsIntervention: {
                  where: {
                    actif: true
                  },
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
              }
            }
      },
      orderBy: {
        intervention: {
          createdAt: 'desc'
        }
      }
    })

    // Extraire les interventions des affectations
    interventions = affectations.map((aff: any) => aff.intervention)
  } else {
    // Pour les autres rôles, afficher toutes les interventions
    interventions = await prisma.intervention.findMany({
      where,
      include: {
        chantier: {
          include: {
            codeAffaire: true
          }
        },
        salarie: true,
        rdc: {
          select: {
            id: true,
            nom: true,
            prenom: true
          }
        },
        codeAffaire: {
          select: {
            id: true,
            code: true,
            description: true
          }
        },
        affectationsIntervention: {
          where: {
            actif: true
          },
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
      orderBy: { createdAt: 'desc' },
      take: 100
    })
    }
    
    // Filtrer par activité si spécifié (côté serveur après récupération)
    if (searchParams.activite) {
      interventions = interventions.filter(intervention =>
        intervention.chantier?.codeAffaire?.description === searchParams.activite
      )
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des interventions:', error)
    // En cas d'erreur, retourner un tableau vide pour éviter de casser la page
    interventions = []
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <SidebarWrapper />
      
      <div className="flex-1 flex flex-col lg:ml-52">
        <Header 
          title="Gestion des interventions" 
          perimetres={await prisma.perimetre.findMany({
            where: { actif: true },
            orderBy: { nom: 'asc' }
          })}
        />
        
        <main className="flex-1 overflow-y-auto p-6">
  <div className="flex items-center justify-between mb-6">
    <h2 className="text-2xl font-bold text-gray-900">
      {user?.role === 'OUVRIER'
        ? 'Mes interventions'
        : 'Liste des interventions'}
    </h2>

    {user?.role !== 'OUVRIER' && (
      <Link
        href="/interventions/nouvelle"
        className="btn btn-primary flex items-center gap-2"
      >
        <Plus size={20} />
        Nouvelle intervention
      </Link>
    )}
  </div>

  {/* Composant de filtres */}
  {user?.role !== 'OUVRIER' && (
    <FiltresInterventions
      rdcs={rdcs}
      usines={usines}
      secteurs={secteurs}
      clients={clients}
      activites={activites}
      codesAffaire={codesAffaire.map(ca => ({
        id: ca.id,
        code: ca.code,
      }))}
    />
  )}

          <div className="space-y-4">
            {interventions.map((intervention) => (
              <Link
                key={intervention.id}
                href={`/interventions/${intervention.id}`}
                className="card hover:shadow-lg transition-shadow cursor-pointer block"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="p-3 bg-primary-100 rounded-lg">
                      <Wrench className="text-primary-600" size={24} />
                    </div>
                    <div className="flex-1">
                      <h3 className="card-title mb-2">{intervention.titre}</h3>
                      {intervention.description && (
                        <p className="text-sm text-gray-600 mb-3">{intervention.description}</p>
                      )}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Building2 size={16} />
                          <span>{intervention.chantier.nom}</span>
                        </div>
                        {intervention.salarie && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <User size={16} />
                            <span>{intervention.salarie.prenom} {intervention.salarie.nom}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar size={16} />
                          <span>{intervention.dateDebut ? formatDateTime(intervention.dateDebut) : 'Non planifiée'}</span>
                        </div>
                      </div>
                      {(intervention.codeAffaire || intervention.rdc) && (
                        <div className="mt-3 flex items-center gap-4 flex-wrap text-sm">
                          {intervention.codeAffaire && (
                            <div className="flex items-center gap-2 text-gray-600">
                              <FileText size={16} className="text-gray-400" />
                              <span className="text-gray-500">Code affaire:</span>
                              <span className="font-medium">{intervention.codeAffaire.code} - {intervention.codeAffaire.description || ''}</span>
                            </div>
                          )}
                          {intervention.rdc && (
                            <div className="flex items-center gap-2 text-gray-600">
                              <Briefcase size={16} className="text-gray-400" />
                              <span className="text-gray-500">RDC:</span>
                              <span className="font-medium">{intervention.rdc.prenom} {intervention.rdc.nom}</span>
                            </div>
                          )}
                        </div>
                      )}
                      {intervention.duree && (
                        <div className="text-sm text-gray-600 mt-2">
                          Durée prévue: {intervention.duree}h
                        </div>
                      )}
                      {intervention.affectationsIntervention && intervention.affectationsIntervention.length > 0 && (
                        <div className="mt-3 flex items-center gap-2 flex-wrap">
                          <span className="text-xs text-gray-500">Équipe:</span>
                          {intervention.affectationsIntervention.slice(0, 5).map((aff: any) => (
                            <span key={aff.id} className="badge badge-info text-xs">
                              {aff.salarie.prenom} {aff.salarie.nom} ({aff.role === 'chef_equipe' ? 'Chef d\'équipe' : 'Ouvrier'})
                            </span>
                          ))}
                          {intervention.affectationsIntervention.length > 5 && (
                            <span className="text-xs text-gray-500">
                              +{intervention.affectationsIntervention.length - 5} autre(s)
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <span className={`badge ${
                    intervention.statut === 'terminee' ? 'badge-success' :
                    intervention.statut === 'en_cours' ? 'badge-info' :
                    intervention.statut === 'annulee' ? 'badge-danger' :
                    intervention.statut === 'en_attente' ? 'badge-warning' :
                    'badge-warning'
                  }`}>
                    {intervention.statut === 'planifiee' ? 'Planifiée' :
                     intervention.statut === 'en_attente' ? 'En attente' :
                     intervention.statut === 'en_cours' ? 'En cours' :
                     intervention.statut === 'terminee' ? 'Terminée' :
                     intervention.statut === 'annulee' ? 'Annulée' :
                     intervention.statut.replace('_', ' ')}
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {interventions.length === 0 && (
            <div className="card text-center py-12">
              <Wrench className="mx-auto text-gray-400 mb-4" size={48} />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Aucune intervention
              </h3>
              {user && user.role !== 'OUVRIER' ? (
                <>
                  <p className="text-gray-500 mb-6">
                    Commencez par créer votre première intervention
                  </p>
                  <Link href="/interventions/nouvelle" className="btn btn-primary inline-flex items-center gap-2">
                    <Plus size={20} />
                    Créer une intervention
                  </Link>
                </>
              ) : (
                <p className="text-gray-500">
                  Aucune intervention assignée pour le moment
                </p>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

