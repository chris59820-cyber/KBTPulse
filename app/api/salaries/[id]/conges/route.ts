import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

// GET - Récupérer les congés d'un salarié
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    
    if (!user || !['PREPA', 'CE', 'RDC', 'CAFF', 'ADMIN'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const statut = searchParams.get('statut') || 'valide'

    const conges = await prisma.conge.findMany({
      where: {
        salarieId: params.id,
        statut: statut as any
      },
      orderBy: { dateDebut: 'desc' }
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



