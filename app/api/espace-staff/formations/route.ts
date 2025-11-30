import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

// GET - Récupérer toutes les formations
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user || !['PREPA', 'CE', 'RDC', 'CAFF', 'ADMIN'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    // Récupérer le périmètre de l'utilisateur
    let perimetreId: string | null = null
    
    if (user.salarieId) {
      const salarie = await prisma.salarie.findUnique({
        where: { id: user.salarieId },
        select: {
          perimetreId: true,
          salariePerimetres: {
            where: { dateFin: null },
            select: { perimetreId: true }
          }
        }
      })
      
      perimetreId = salarie?.perimetreId || salarie?.salariePerimetres[0]?.perimetreId || null
    }

    // Récupérer les formations des salariés du périmètre
    const formations = await prisma.formationSalarie.findMany({
      where: perimetreId ? {
        salarie: {
          OR: [
            { perimetreId },
            {
              salariePerimetres: {
                some: {
                  perimetreId,
                  dateFin: null
                }
              }
            }
          ]
        }
      } : {},
      include: {
        salarie: {
          select: {
            id: true,
            nom: true,
            prenom: true
          }
        }
      },
      orderBy: { dateFormation: 'desc' }
    })

    return NextResponse.json(formations)
  } catch (error) {
    console.error('Error fetching formations:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des formations' },
      { status: 500 }
    )
  }
}

// POST - Créer une nouvelle formation
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user || !['PREPA', 'CE', 'RDC', 'CAFF', 'ADMIN'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { salarieId, nom, organisme, dateFormation, dateExpiration, duree, fichierUrl } = body

    if (!salarieId || !nom || !dateFormation) {
      return NextResponse.json(
        { error: 'Le salarié, le nom et la date de formation sont requis' },
        { status: 400 }
      )
    }

    const formation = await prisma.formationSalarie.create({
      data: {
        salarieId,
        nom,
        organisme: organisme || null,
        dateFormation: new Date(dateFormation),
        dateExpiration: dateExpiration ? new Date(dateExpiration) : null,
        duree: duree ? parseFloat(duree) : null,
        fichierUrl: fichierUrl || null
      },
      include: {
        salarie: {
          select: {
            id: true,
            nom: true,
            prenom: true
          }
        }
      }
    })

    return NextResponse.json(formation, { status: 201 })
  } catch (error) {
    console.error('Error creating formation:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création de la formation' },
      { status: 500 }
    )
  }
}



