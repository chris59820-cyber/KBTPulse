import SidebarWrapper from '@/components/SidebarWrapper'
import Header from '@/components/Header'
import { requireAuth } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'
import { Plus, Wrench } from 'lucide-react'
import Link from 'next/link'
import FiltresInterventions from '@/components/interventions/FiltresInterventions'
import InterventionsList from '@/components/interventions/InterventionsList'

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
      where.chantier.client = {
        nom: { contains: searchParams.client }
      }
    }
    if (searchParams.numeroCommande) {
      where.chantier.numeroCommande = { contains: searchParams.numeroCommande }
    }
  }
  
  if (searchParams.codeAffaire) {
    // Filtrer par code affaire via le chantier
    where.chantier = {
      ...where.chantier,
      codeAffaire: {
        id: searchParams.codeAffaire
      }
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
        client: {
          select: {
            id: true,
            nom: true
          }
        },
        codeAffaire: {
          select: {
            id: true,
            code: true,
            activite: true
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
  
  // Extraire les activités uniques
  const activites = Array.from(new Set(
    allChantiers
      .map(c => c.codeAffaire?.activite)
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
                    codeAffaire: true,
                    client: {
                      select: {
                        id: true,
                        nom: true
                      }
                    }
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
      orderBy: [
        {
          intervention: {
            ordre: 'asc'
          }
        },
        {
          intervention: {
            createdAt: 'desc'
          }
        }
      ]
    })

    // Extraire les interventions des affectations
    interventions = affectations.map(aff => aff.intervention)
  } else {
    // Pour les autres rôles, afficher toutes les interventions
    interventions = await prisma.intervention.findMany({
      where,
      include: {
        chantier: {
          include: {
            codeAffaire: true,
            client: {
              select: {
                id: true,
                nom: true
              }
            }
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
      orderBy: [
        { ordre: 'asc' },
        { createdAt: 'desc' }
      ]
    })
    }
    
    // Filtrer par activité si spécifié (côté serveur après récupération)
    if (searchParams.activite) {
      interventions = interventions.filter(intervention =>
        intervention.chantier?.codeAffaire?.activite === searchParams.activite
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
    <div>
      <h2 className="text-2xl font-bold text-gray-900">
        {user?.role === 'OUVRIER'
          ? 'Mes interventions'
          : 'Liste des interventions'}
      </h2>
      {interventions.length > 0 && (
        <p className="text-sm text-gray-500 mt-1">
          {interventions.length} intervention{interventions.length > 1 ? 's' : ''} trouvée{interventions.length > 1 ? 's' : ''}
        </p>
      )}
    </div>

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

          <InterventionsList 
            interventions={interventions} 
            canReorder={user?.role !== 'OUVRIER'}
          />

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

