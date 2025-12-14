import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

// GET - Récupérer les données pour le calendrier (affectations et interventions)
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user || !['PREPA', 'CE', 'RDC', 'CAFF', 'ADMIN'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const dateDebut = searchParams.get('dateDebut')
    const dateFin = searchParams.get('dateFin')

    // Dates par défaut : mois en cours
    const startDate = dateDebut ? new Date(dateDebut) : new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    const endDate = dateFin ? new Date(dateFin) : new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0, 23, 59, 59)

    // Récupérer les affectations de planning
    const affectations = await prisma.affectationPlanning.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        salarie: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            poste: true
          }
        },
        chantier: {
          select: {
            id: true,
            nom: true,
            adresse: true
          }
        }
      },
      orderBy: { date: 'asc' }
    })

    // Récupérer les interventions
    const interventions = await prisma.intervention.findMany({
      where: {
        OR: [
          {
            dateDebut: {
              gte: startDate,
              lte: endDate
            }
          },
          {
            dateFin: {
              gte: startDate,
              lte: endDate
            }
          },
          {
            AND: [
              { dateDebut: { lte: startDate } },
              { dateFin: { gte: endDate } }
            ]
          }
        ]
      },
      include: {
        chantier: {
          select: {
            id: true,
            nom: true
          }
        },
        responsable: {
          select: {
            id: true,
            nom: true,
            prenom: true
          }
        }
      },
      orderBy: { dateDebut: 'asc' }
    })

    // Fonction helper pour extraire uniquement la partie date (YYYY-MM-DD)
    const getDateOnly = (dateValue: Date | string): string => {
      let d: Date
      if (typeof dateValue === 'string') {
        const datePart = dateValue.split('T')[0]
        const [y, m, d_val] = datePart.split('-').map(Number)
        d = new Date(y, m - 1, d_val)
      } else {
        d = dateValue
      }
      const y = d.getFullYear()
      const m = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      return `${y}-${m}-${day}`
    }

    // Convertir les dates de début et fin en strings pour la comparaison
    const startDateStr = getDateOnly(startDate)
    const endDateStr = getDateOnly(endDate)

    // Récupérer TOUS les congés validés ou en attente dans la plage de dates
    // On affiche les congés validés ET en attente pour une meilleure visibilité
    const allConges = await prisma.conge.findMany({
      where: {
        statut: { in: ['valide', 'en_attente'] }
      },
      include: {
        salarie: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            poste: true
          }
        }
      }
    })

    // Filtrer les congés qui se chevauchent avec la plage de dates
    const congesFiltered = allConges.filter(conge => {
      const dateDebutStr = getDateOnly(conge.dateDebut)
      const dateFinStr = getDateOnly(conge.dateFin)
      
      // Vérifier si la plage du congé se chevauche avec la plage demandée
      return dateDebutStr <= endDateStr && dateFinStr >= startDateStr
    })

    // Récupérer les formations dans la plage de dates
    const formations = await prisma.formationSalarie.findMany({
      where: {
        dateFormation: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        salarie: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            poste: true
          }
        }
      }
    })

    // Récupérer les salariés absents (statut = 'congé' ou 'inactif')
    const salariesAbsents = await prisma.salarie.findMany({
      where: {
        statut: { in: ['congé', 'inactif'] }
      },
      select: {
        id: true,
        nom: true,
        prenom: true,
        poste: true,
        statut: true
      }
    })

    return NextResponse.json({
      affectations,
      interventions,
      conges: congesFiltered,
      formations,
      salariesAbsents
    })
  } catch (error) {
    console.error('Error fetching calendar data:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des données du calendrier' },
      { status: 500 }
    )
  }
}



