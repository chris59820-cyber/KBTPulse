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

    return NextResponse.json({
      affectations,
      interventions
    })
  } catch (error) {
    console.error('Error fetching calendar data:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des données du calendrier' },
      { status: 500 }
    )
  }
}



