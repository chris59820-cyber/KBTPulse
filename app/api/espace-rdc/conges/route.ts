import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

// GET - Récupérer les congés RTT en attente pour le RDC
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user || !['RDC', 'CAFF', 'ADMIN'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'RTT'
    const statut = searchParams.get('statut') || 'en_attente'

    // Récupérer le salarié RDC
    const salarieRDC = user.salarieId ? await prisma.salarie.findUnique({
      where: { id: user.salarieId }
    }) : null

    const conges = await prisma.conge.findMany({
      where: {
        type,
        statut,
        salarie: {
          rdcId: salarieRDC?.id || user.salarieId || user.id
        }
      },
      include: {
        salarie: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            matricule: true
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
