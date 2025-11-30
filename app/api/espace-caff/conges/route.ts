import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

// GET - Récupérer les congés en attente pour validation CAFF
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user || !['CAFF', 'ADMIN'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const statut = searchParams.get('statut') || 'en_attente'

    const conges = await prisma.conge.findMany({
      where: {
        statut,
        salarie: {
          user: {
            role: { in: ['OUVRIER', 'CE'] }
          }
        }
      },
      include: {
        salarie: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            matricule: true,
            user: {
              select: {
                role: true
              }
            }
          }
        }
      },
      orderBy: { dateDebut: 'asc' }
    })

    return NextResponse.json(conges)
  } catch (error) {
    console.error('Error fetching conges:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des congés' },
      { status: 500 }
    )
  }
}
