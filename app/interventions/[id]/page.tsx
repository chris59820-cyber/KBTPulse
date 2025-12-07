import SidebarWrapper from '@/components/SidebarWrapper'
import Header from '@/components/Header'
import { requireAuth } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import DetailIntervention from '@/components/interventions/DetailIntervention'

interface PageProps {
  params: {
    id: string
  }
}

export default async function InterventionDetailPage({ params }: PageProps) {
  const user = await requireAuth()

  // Récupérer l'intervention avec toutes les informations
  const intervention = await prisma.intervention.findUnique({
    where: { id: params.id },
    include: {
      chantier: {
        select: {
          id: true,
          nom: true,
          adresse: true
        }
      },
      salarie: true,
      responsable: true,
      materielUtilise: {
        include: {
          materiel: true
        }
      },
      documentsIntervention: true,
      affectationsIntervention: {
        where: { actif: true },
        include: {
          salarie: {
            select: {
              id: true,
              nom: true,
              prenom: true,
              email: true,
              telephone: true,
              photoUrl: true,
              poste: true
            }
          }
        }
      },
      ressourcesIntervention: true,
      photosIntervention: true,
      autoControles: true,
      messagesIntervention: {
        include: {
          intervention: false
        },
        orderBy: { createdAt: 'desc' },
        take: 50
      },
      checklistSecurite: true
    }
  })

  if (!intervention) {
    notFound()
  }

  // Récupérer le RDC si défini
  let rdc = null
  if (intervention.rdcId) {
    rdc = await prisma.salarie.findUnique({
      where: { id: intervention.rdcId },
      select: {
        id: true,
        nom: true,
        prenom: true,
        email: true,
        telephone: true,
        poste: true
      }
    })
  }

  // Récupérer le code affaire si défini
  let codeAffaire = null
  if ((intervention as any).codeAffaireId) {
    codeAffaire = await prisma.codeAffaire.findUnique({
      where: { id: (intervention as any).codeAffaireId },
      select: {
        id: true,
        code: true,
        description: true
      }
    })
  }

  // Ajouter le RDC et le code affaire à l'objet intervention
  // Sérialiser les dates pour éviter les problèmes de sérialisation
  const interventionWithRdc = {
    ...intervention,
    rdc: rdc,
    codeAffaire: codeAffaire,
    // S'assurer que le chantier ne contient que les champs nécessaires
    chantier: intervention.chantier ? {
      id: intervention.chantier.id,
      nom: intervention.chantier.nom,
      adresse: intervention.chantier.adresse
    } : null
  }

  // Vérifier les droits d'accès
  // Accès : PREPA, CE, RDC, CAFF, Ouvriers affectés à cette intervention
  const hasAccess = user && (
    ['PREPA', 'CE', 'RDC', 'CAFF', 'ADMIN'].includes(user.role) ||
    intervention.affectationsIntervention.some(aff => {
      return user.salarieId === aff.salarieId && aff.actif
    }) ||
    user.salarieId === intervention.responsableId ||
    user.salarieId === intervention.salarieId
  )

  if (!hasAccess) {
    return (
      <div className="flex h-screen overflow-hidden">
        <SidebarWrapper />
        <div className="flex-1 flex flex-col lg:ml-52">
          <Header 
            title="Accès refusé" 
            perimetres={await prisma.perimetre.findMany({
              where: { actif: true },
              orderBy: { nom: 'asc' }
            })}
          />
          <main className="flex-1 overflow-y-auto p-6">
            <div className="max-w-7xl mx-auto">
              <div className="card text-center py-12">
                <p className="text-gray-500 mb-4">Vous n'avez pas accès à cette intervention</p>
                <p className="text-sm text-gray-400">
                  Seuls les profils PREPA, CE, RDC, CAFF et les ouvriers affectés à cette intervention peuvent y accéder
                </p>
              </div>
            </div>
          </main>
        </div>
      </div>
    )
  }

  // Vérifier si l'utilisateur peut accéder aux aspects financiers
  const canViewFinancial = ['PREPA', 'CE', 'RDC', 'CAFF', 'ADMIN'].includes(user.role)

  // Récupérer les périmètres actifs
  const perimetres = await prisma.perimetre.findMany({
    where: { actif: true },
    orderBy: { nom: 'asc' }
  })

  return (
    <div className="flex h-screen overflow-hidden">
      <SidebarWrapper />
      
      <div className="flex-1 flex flex-col lg:ml-52">
        <Header title={intervention.titre} perimetres={perimetres} />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            <DetailIntervention 
              intervention={interventionWithRdc as any} 
              user={user} 
              canViewFinancial={canViewFinancial}
            />
          </div>
        </main>
      </div>
    </div>
  )
}
